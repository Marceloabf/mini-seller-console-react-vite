import type { Lead } from "../../domain/schemas/lead.schema";
import type { Opportunity } from "../../domain/schemas/opportunity.schema";
import { LocalStorageService } from "../storage/localStorage.service";
import leadsData from "../../data/leads.json";

interface Database {
  leads: Map<string, Lead>;
  opportunities: Map<string, Opportunity>;
}

export class InMemoryDatabase {
  private static instance: InMemoryDatabase;
  private db: Database;
  private storage: LocalStorageService;
  private readonly STORAGE_KEY = "mini_seller_console_db";

  private constructor() {
    this.storage = LocalStorageService.getInstance();
    this.db = {
      leads: new Map(),
      opportunities: new Map(),
    };
    this.loadFromStorage();
  }

  static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  private loadFromStorage(): void {
    const stored = this.storage.get<{
      leads: [string, Lead][];
      opportunities: [string, Opportunity][];
    }>(this.STORAGE_KEY);

    if (stored) {
      this.db.leads = new Map(stored.leads);
      this.db.opportunities = new Map(stored.opportunities);
    } else {
      this.seedInitialData();
    }
  }

  private saveToStorage(): void {
    const data = {
      leads: Array.from(this.db.leads.entries()),
      opportunities: Array.from(this.db.opportunities.entries()),
    };
    this.storage.set(this.STORAGE_KEY, data);
  }

  private seedInitialData(): void {
    const initialLeads = leadsData.map((lead) => ({ ...lead })) as Lead[];

    initialLeads.forEach((lead) => {
      this.db.leads.set(lead.id, lead);
    });

    this.saveToStorage();
  }

  getLeads(): Map<string, Lead> {
    return new Map(this.db.leads);
  }

  getLead(id: string): Lead | undefined {
    return this.db.leads.get(id);
  }

  setLead(lead: Lead): void {
    this.db.leads.set(lead.id, lead);
    this.saveToStorage();
  }

  deleteLead(id: string): boolean {
    const result = this.db.leads.delete(id);
    if (result) {
      this.saveToStorage();
    }
    return result;
  }

  getOpportunities(): Map<string, Opportunity> {
    return new Map(this.db.opportunities);
  }

  getOpportunity(id: string): Opportunity | undefined {
    return this.db.opportunities.get(id);
  }

  setOpportunity(opportunity: Opportunity): void {
    this.db.opportunities.set(opportunity.id, opportunity);
    this.saveToStorage();
  }

  deleteOpportunity(id: string): boolean {
    const result = this.db.opportunities.delete(id);
    if (result) {
      this.saveToStorage();
    }
    return result;
  }

  reset(): void {
    this.db.leads.clear();
    this.db.opportunities.clear();
    this.seedInitialData();
  }
}
