import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Users } from 'lucide-react';
import type { Lead, LeadFilter, LeadSort, LeadStatus } from '../../../domain/schemas/lead.schema';
import { useLeads } from '../../../application/hooks/useLeads';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { formatScore } from '../../../shared/utils/formatters';
import { cn } from '../../../shared/utils/cn';

interface LeadsListProps {
  onSelectLead: (lead: Lead) => void;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const statusVariants: Record<LeadStatus, 'info' | 'warning' | 'success' | 'default' | 'danger'> = {
  new: 'info',
  contacted: 'warning',
  qualified: 'success',
  converted: 'default',
  lost: 'danger',
};

export function LeadsList({ onSelectLead }: LeadsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<LeadSort['field']>('score');
  const [sortDirection, setSortDirection] = useState<LeadSort['direction']>('desc');
  
  const filter: LeadFilter = useMemo(() => ({
    search: search || undefined,
    status: statusFilter ? (statusFilter as LeadStatus) : undefined,
  }), [search, statusFilter]);
  
  const sort: LeadSort = useMemo(() => ({
    field: sortField,
    direction: sortDirection,
  }), [sortField, sortDirection]);
  
  const { data: leads, isLoading, error, refetch } = useLeads(filter, sort);
  
  const handleSort = (field: LeadSort['field']) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const SortIcon = ({ field }: { field: LeadSort['field'] }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            {leads?.length || 0} leads
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            className="w-40"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {isLoading && <LoadingState message="Loading leads..." />}
        
        {error && (
          <ErrorState
            title="Failed to load leads"
            message={error.message}
            onRetry={refetch}
          />
        )}
        
        {!isLoading && !error && leads?.length === 0 && (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No leads found"
            description={search || statusFilter ? 
              "Try adjusting your filters to see more leads." : 
              "Start by adding your first lead to the system."}
          />
        )}
        
        {!isLoading && !error && leads && leads.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Name
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('company')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Company
                    <SortIcon field="company" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th
                  onClick={() => handleSort('score')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Score
                    <SortIcon field="score" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lead.source}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={cn(
                      'inline-flex items-center px-2 py-1 rounded text-sm font-medium',
                      lead.score >= 80 ? 'bg-green-100 text-green-800' :
                      lead.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {formatScore(lead.score)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusVariants[lead.status]}>
                      {lead.status}
                    </Badge>
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