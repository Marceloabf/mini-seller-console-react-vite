import { z } from 'zod';

export const LeadStatusEnum = z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']);
export const LeadSourceEnum = z.enum(['website', 'email', 'phone', 'referral', 'social', 'other']);

export const LeadSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  company: z.string().min(1, 'Company is required').max(100),
  email: z.email('Invalid email format'),
  source: LeadSourceEnum,
  score: z.number().min(0).max(100),
  status: LeadStatusEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  notes: z.string().optional(),
  phone: z.string().optional(),
  convertedToOpportunityId: z.string().uuid().optional(),
});

export const CreateLeadSchema = LeadSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  convertedToOpportunityId: true 
});

export const UpdateLeadSchema = LeadSchema.partial().required({ id: true });

export const LeadFilterSchema = z.object({
  status: LeadStatusEnum.optional(),
  source: LeadSourceEnum.optional(),
  minScore: z.number().min(0).max(100).optional(),
  maxScore: z.number().min(0).max(100).optional(),
  search: z.string().optional(),
});

export const LeadSortSchema = z.object({
  field: z.enum(['name', 'company', 'score', 'createdAt', 'updatedAt']),
  direction: z.enum(['asc', 'desc']),
});

export type Lead = z.infer<typeof LeadSchema>;
export type CreateLead = z.infer<typeof CreateLeadSchema>;
export type UpdateLead = z.infer<typeof UpdateLeadSchema>;
export type LeadStatus = z.infer<typeof LeadStatusEnum>;
export type LeadSource = z.infer<typeof LeadSourceEnum>;
export type LeadFilter = z.infer<typeof LeadFilterSchema>;
export type LeadSort = z.infer<typeof LeadSortSchema>;