import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OpportunityRepository } from '../../infrastructure/repositories/opportunity.repository';
import type { Opportunity, CreateOpportunity, UpdateOpportunity, OpportunityFilter, OpportunitySort } from '../../domain/schemas/opportunity.schema';
import { ApiError } from '../../infrastructure/api/apiClient';

const opportunityRepository = new OpportunityRepository();

export const OPPORTUNITY_QUERY_KEYS = {
  all: ['opportunities'] as const,
  lists: () => [...OPPORTUNITY_QUERY_KEYS.all, 'list'] as const,
  list: (filter?: OpportunityFilter, sort?: OpportunitySort) => 
    [...OPPORTUNITY_QUERY_KEYS.lists(), { filter, sort }] as const,
  details: () => [...OPPORTUNITY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...OPPORTUNITY_QUERY_KEYS.details(), id] as const,
  byLead: (leadId: string) => [...OPPORTUNITY_QUERY_KEYS.all, 'byLead', leadId] as const,
  metrics: () => [...OPPORTUNITY_QUERY_KEYS.all, 'metrics'] as const,
};

export function useOpportunities(filter?: OpportunityFilter, sort?: OpportunitySort) {
  return useQuery({
    queryKey: OPPORTUNITY_QUERY_KEYS.list(filter, sort),
    queryFn: () => opportunityRepository.findAll(filter, sort),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: OPPORTUNITY_QUERY_KEYS.detail(id),
    queryFn: () => opportunityRepository.findById(id),
    enabled: !!id,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useOpportunityByLead(leadId: string) {
  return useQuery({
    queryKey: OPPORTUNITY_QUERY_KEYS.byLead(leadId),
    queryFn: () => opportunityRepository.findByLeadId(leadId),
    enabled: !!leadId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOpportunity) => opportunityRepository.create(data),
    onSuccess: (newOpportunity) => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.lists() });
      queryClient.setQueryData(OPPORTUNITY_QUERY_KEYS.detail(newOpportunity.id), newOpportunity);
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.byLead(newOpportunity.leadId) });
    },
    onError: (error) => {
      console.error('Failed to create opportunity:', error);
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateOpportunity) => opportunityRepository.update(data),
    onMutate: async (updatedOpportunity) => {
      await queryClient.cancelQueries({ 
        queryKey: OPPORTUNITY_QUERY_KEYS.detail(updatedOpportunity.id) 
      });
      
      const previousOpportunity = queryClient.getQueryData<Opportunity>(
        OPPORTUNITY_QUERY_KEYS.detail(updatedOpportunity.id)
      );
      
      if (previousOpportunity) {
        queryClient.setQueryData(OPPORTUNITY_QUERY_KEYS.detail(updatedOpportunity.id), {
          ...previousOpportunity,
          ...updatedOpportunity,
          updatedAt: new Date().toISOString(),
        });
      }
      
      return { previousOpportunity };
    },
    onError: (error, updatedOpportunity, context) => {
      if (context?.previousOpportunity) {
        queryClient.setQueryData(
          OPPORTUNITY_QUERY_KEYS.detail(updatedOpportunity.id),
          context.previousOpportunity
        );
      }
      console.error('Failed to update opportunity:', error);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: OPPORTUNITY_QUERY_KEYS.detail(variables.id) 
      });
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.lists() });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => opportunityRepository.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.detail(deletedId) });
    },
    onError: (error) => {
      console.error('Failed to delete opportunity:', error);
    },
  });
}

export function useOpportunityMetrics(filter?: OpportunityFilter) {
  return useQuery({
    queryKey: [...OPPORTUNITY_QUERY_KEYS.metrics(), { filter }],
    queryFn: async () => {
      const [count, revenue] = await Promise.all([
        opportunityRepository.count(filter),
        opportunityRepository.getTotalRevenue(filter),
      ]);
      return { count, revenue };
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}