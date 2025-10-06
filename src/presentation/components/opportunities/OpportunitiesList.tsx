import { TrendingUp, DollarSign } from 'lucide-react';
import { useOpportunities, useOpportunityMetrics } from '../../../application/hooks/useOpportunities';
import { Badge } from '../ui/Badge';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import type { OpportunityStage } from '../../../domain/schemas/opportunity.schema';

const stageVariants: Record<OpportunityStage, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  prospecting: 'info',
  qualification: 'warning',
  proposal: 'default',
  negotiation: 'warning',
  closed_won: 'success',
  closed_lost: 'danger',
};

const stageLabels: Record<OpportunityStage, string> = {
  prospecting: 'Prospecting',
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export function OpportunitiesList() {
  const { data: opportunities, isLoading, error, refetch } = useOpportunities();
  const { data: metrics } = useOpportunityMetrics();
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Opportunities</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <TrendingUp className="h-4 w-4" />
              {metrics?.count || 0} opportunities
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(metrics?.revenue || 0)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto max-h-96">
        {isLoading && <LoadingState message="Loading opportunities..." />}
        
        {error && (
          <ErrorState
            title="Failed to load opportunities"
            message={error.message}
            onRetry={refetch}
          />
        )}
        
        {!isLoading && !error && opportunities?.length === 0 && (
          <EmptyState
            icon={<TrendingUp className="h-12 w-12" />}
            title="No opportunities yet"
            description="Convert qualified leads to create opportunities."
          />
        )}
        
        {!isLoading && !error && opportunities && opportunities.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {opportunities.map((opportunity) => (
                <tr key={opportunity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {opportunity.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {opportunity.accountName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={stageVariants[opportunity.stage]}>
                      {stageLabels[opportunity.stage]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {opportunity.amount ? formatCurrency(opportunity.amount) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {opportunity.probability}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(opportunity.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}