
import { GoogleGenAI, Type } from "@google/genai";
import type { Lead, Account } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const linkLeadsAndAccounts = async (leads: Lead[], accounts: Account[]): Promise<{ leadId: string; accountId: string }[]> => {
    try {
        const leadData = leads.map(l => ({ id: l.id, companyName: l.companyName, name: l.name }));
        const accountData = accounts.map(a => ({ id: a.id, name: a.name, website: a.website }));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an expert data matcher. Below are two JSON arrays: 'leads' and 'accounts'. Your task is to match each lead to the most likely account based on the 'companyName' from the lead and the 'name' from the account. Respond with a JSON array of objects, each containing 'leadId' and 'accountId'. If no match is found for a lead, omit it from the response. LEADS: ${JSON.stringify(leadData)} ACCOUNTS: ${JSON.stringify(accountData)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            leadId: { type: Type.STRING },
                            accountId: { type: Type.STRING }
                        },
                    }
                }
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error linking leads and accounts:", error);
        return [];
    }
};

export const enrichLeadData = async (lead: Lead) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a professional data researcher. Find the LinkedIn profile URL for a person named '${lead.name}' who works as a '${lead.title || 'professional'}' at '${lead.companyName || 'their company'}'. Return the data in a single, valid JSON object with the key 'linkedinProfile'. If the profile cannot be confidently found, return an empty string for the key.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    linkedinProfile: { type: Type.STRING },
                },
            }
        }
    });
    const jsonStr = response.text.trim();
    if (!jsonStr) {
        throw new Error("API returned an empty response.");
    }
    return JSON.parse(jsonStr);
};

export const enrichAccountData = async (account: Account) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a business data analyst. Given the following company information: {name: '${account.name}', website: '${account.website}'}. Find the following details and return them in a single, valid JSON object with these exact keys: 'linkedinUrl', 'description', 'employeeCount', 'funding', and 'sector'. If a piece of information cannot be found, return an empty string for that key.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    linkedinUrl: { type: Type.STRING },
                    description: { type: Type.STRING },
                    employeeCount: { type: Type.STRING },
                    funding: { type: Type.STRING },
                    sector: { type: Type.STRING }
                },
            }
        }
    });
    const jsonStr = response.text.trim();
     if (!jsonStr) {
        throw new Error("API returned an empty response.");
    }
    return JSON.parse(jsonStr);
};

export const getCompanyNews = async (companyName: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find the top 3 most recent and significant news articles about the company '${companyName}'. Provide a brief summary for each.`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        const newsItems = groundingChunks.map((chunk: any) => ({
            title: chunk.web.title,
            uri: chunk.web.uri,
            snippet: `Retrieved content related to the news.` 
        }));

        return { text, newsItems };

    } catch (error) {
        console.error("Error fetching company news:", error);
        return { text: "Could not fetch news.", newsItems: [] };
    }
};

export const generatePersonalizedMessage = async (type: 'email' | 'linkedin', lead: Lead, account?: Account) => {
    let prompt = `You are a professional sales development representative. Write a short, personalized, and compelling cold ${type} message to a person named ${lead.name} who is a ${lead.title || 'professional'} at ${account?.name || lead.companyName}. The goal is to book a meeting.`;
    if(account?.description) {
        prompt += ` Use the following information about their company for personalization: ${account.description}.`;
    }
    prompt += ` Keep the tone professional but friendly. For emails, include a subject line.`;

     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating message:", error);
        return "Failed to generate message.";
    }
};
