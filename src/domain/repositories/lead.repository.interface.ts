import type { Lead, CreateLead, UpdateLead, LeadFilter, LeadSort } from '../schemas/lead.schema';

export interface ILeadRepository {
  findAll(filter?: LeadFilter, sort?: LeadSort): Promise<Lead[]>;
  findById(id: string): Promise<Lead | null>;
  create(data: CreateLead): Promise<Lead>;
  update(data: UpdateLead): Promise<Lead>;
  delete(id: string): Promise<boolean>;
  convertToOpportunity(leadId: string, opportunityId: string): Promise<Lead>;
  count(filter?: LeadFilter): Promise<number>;
}