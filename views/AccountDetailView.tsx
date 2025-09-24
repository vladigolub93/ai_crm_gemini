
import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { enrichAccountData } from '../services/geminiService';

interface AccountDetailViewProps {
    accountId: string;
    onClose: () => void;
}

const AccountDetailView: React.FC<AccountDetailViewProps> = ({ accountId, onClose }) => {
    const { accounts, leads, updateAccount, getAccountNews } = useCrm();
    const [isEnriching, setIsEnriching] = useState(false);
    const [isFetchingNews, setIsFetchingNews] = useState(false);

    const account = useMemo(() => accounts.find(a => a.id === accountId), [accounts, accountId]);
    const linkedLeads = useMemo(() => {
        if (!account) return [];
        return leads.filter(l => account.leadIds.includes(l.id));
    }, [leads, account]);

    const handleGetNews = async () => {
        if (!account) return;
        setIsFetchingNews(true);
        try {
            await getAccountNews(account.id);
        } catch (error) {
             console.error("Failed to fetch news:", error);
             alert('Failed to fetch news.');
        } finally {
            setIsFetchingNews(false);
        }
    };

    useEffect(() => {
        if(account && !account.news) {
            handleGetNews();
        }
    }, [account?.id]);

    if (!account) return null;

    const handleEnrich = async () => {
        setIsEnriching(true);
        try {
            const enrichedData = await enrichAccountData(account);
            updateAccount({ id: account.id, ...enrichedData });
            alert('Account enriched successfully!');
        } catch (error) {
            console.error("Failed to enrich account:", error);
            alert('Failed to enrich account.');
        } finally {
            setIsEnriching(false);
        }
    };
    
    const hasEnrichmentData = account.description || account.employeeCount || account.funding || account.sector || account.linkedinUrl;

    return (
        <Modal isOpen={!!accountId} onClose={onClose} title={`Account Details: ${account.name}`}>
            <div className="space-y-6 text-gray-300">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-white">Company Information</h3>
                        {!hasEnrichmentData && (
                             <button
                                onClick={handleEnrich}
                                disabled={isEnriching}
                                className="flex items-center justify-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-md transition-colors disabled:bg-gray-500"
                            >
                                {isEnriching ? <Spinner size="sm" /> : "Enrich with AI"}
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="font-semibold text-gray-400">Website:</span> <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{account.website}</a></div>
                        <div><span className="font-semibold text-gray-400">Sector:</span> {account.sector || 'N/A'}</div>
                        <div><span className="font-semibold text-gray-400">Employees:</span> {account.employeeCount || 'N/A'}</div>
                        <div><span className="font-semibold text-gray-400">Funding:</span> {account.funding || 'N/A'}</div>
                        {account.linkedinUrl && <div className="md:col-span-2"><span className="font-semibold text-gray-400">LinkedIn:</span> <a href={account.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{account.linkedinUrl}</a></div>}
                        {account.description && <div className="md:col-span-2"><p className="font-semibold text-gray-400">Description:</p><p className="text-sm mt-1">{account.description}</p></div>}
                    </div>
                </div>

                 <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Linked Leads ({linkedLeads.length})</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {linkedLeads.length > 0 ? linkedLeads.map(lead => (
                            <li key={lead.id}>{lead.name} - <span className="text-gray-400">{lead.title}</span></li>
                        )) : (
                            <p className="text-gray-500">No leads linked to this account.</p>
                        )}
                    </ul>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-white">Recent News</h3>
                        <button onClick={handleGetNews} disabled={isFetchingNews} className="text-sm text-blue-400 hover:underline disabled:text-gray-500 flex items-center">
                            {isFetchingNews ? <Spinner size="sm" /> : "Refresh News"}
                        </button>
                    </div>
                    {account.news?.text && <p className="mb-4 text-sm bg-gray-800 p-3 rounded-md italic">"{account.news.text}"</p>}
                    <div className="space-y-3">
                        {account.news?.newsItems && account.news.newsItems.length > 0 ? (
                            account.news.newsItems.map((item, index) => (
                                <div key={index} className="bg-gray-800/50 p-3 rounded-md text-sm">
                                    <a href={item.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">{item.title}</a>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">{isFetchingNews ? "Fetching news..." : "No news articles found."}</p>
                        )}
                    </div>
                </div>

            </div>
        </Modal>
    );
};

export default AccountDetailView;
