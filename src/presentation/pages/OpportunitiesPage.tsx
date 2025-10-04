import { Link } from 'react-router-dom';
import { OpportunitiesList } from '../components/opportunities/OpportunitiesList';
import { Button } from '../components/ui/Button';
import { ArrowLeft, TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
import { useOpportunities, useOpportunityMetrics } from '../../application/hooks/useOpportunities';

export function OpportunitiesPage() {
  const { data: opportunities = [] } = useOpportunities();
  const { data: metrics } = useOpportunityMetrics();

  const totalOpportunities = opportunities.length;
  const activeOpportunities = opportunities.filter(opp => !['closed_won', 'closed_lost'].includes(opp.stage)).length;
  const wonOpportunities = opportunities.filter(opp => opp.stage === 'closed_won').length;
  const avgAmount = opportunities.length > 0 ? Math.round(opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0) / opportunities.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
                  Sales Pipeline
                </h1>
                <p className="text-sm text-slate-600 mt-1 font-medium">Track and manage your opportunities</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/leads">
                <Button variant="secondary" className="font-medium">
                  <Target className="h-4 w-4 mr-2" />
                  View Leads
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Revenue Pipeline</h2>
              <p className="text-emerald-100">Total value of your active opportunities</p>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold text-white mb-1">${(metrics?.revenue || 0).toLocaleString()}</p>
              <p className="text-emerald-100 text-sm font-medium">Total Pipeline Value</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold text-white mb-1">{totalOpportunities}</p>
              <p className="text-emerald-100 text-sm font-medium">Total Opportunities</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold text-white mb-1">${avgAmount.toLocaleString()}</p>
              <p className="text-emerald-100 text-sm font-medium">Average Deal Size</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{totalOpportunities}</p>
                <p className="text-xs text-slate-600 font-medium">Total Opps</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{activeOpportunities}</p>
                <p className="text-xs text-slate-600 font-medium">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{wonOpportunities}</p>
                <p className="text-xs text-slate-600 font-medium">Won</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{Math.round((wonOpportunities / Math.max(totalOpportunities, 1)) * 100)}%</p>
                <p className="text-xs text-slate-600 font-medium">Win Rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-emerald-50/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Sales Pipeline</h2>
                  <p className="text-sm text-slate-600">All opportunities in your sales pipeline</p>
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

          <div className="p-0">
            <OpportunitiesList />
          </div>
        </div>
      </main>
    </div>
  );
}