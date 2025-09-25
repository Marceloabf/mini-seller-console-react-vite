import type { Opportunity, CreateOpportunity, UpdateOpportunity, OpportunityFilter, OpportunitySort } from '../schemas/opportunity.schema';

export interface IOpportunityRepository {
  findAll(filter?: OpportunityFilter, sort?: OpportunitySort): Promise<Opportunity[]>;
  findById(id: string): Promise<Opportunity | null>;
  findByLeadId(leadId: string): Promise<Opportunity | null>;
  create(data: CreateOpportunity): Promise<Opportunity>;
  update(data: UpdateOpportunity): Promise<Opportunity>;
  delete(id: string): Promise<boolean>;
  count(filter?: OpportunityFilter): Promise<number>;
  getTotalRevenue(filter?: OpportunityFilter): Promise<number>;
}