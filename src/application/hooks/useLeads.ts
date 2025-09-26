import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeadRepository } from '../../infrastructure/repositories/lead.repository';
import type { Lead, CreateLead, UpdateLead, LeadFilter, LeadSort } from '../../domain/schemas/lead.schema';
import { ApiError } from '../../infrastructure/api/apiClient';

const leadRepository = new LeadRepository();

export const LEAD_QUERY_KEYS = {
  all: ['leads'] as const,
  lists: () => [...LEAD_QUERY_KEYS.all, 'list'] as const,
  list: (filter?: LeadFilter, sort?: LeadSort) => 
    [...LEAD_QUERY_KEYS.lists(), { filter, sort }] as const,
  details: () => [...LEAD_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...LEAD_QUERY_KEYS.details(), id] as const,
};

export function useLeads(filter?: LeadFilter, sort?: LeadSort) {
  return useQuery({
    queryKey: LEAD_QUERY_KEYS.list(filter, sort),
    queryFn: () => leadRepository.findAll(filter, sort),
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

export function useLead(id: string) {
  return useQuery({
    queryKey: LEAD_QUERY_KEYS.detail(id),
    queryFn: () => leadRepository.findById(id),
    enabled: !!id,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLead) => leadRepository.create(data),
    onSuccess: (newLead) => {
      queryClient.invalidateQueries({ queryKey: LEAD_QUERY_KEYS.lists() });
      queryClient.setQueryData(LEAD_QUERY_KEYS.detail(newLead.id), newLead);
    },
    onError: (error) => {
      console.error('Failed to create lead:', error);
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateLead) => leadRepository.update(data),
    onMutate: async (updatedLead) => {
      await queryClient.cancelQueries({ queryKey: LEAD_QUERY_KEYS.detail(updatedLead.id) });
      
      const previousLead = queryClient.getQueryData<Lead>(
        LEAD_QUERY_KEYS.detail(updatedLead.id)
      );
      
      if (previousLead) {
        queryClient.setQueryData(LEAD_QUERY_KEYS.detail(updatedLead.id), {
          ...previousLead,
          ...updatedLead,
          updatedAt: new Date().toISOString(),
        });
      }
      
      return { previousLead };
    },
    onError: (error, updatedLead, context) => {
      if (context?.previousLead) {
        queryClient.setQueryData(
          LEAD_QUERY_KEYS.detail(updatedLead.id),
          context.previousLead
        );
      }
      console.error('Failed to update lead:', error);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: LEAD_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: LEAD_QUERY_KEYS.lists() });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => leadRepository.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: LEAD_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: LEAD_QUERY_KEYS.detail(deletedId) });
    },
    onError: (error) => {
      console.error('Failed to delete lead:', error);
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, opportunityId }: { leadId: string; opportunityId: string }) =>
      leadRepository.convertToOpportunity(leadId, opportunityId),
    onSuccess: (updatedLead) => {
      queryClient.invalidateQueries({ queryKey: LEAD_QUERY_KEYS.lists() });
      queryClient.setQueryData(LEAD_QUERY_KEYS.detail(updatedLead.id), updatedLead);
    },
    onError: (error) => {
      console.error('Failed to convert lead:', error);
    },
  });
}