import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Lead } from '../../domain/schemas/lead.schema';
import { LeadsList } from '../components/leads/LeadsList';
import { LeadDetails } from '../components/leads/LeadDetails';
import { AddLeadModal } from '../components/leads/AddLeadModal';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Users, Target, TrendingUp, Filter, Plus } from 'lucide-react';
import { useLeads } from '../../application/hooks/useLeads';

export function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: leads = [] } = useLeads();

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  const handleConversionSuccess = () => {
    console.log('Lead converted successfully!');
  };

  const handleAddSuccess = () => {
    console.log('Lead created successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/home">
                <Button variant="ghost" size="sm" className="mr-4 hover:bg-slate-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Lead Management Console
                </h1>
                <p className="text-sm text-slate-600 mt-1 font-medium">Track, score, and convert your prospects</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/opportunities">
                <Button variant="secondary" className="font-medium">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Pipeline
                </Button>
              </Link>
              <Button
                variant="primary"
                className="font-medium"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{totalLeads}</p>
                <p className="text-xs text-slate-600 font-medium">Total Leads</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{qualifiedLeads}</p>
                <p className="text-xs text-slate-600 font-medium">Qualified</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{conversionRate}%</p>
                <p className="text-xs text-slate-600 font-medium">Conversion</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg mr-3">
                <Filter className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{convertedLeads}</p>
                <p className="text-xs text-slate-600 font-medium">Converted</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-blue-50/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">All Leads</h2>
                  <p className="text-sm text-slate-600">Click any lead to view details and actions</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Live Data
                </div>
              </div>
            </div>
          </div>

          <div className="h-[calc(100vh-280px)] overflow-hidden">
            <LeadsList onSelectLead={handleSelectLead} />
          </div>
        </div>
      </main>

      <LeadDetails
        lead={selectedLead}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onConversionSuccess={handleConversionSuccess}
      />

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}