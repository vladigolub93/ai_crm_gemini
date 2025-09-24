import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { Lead, Account, Task } from '../types';
import { getCompanyNews } from '../services/geminiService';

// A simple ID generator as a substitute for a full UUID library
const generateId = () => Math.random().toString(36).substring(2, 15);


interface CrmContextType {
  leads: Lead[];
  accounts: Account[];
  tasks: Task[];
  addLeads: (newLeads: Omit<Lead, 'id' | 'accountId'>[]) => void;
  addAccounts: (newAccounts: Omit<Account, 'id' | 'leadIds' | 'news'>[]) => void;
  linkLeadsToAccounts: (links: { leadId: string; accountId: string }[]) => void;
  updateLead: (updatedLead: Partial<Lead> & { id: string }) => void;
  updateAccount: (updatedAccount: Partial<Account> & { id: string }) => void;
  getAccountNews: (accountId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (taskId: string) => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

// Helper function to get initial state from localStorage
const getInitialState = <T,>(key: string, fallback: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Error parsing ${key} from localStorage`, error);
        localStorage.removeItem(key); // Clear corrupted data
    }
    return fallback;
};


export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(() => getInitialState('crm_leads', []));
  const [accounts, setAccounts] = useState<Account[]>(() => getInitialState('crm_accounts', []));
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState('crm_tasks', []));

  // Effects to save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('crm_accounts', JSON.stringify(accounts));
  }, [accounts]);
  
  useEffect(() => {
    localStorage.setItem('crm_tasks', JSON.stringify(tasks));
  }, [tasks]);


  const addLeads = useCallback((newLeads: Omit<Lead, 'id' | 'accountId'>[]) => {
    const formattedLeads: Lead[] = newLeads.map(lead => ({
      ...lead,
      id: generateId(),
    }));
    setLeads(prev => [...prev, ...formattedLeads]);
    alert(`${formattedLeads.length} leads added successfully!`);
  }, []);

  const addAccounts = useCallback((newAccounts: Omit<Account, 'id' | 'leadIds' | 'news'>[]) => {
    const formattedAccounts: Account[] = newAccounts.map(account => ({
      ...account,
      id: generateId(),
      leadIds: [],
    }));
    setAccounts(prev => [...prev, ...formattedAccounts]);
    alert(`${formattedAccounts.length} accounts added successfully!`);
  }, []);

  const linkLeadsToAccounts = useCallback((links: { leadId: string; accountId: string }[]) => {
    const linksMap = new Map(links.map(link => [link.leadId, link.accountId]));
    
    setLeads(prevLeads => prevLeads.map(lead => {
      const accountId = linksMap.get(lead.id);
      if (accountId) {
        return { ...lead, accountId: accountId };
      }
      return lead;
    }));

    setAccounts(prevAccounts => {
        const accountLeadMap = new Map<string, string[]>();
        links.forEach(({ leadId, accountId }) => {
            if (!accountLeadMap.has(accountId)) {
                accountLeadMap.set(accountId, []);
            }
            accountLeadMap.get(accountId)!.push(leadId);
        });

        return prevAccounts.map(account => {
            if (accountLeadMap.has(account.id)) {
                const newLeadIds = accountLeadMap.get(account.id)!;
                const existingLeadIds = new Set(account.leadIds);
                const combined = [...existingLeadIds, ...newLeadIds.filter(id => !existingLeadIds.has(id))];
                return { ...account, leadIds: combined };
            }
            return account;
        });
    });
  }, []);

  const updateLead = useCallback((updatedLead: Partial<Lead> & { id: string }) => {
    setLeads(prev => prev.map(lead => lead.id === updatedLead.id ? { ...lead, ...updatedLead } : lead));
  }, []);
  
  const updateAccount = useCallback((updatedAccount: Partial<Account> & { id: string }) => {
    setAccounts(prev => prev.map(account => account.id === updatedAccount.id ? { ...account, ...updatedAccount } : account));
  }, []);

  const getAccountNews = useCallback(async (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    const newsData = await getCompanyNews(account.name);
    updateAccount({ id: accountId, news: newsData });
  }, [accounts, updateAccount]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
      const newTask = { ...task, id: generateId(), completed: false };
      setTasks(prev => [newTask, ...prev].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  }, []);

  const toggleTask = useCallback((taskId: string) => {
      setTasks(prev => prev.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
  }, []);


  return (
    <CrmContext.Provider value={{
      leads,
      accounts,
      tasks,
      addLeads,
      addAccounts,
      linkLeadsToAccounts,
      updateLead,
      updateAccount,
      getAccountNews,
      addTask,
      toggleTask
    }}>
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (context === undefined) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};