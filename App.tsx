
import React, { useState } from 'react';
import { CrmProvider } from './context/CrmContext';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import LeadListView from './views/LeadListView';
import AccountListView from './views/AccountListView';
import LeadDetailView from './views/LeadDetailView';
import AccountDetailView from './views/AccountDetailView';
import TaskListView from './views/TaskListView';
import AICallsView from './views/AICallsView';

type View = 'dashboard' | 'leads' | 'accounts' | 'tasks' | 'ai';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

    const handleShowLeadDetail = (id: string) => setSelectedLeadId(id);
    const handleCloseLeadDetail = () => setSelectedLeadId(null);
    const handleShowAccountDetail = (id: string) => setSelectedAccountId(id);
    const handleCloseAccountDetail = () => setSelectedAccountId(null);
    
    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView />;
            case 'leads':
                return <LeadListView onShowLeadDetail={handleShowLeadDetail} />;
            case 'accounts':
                return <AccountListView onShowAccountDetail={handleShowAccountDetail} />;
            case 'tasks':
                return <TaskListView />;
            case 'ai':
                return <AICallsView />;
            default:
                return <DashboardView />;
        }
    }

    return (
        <CrmProvider>
            <div className="bg-gray-900 text-white min-h-screen font-sans">
                <Header currentView={currentView} onNavigate={(view) => setCurrentView(view as View)} />
                <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                    {renderView()}
                </main>
                {selectedLeadId && <LeadDetailView leadId={selectedLeadId} onClose={handleCloseLeadDetail} />}
                {selectedAccountId && <AccountDetailView accountId={selectedAccountId} onClose={handleCloseAccountDetail} />}
            </div>
        </CrmProvider>
    );
};

export default App;
