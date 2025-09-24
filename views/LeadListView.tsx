
import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import CSVUploader from '../components/CSVUploader';
import { linkLeadsAndAccounts } from '../services/geminiService';
import type { Lead } from '../types';
import Spinner from '../components/Spinner';

interface LeadListViewProps {
    onShowLeadDetail: (id: string) => void;
}

const LeadListView: React.FC<LeadListViewProps> = ({ onShowLeadDetail }) => {
  const { leads, accounts, addLeads, linkLeadsToAccounts: contextLinker } = useCrm();
  const [isLoading, setIsLoading] = useState(false);

  const handleLink = async () => {
    if (leads.length === 0 || accounts.length === 0) {
      alert("Please upload both leads and accounts before linking.");
      return;
    }
    setIsLoading(true);
    try {
      const links = await linkLeadsAndAccounts(leads, accounts);
      contextLinker(links);
      alert(`${links.length} leads successfully linked to accounts!`);
    } catch (error) {
      console.error(error);
      alert("Failed to link leads to accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountName = (accountId?: string) => {
      if (!accountId) return <span className="text-gray-500">Not Linked</span>;
      const account = accounts.find(a => a.id === accountId);
      return account ? account.name : <span className="text-yellow-500">Account Not Found</span>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white">Leads ({leads.length})</h2>
        <div className="flex items-center gap-4">
          <CSVUploader<Omit<Lead, 'id' | 'accountId'>> onDataLoaded={addLeads} buttonText="Upload Leads CSV" />
           <button 
                onClick={handleLink}
                disabled={isLoading || leads.length === 0 || accounts.length === 0}
                className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isLoading ? <Spinner size="sm" /> : "Link Leads with AI"}
            </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Linked Account</th>
                </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
                {leads.length > 0 ? leads.map((lead) => (
                <tr key={lead.id} onClick={() => onShowLeadDetail(lead.id)} className="hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{lead.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lead.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lead.companyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getAccountName(lead.accountId)}</td>
                </tr>
                )) : (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500">
                        No leads found. Upload a CSV to get started.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default LeadListView;
