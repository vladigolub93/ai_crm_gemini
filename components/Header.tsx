
import React from 'react';

type View = 'dashboard' | 'leads' | 'accounts' | 'tasks' | 'ai';

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
    const NavItem = ({ view, children }: { view: View, children: React.ReactNode }) => {
        const isActive = currentView === view;
        return (
            <button 
                onClick={() => onNavigate(view)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
                {children}
            </button>
        );
    };

    return (
        <header className="bg-gray-800 shadow-md">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-white font-bold text-xl">AI CRM</span>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                       {/* FIX: Explicitly passing the 'children' prop to resolve TypeScript errors where JSX children were not being inferred correctly. */}
                       <NavItem view="dashboard" children="Dashboard" />
                       <NavItem view="leads" children="Leads" />
                       <NavItem view="accounts" children="Accounts" />
                       <NavItem view="tasks" children="Tasks" />
                       <NavItem view="ai" children="AI Usage" />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
