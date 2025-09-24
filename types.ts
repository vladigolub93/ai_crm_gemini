
export interface NewsItem {
  title: string;
  uri: string;
  snippet: string;
}

export interface Lead {
  id: string;
  name: string;
  title: string;
  companyName: string;
  linkedinProfile?: string;
  accountId?: string;
}

export interface Account {
  id: string;
  name: string;
  website: string;
  linkedinUrl?: string;
  description?: string;
  employeeCount?: string;
  funding?: string;
  sector?: string;
  leadIds: string[];
  news?: {
    text: string;
    newsItems: NewsItem[];
  }
}

export interface Task {
    id: string;
    title: string;
    dueDate: string;
    relatedTo: {
        type: 'lead' | 'account';
        id: string;
        name: string;
    };
    completed: boolean;
}
