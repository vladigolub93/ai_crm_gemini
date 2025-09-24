
import React from 'react';
import { useCrm } from '../context/CrmContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardView: React.FC = () => {
    const { leads, accounts } = useCrm();

    const linkedLeadsCount = leads.filter(l => l.accountId).length;
    const unlinkedLeadsCount = leads.length - linkedLeadsCount;

    const accountsWithLeads = accounts.map(account => ({
        name: account.name,
        leads: account.leadIds.length
    })).filter(a => a.leads > 0).sort((a,b) => b.leads - a.leads).slice(0, 10);

    const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="bg-gray-700 p-3 rounded-full">{icon}</div>
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Leads" 
                    value={leads.length} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                />
                <StatCard 
                    title="Total Accounts" 
                    value={accounts.length} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                />
                <StatCard 
                    title="Linked Leads" 
                    value={`${linkedLeadsCount} (${leads.length > 0 ? Math.round((linkedLeadsCount / leads.length) * 100) : 0}%)`} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                />
                 <StatCard 
                    title="Unlinked Leads" 
                    value={unlinkedLeadsCount} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
                />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Top 10 Accounts by Lead Count</h3>
                {accountsWithLeads.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={accountsWithLeads} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="name" stroke="#A0AEC0" />
                            <YAxis stroke="#A0AEC0" />
                            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', color: '#E2E8F0' }} />
                            <Legend wrapperStyle={{ color: '#E2E8F0' }}/>
                            <Bar dataKey="leads" fill="#4299E1" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center py-10">No accounts with linked leads to display.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardView;
