import type { ILeadRepository } from '../../domain/repositories/lead.repository.interface';
import type { Lead, CreateLead, UpdateLead, LeadFilter, LeadSort } from '../../domain/schemas/lead.schema';
import { LeadSchema } from '../../domain/schemas/lead.schema';
import { InMemoryDatabase } from '../api/database';
import { ApiClient, ApiError } from '../api/apiClient';

export class LeadRepository implements ILeadRepository {
  private db: InMemoryDatabase;
  private api: ApiClient;
  
  constructor() {
    this.db = InMemoryDatabase.getInstance();
    this.api = ApiClient.getInstance();
  }
  
  async findAll(filter?: LeadFilter, sort?: LeadSort): Promise<Lead[]> {
    return this.api.request(() => {
      let leads = Array.from(this.db.getLeads().values());
      
      if (filter) {
        leads = this.applyFilter(leads, filter);
      }
      
      if (sort) {
        leads = this.applySort(leads, sort);
      }
      
      return leads;
    });
  }
  
  async findById(id: string): Promise<Lead | null> {
    return this.api.request(() => {
      const lead = this.db.getLead(id);
      return lead || null;
    });
  }
  
  async create(data: CreateLead): Promise<Lead> {
    return this.api.request(() => {
      const now = new Date().toISOString();
      const lead: Lead = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      
      const validated = LeadSchema.parse(lead);
      this.db.setLead(validated);
      return validated;
    });
  }
  
  async update(data: UpdateLead): Promise<Lead> {
    return this.api.request(() => {
      const existing = this.db.getLead(data.id);
      if (!existing) {
        throw new ApiError('Lead not found', 404, 'NOT_FOUND');
      }
      
      const updated: Lead = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      const validated = LeadSchema.parse(updated);
      this.db.setLead(validated);
      return validated;
    });
  }
  
  async delete(id: string): Promise<boolean> {
    return this.api.request(() => {
      const result = this.db.deleteLead(id);
      if (!result) {
        throw new ApiError('Lead not found', 404, 'NOT_FOUND');
      }
      return result;
    });
  }
  
  async convertToOpportunity(leadId: string, opportunityId: string): Promise<Lead> {
    return this.api.request(() => {
      const lead = this.db.getLead(leadId);
      if (!lead) {
        throw new ApiError('Lead not found', 404, 'NOT_FOUND');
      }
      
      const updated: Lead = {
        ...lead,
        status: 'converted',
        convertedToOpportunityId: opportunityId,
        updatedAt: new Date().toISOString(),
      };
      
      this.db.setLead(updated);
      return updated;
    });
  }
  
  async count(filter?: LeadFilter): Promise<number> {
    return this.api.request(() => {
      let leads = Array.from(this.db.getLeads().values());
      
      if (filter) {
        leads = this.applyFilter(leads, filter);
      }
      
      return leads.length;
    }, { skipDelay: true });
  }
  
  private applyFilter(leads: Lead[], filter: LeadFilter): Lead[] {
    return leads.filter(lead => {
      if (filter.status && lead.status !== filter.status) {
        return false;
      }
      
      if (filter.source && lead.source !== filter.source) {
        return false;
      }
      
      if (filter.minScore !== undefined && lead.score < filter.minScore) {
        return false;
      }
      
      if (filter.maxScore !== undefined && lead.score > filter.maxScore) {
        return false;
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesSearch = 
          lead.name.toLowerCase().includes(searchLower) ||
          lead.company.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  private applySort(leads: Lead[], sort: LeadSort): Lead[] {
    return [...leads].sort((a, b) => {
      let comparison = 0;
      
      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'company':
          comparison = a.company.localeCompare(b.company);
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }
}