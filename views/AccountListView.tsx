
import React from 'react';
import { useCrm } from '../context/CrmContext';
import CSVUploader from '../components/CSVUploader';
import type { Account } from '../types';

interface AccountListViewProps {
    onShowAccountDetail: (id: string) => void;
}

const AccountListView: React.FC<AccountListViewProps> = ({ onShowAccountDetail }) => {
  const { accounts, addAccounts } = useCrm();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white">Accounts ({accounts.length})</h2>
        <CSVUploader<Omit<Account, 'id' | 'leadIds' | 'news'>> onDataLoaded={addAccounts} buttonText="Upload Accounts CSV" />
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Website</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sector</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Linked Leads</th>
                </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
                {accounts.length > 0 ? accounts.map((account) => (
                <tr key={account.id} onClick={() => onShowAccountDetail(account.id)} className="hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{account.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" onClick={e => e.stopPropagation()}>{account.website}</a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{account.sector || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{account.leadIds.length}</td>
                </tr>
                )) : (
                    <tr>
                        <td colSpan={4} className="text-center py-10 text-gray-500">
                            No accounts found. Upload a CSV to get started.
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

export default AccountListView;
