import { z } from 'zod';

export const OpportunityStageEnum = z.enum([
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
]);

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  stage: OpportunityStageEnum,
  amount: z.number().min(0).optional(),
  accountName: z.string().min(1, 'Account name is required').max(100),
  leadId: z.string().uuid(),
  probability: z.number().min(0).max(100).default(50),
  expectedCloseDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  description: z.string().optional(),
  nextStep: z.string().optional(),
});

export const CreateOpportunitySchema = OpportunitySchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdateOpportunitySchema = OpportunitySchema.partial().required({ id: true });

export const OpportunityFilterSchema = z.object({
  stage: OpportunityStageEnum.optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  search: z.string().optional(),
});

export const OpportunitySortSchema = z.object({
  field: z.enum(['name', 'amount', 'stage', 'createdAt', 'updatedAt', 'expectedCloseDate']),
  direction: z.enum(['asc', 'desc']),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;
export type CreateOpportunity = z.infer<typeof CreateOpportunitySchema>;
export type UpdateOpportunity = z.infer<typeof UpdateOpportunitySchema>;
export type OpportunityStage = z.infer<typeof OpportunityStageEnum>;
export type OpportunityFilter = z.infer<typeof OpportunityFilterSchema>;
export type OpportunitySort = z.infer<typeof OpportunitySortSchema>;