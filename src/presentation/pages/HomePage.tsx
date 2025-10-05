import { Link } from 'react-router-dom';
import { Users, TrendingUp, Target, DollarSign, Calendar, Filter, ArrowUpRight, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useLeads } from '../../application/hooks/useLeads';
import { useOpportunityMetrics } from '../../application/hooks/useOpportunities';

export function HomePage() {
  const { data: leads = [] } = useLeads();
  const { data: metrics } = useOpportunityMetrics();

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
  const avgScore = leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length) : 0;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Mini Seller Console
              </h1>
              <p className="text-slate-600 mt-1 font-medium">Transform leads into opportunities with precision</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                System Online
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900">{totalLeads}</p>
              <p className="text-sm text-slate-600 font-medium">Total Leads</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900">{qualifiedLeads}</p>
              <p className="text-sm text-slate-600 font-medium">Qualified Leads</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
              <p className="text-sm text-slate-600 font-medium">Conversion Rate</p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900">${(metrics?.revenue || 0).toLocaleString()}</p>
              <p className="text-sm text-slate-600 font-medium">Pipeline Revenue</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Lead Management</h2>
                <p className="text-slate-600">Track, score, and convert your prospects into opportunities</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Average Score</span>
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-xl font-bold text-slate-900">{avgScore}/100</p>
              </div>
              <div className="bg-slate-50/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">This Month</span>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-xl font-bold text-slate-900">{totalLeads}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/leads" className="flex-1">
                <Button variant="primary" className="w-full h-12 text-base font-medium">
                  <Users className="h-5 w-5 mr-2" />
                  Manage All Leads
                </Button>
              </Link>
              <Link to="/leads">
                <Button variant="secondary" className="h-12 px-6 text-base font-medium">
                  <Filter className="h-5 w-5 mr-2" />
                  Quick Filter
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-6">

            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-white/80" />
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-white">{metrics?.count || 0}</p>
                  <p className="text-emerald-100 font-medium">Active Opportunities</p>
                </div>

                <Link to="/opportunities">
                  <Button
                    variant="ghost"
                    className="w-full bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 font-medium"
                  >
                    View Pipeline
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/leads">
                  <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-100">
                    <Users className="h-4 w-4 mr-3" />
                    View All Leads
                  </Button>
                </Link>
                <Link to="/opportunities">
                  <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-100">
                    <TrendingUp className="h-4 w-4 mr-3" />
                    Pipeline Review
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-100" disabled>
                  <Target className="h-4 w-4 mr-3" />
                  Analytics (Soon)
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{totalLeads}</p>
              <p className="text-sm text-slate-600">Total Leads Managed</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{qualifiedLeads}</p>
              <p className="text-sm text-slate-600">Ready for Conversion</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{conversionRate}%</p>
              <p className="text-sm text-slate-600">Success Rate</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}