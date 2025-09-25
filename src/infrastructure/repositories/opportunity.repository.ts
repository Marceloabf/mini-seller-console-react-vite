import type { IOpportunityRepository } from '../../domain/repositories/opportunity.repository.interface';
import type { Opportunity, CreateOpportunity, UpdateOpportunity, OpportunityFilter, OpportunitySort } from '../../domain/schemas/opportunity.schema';
import { OpportunitySchema } from '../../domain/schemas/opportunity.schema';
import { InMemoryDatabase } from '../api/database';
import { ApiClient, ApiError } from '../api/apiClient';

export class OpportunityRepository implements IOpportunityRepository {
  private db: InMemoryDatabase;
  private api: ApiClient;
  
  constructor() {
    this.db = InMemoryDatabase.getInstance();
    this.api = ApiClient.getInstance();
  }
  
  async findAll(filter?: OpportunityFilter, sort?: OpportunitySort): Promise<Opportunity[]> {
    return this.api.request(() => {
      let opportunities = Array.from(this.db.getOpportunities().values());
      
      if (filter) {
        opportunities = this.applyFilter(opportunities, filter);
      }
      
      if (sort) {
        opportunities = this.applySort(opportunities, sort);
      }
      
      return opportunities;
    });
  }
  
  async findById(id: string): Promise<Opportunity | null> {
    return this.api.request(() => {
      const opportunity = this.db.getOpportunity(id);
      return opportunity || null;
    });
  }
  
  async findByLeadId(leadId: string): Promise<Opportunity | null> {
    return this.api.request(() => {
      const opportunities = Array.from(this.db.getOpportunities().values());
      const opportunity = opportunities.find(opp => opp.leadId === leadId);
      return opportunity || null;
    });
  }
  
  async create(data: CreateOpportunity): Promise<Opportunity> {
    return this.api.request(() => {
      const now = new Date().toISOString();
      const opportunity: Opportunity = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      
      const validated = OpportunitySchema.parse(opportunity);
      this.db.setOpportunity(validated);
      return validated;
    });
  }
  
  async update(data: UpdateOpportunity): Promise<Opportunity> {
    return this.api.request(() => {
      const existing = this.db.getOpportunity(data.id);
      if (!existing) {
        throw new ApiError('Opportunity not found', 404, 'NOT_FOUND');
      }
      
      const updated: Opportunity = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      const validated = OpportunitySchema.parse(updated);
      this.db.setOpportunity(validated);
      return validated;
    });
  }
  
  async delete(id: string): Promise<boolean> {
    return this.api.request(() => {
      const result = this.db.deleteOpportunity(id);
      if (!result) {
        throw new ApiError('Opportunity not found', 404, 'NOT_FOUND');
      }
      return result;
    });
  }
  
  async count(filter?: OpportunityFilter): Promise<number> {
    return this.api.request(() => {
      let opportunities = Array.from(this.db.getOpportunities().values());
      
      if (filter) {
        opportunities = this.applyFilter(opportunities, filter);
      }
      
      return opportunities.length;
    }, { skipDelay: true });
  }
  
  async getTotalRevenue(filter?: OpportunityFilter): Promise<number> {
    return this.api.request(() => {
      let opportunities = Array.from(this.db.getOpportunities().values());
      
      if (filter) {
        opportunities = this.applyFilter(opportunities, filter);
      }
      
      return opportunities.reduce((total, opp) => total + (opp.amount || 0), 0);
    }, { skipDelay: true });
  }
  
  private applyFilter(opportunities: Opportunity[], filter: OpportunityFilter): Opportunity[] {
    return opportunities.filter(opp => {
      if (filter.stage && opp.stage !== filter.stage) {
        return false;
      }
      
      if (filter.minAmount !== undefined && (opp.amount || 0) < filter.minAmount) {
        return false;
      }
      
      if (filter.maxAmount !== undefined && (opp.amount || 0) > filter.maxAmount) {
        return false;
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesSearch = 
          opp.name.toLowerCase().includes(searchLower) ||
          opp.accountName.toLowerCase().includes(searchLower) ||
          (opp.description?.toLowerCase().includes(searchLower) || false);
        
        if (!matchesSearch) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  private applySort(opportunities: Opportunity[], sort: OpportunitySort): Opportunity[] {
    return [...opportunities].sort((a, b) => {
      let comparison = 0;
      
      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'amount':
          comparison = (a.amount || 0) - (b.amount || 0);
          break;
        case 'stage':
          comparison = a.stage.localeCompare(b.stage);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'expectedCloseDate': {
          const aDate = a.expectedCloseDate ? new Date(a.expectedCloseDate).getTime() : 0;
          const bDate = b.expectedCloseDate ? new Date(b.expectedCloseDate).getTime() : 0;
          comparison = aDate - bDate;
          break;
        }
      }
      
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }
}