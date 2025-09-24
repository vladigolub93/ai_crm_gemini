
import React, { useState, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { enrichLeadData, generatePersonalizedMessage } from '../services/geminiService';

interface LeadDetailViewProps {
    leadId: string;
    onClose: () => void;
}

const LeadDetailView: React.FC<LeadDetailViewProps> = ({ leadId, onClose }) => {
    const { leads, accounts, updateLead } = useCrm();
    const [isLoading, setIsLoading] = useState(false);
    const [messageType, setMessageType] = useState<'email' | 'linkedin'>('email');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

    const lead = useMemo(() => leads.find(l => l.id === leadId), [leads, leadId]);
    const account = useMemo(() => {
        if (!lead?.accountId) return undefined;
        return accounts.find(a => a.id === lead.accountId);
    }, [accounts, lead]);

    if (!lead) return null;

    const handleEnrich = async () => {
        setIsLoading(true);
        try {
            const enrichedData = await enrichLeadData(lead);
            updateLead({ id: lead.id, ...enrichedData });
            alert('Lead enriched successfully!');
        } catch (error) {
            console.error("Failed to enrich lead:", error);
            alert('Failed to enrich lead.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateMessage = async () => {
        setIsGeneratingMessage(true);
        setGeneratedMessage('');
        try {
            const message = await generatePersonalizedMessage(messageType, lead, account);
            setGeneratedMessage(message);
        } catch (error) {
            console.error(`Failed to generate ${messageType} message:`, error);
            alert(`Failed to generate ${messageType} message.`);
        } finally {
            setIsGeneratingMessage(false);
        }
    }

    return (
        <Modal isOpen={!!leadId} onClose={onClose} title={`Lead Details: ${lead.name}`}>
            <div className="space-y-6 text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700/50 p-4 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-400">Name</p>
                        <p className="text-lg text-white">{lead.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-400">Title</p>
                        <p className="text-lg text-white">{lead.title}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-400">Company</p>
                        <p className="text-lg text-white">{lead.companyName}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-400">Linked Account</p>
                        <p className="text-lg text-white">{account?.name || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-400">LinkedIn Profile</p>
                        {lead.linkedinProfile ? (
                             <a href={lead.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{lead.linkedinProfile}</a>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <span>Not available.</span>
                                <button
                                    onClick={handleEnrich}
                                    disabled={isLoading}
                                    className="flex items-center justify-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-md transition-colors disabled:bg-gray-500"
                                >
                                    {isLoading ? <Spinner size="sm" /> : "Enrich with AI"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Generate Outreach Message</h3>
                     <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                             <input type="radio" id="email" name="messageType" value="email" checked={messageType === 'email'} onChange={() => setMessageType('email')} className="form-radio bg-gray-900 text-blue-600"/>
                             <label htmlFor="email">Email</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="radio" id="linkedin" name="messageType" value="linkedin" checked={messageType === 'linkedin'} onChange={() => setMessageType('linkedin')} className="form-radio bg-gray-900 text-blue-600"/>
                             <label htmlFor="linkedin">LinkedIn</label>
                        </div>
                        <button 
                            onClick={handleGenerateMessage}
                            disabled={isGeneratingMessage}
                            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500"
                        >
                            {isGeneratingMessage ? <Spinner size="sm"/> : "Generate"}
                        </button>
                     </div>
                     {generatedMessage && (
                         <div className="bg-gray-800 p-4 rounded-md mt-4">
                            <h4 className="font-semibold text-white mb-2 capitalize">{messageType} Message</h4>
                             <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300">{generatedMessage}</pre>
                         </div>
                     )}
                </div>
            </div>
        </Modal>
    );
};

export default LeadDetailView;
