/**
 * Salesforce Exporter - Generates Salesforce-compatible formats for import
 * Supports both Data Loader CSV and Salesforce JSON formats
 */

class SalesforceExporter {
    constructor() {
        // Salesforce Account field mappings
        this.accountMapping = {
            'Name': 'company.name',
            'Website': 'company.domain',
            'Industry': 'company.industry',
            'Description': 'company.description',
            'BillingCity': 'company.headquarters.city',
            'BillingState': 'company.headquarters.state',
            'BillingCountry': 'company.headquarters.country',
            'NumberOfEmployees': 'financials.headcount.current',
            'AnnualRevenue': 'financials.estimatedRevenue.value',
            'Type': 'marketPosition.growthStage',
            // Custom fields (need to be created in Salesforce)
            'CRM_Platform__c': 'technographics.crm.value',
            'CS_Platform__c': 'technographics.customerSuccess.value',
            'Total_Funding__c': 'financials.funding.totalRaised',
            'Last_Funding_Round__c': 'financials.funding.lastRound.type',
            'Data_Confidence__c': 'metadata.overallConfidence'
        };

        // Salesforce Contact field mappings
        this.contactMapping = {
            'FirstName': 'firstName',
            'LastName': 'lastName',
            'Title': 'title',
            'Email': 'email',
            'LinkedIn_Profile__c': 'linkedIn',
            'Contact_Tier__c': 'tier',
            'Verification_Confidence__c': 'verification.confidence'
        };

        // Salesforce Lead field mappings (alternative to Account/Contact)
        this.leadMapping = {
            'Company': 'company.name',
            'Website': 'company.domain',
            'Industry': 'company.industry',
            'FirstName': 'contact.firstName',
            'LastName': 'contact.lastName',
            'Title': 'contact.title',
            'Email': 'contact.email',
            'City': 'company.headquarters.city',
            'State': 'company.headquarters.state',
            'Country': 'company.headquarters.country',
            'NumberOfEmployees': 'financials.headcount.current',
            'AnnualRevenue': 'financials.estimatedRevenue.value',
            'LeadSource': 'Prospect Research Tool'
        };
    }

    /**
     * Get nested value from object
     */
    getValue(obj, path) {
        if (!path) return null;
        const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
        let value = obj;

        for (const part of parts) {
            if (value === null || value === undefined) return null;
            value = value[part];
        }

        return value;
    }

    /**
     * Parse revenue string to number
     */
    parseRevenue(revenueStr) {
        if (!revenueStr) return null;

        const match = String(revenueStr).match(/\$?([\d.]+)\s*[MBK]?/i);
        if (!match) return null;

        let value = parseFloat(match[1]);
        const unit = revenueStr.match(/[MBK]/i)?.[0]?.toUpperCase();

        if (unit === 'B') value *= 1000000000;
        else if (unit === 'M') value *= 1000000;
        else if (unit === 'K') value *= 1000;

        return Math.round(value);
    }

    /**
     * Map industry to Salesforce picklist values
     */
    mapIndustry(industry) {
        const industryMap = {
            'saas': 'Technology',
            'software': 'Technology',
            'technology': 'Technology',
            'fintech': 'Financial Services',
            'finance': 'Financial Services',
            'healthcare': 'Healthcare',
            'retail': 'Retail',
            'ecommerce': 'Retail',
            'manufacturing': 'Manufacturing',
            'education': 'Education',
            'media': 'Media',
            'entertainment': 'Entertainment'
        };

        const normalized = (industry || '').toLowerCase();
        for (const [key, value] of Object.entries(industryMap)) {
            if (normalized.includes(key)) {
                return value;
            }
        }
        return industry || 'Other';
    }

    /**
     * Export Account record
     */
    exportAccount(data) {
        if (!data) return null;

        const record = {};

        for (const [sfField, sourcePath] of Object.entries(this.accountMapping)) {
            let value = this.getValue(data, sourcePath);

            // Special handling
            if (sfField === 'Website' && value && !value.startsWith('http')) {
                value = `https://${value}`;
            } else if (sfField === 'AnnualRevenue') {
                value = this.parseRevenue(value);
            } else if (sfField === 'NumberOfEmployees') {
                value = parseInt(value, 10) || null;
            } else if (sfField === 'Industry') {
                value = this.mapIndustry(value);
            } else if (sfField === 'Type') {
                // Map growth stage to Account Type
                const typeMap = {
                    'startup': 'Prospect',
                    'growth': 'Prospect',
                    'scale-up': 'Prospect',
                    'enterprise': 'Prospect'
                };
                value = typeMap[(value || '').toLowerCase()] || 'Prospect';
            }

            if (value !== null && value !== undefined && value !== '') {
                record[sfField] = value;
            }
        }

        return record;
    }

    /**
     * Export Contact record
     */
    exportContact(contact, accountName) {
        if (!contact) return null;

        // Parse name
        const nameParts = (contact.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || firstName; // Salesforce requires LastName

        const contactData = {
            ...contact,
            firstName,
            lastName: lastName || 'Unknown',
            email: contact.email?.pattern || contact.email?.address || ''
        };

        const record = {};

        for (const [sfField, sourcePath] of Object.entries(this.contactMapping)) {
            const value = this.getValue(contactData, sourcePath);
            if (value !== null && value !== undefined && value !== '') {
                record[sfField] = value;
            }
        }

        // Add account reference (for lookup after import)
        if (accountName) {
            record['Account.Name'] = accountName;
        }

        return record;
    }

    /**
     * Export Lead record (company + contact combined)
     */
    exportLead(data, contact) {
        if (!data) return null;

        // Parse contact name
        const nameParts = (contact?.name || '').split(' ');
        const firstName = nameParts[0] || 'Unknown';
        const lastName = nameParts.slice(1).join(' ') || 'Contact';

        const leadData = {
            company: data.company,
            financials: data.financials,
            contact: {
                firstName,
                lastName,
                title: contact?.title || '',
                email: contact?.email?.pattern || contact?.email?.address || ''
            }
        };

        const record = {};

        for (const [sfField, sourcePath] of Object.entries(this.leadMapping)) {
            let value;

            if (sourcePath === 'Prospect Research Tool') {
                value = sourcePath;
            } else {
                value = this.getValue(leadData, sourcePath);
            }

            // Special handling
            if (sfField === 'Website' && value && !value.startsWith('http')) {
                value = `https://${value}`;
            } else if (sfField === 'AnnualRevenue') {
                value = this.parseRevenue(value);
            } else if (sfField === 'NumberOfEmployees') {
                value = parseInt(value, 10) || null;
            } else if (sfField === 'Industry') {
                value = this.mapIndustry(value);
            }

            if (value !== null && value !== undefined && value !== '') {
                record[sfField] = value;
            }
        }

        return record;
    }

    /**
     * Export to Salesforce Data Loader CSV format (Accounts)
     */
    exportAccountsCSV(companies) {
        const headers = Object.keys(this.accountMapping);
        const rows = [];

        for (const { data } of companies) {
            if (!data || data.error) continue;

            const record = this.exportAccount(data);
            if (record) {
                const row = headers.map(h => {
                    const value = record[h];
                    if (value === null || value === undefined) return '';
                    const str = String(value);
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                });
                rows.push(row.join(','));
            }
        }

        return [headers.join(','), ...rows].join('\n');
    }

    /**
     * Export to Salesforce Data Loader CSV format (Contacts)
     */
    exportContactsCSV(companies) {
        const headers = [...Object.keys(this.contactMapping), 'Account.Name'];
        const rows = [];

        for (const { data } of companies) {
            if (!data || data.error || !data.contacts) continue;

            for (const contact of data.contacts) {
                const record = this.exportContact(contact, data.company?.name);
                if (record) {
                    const row = headers.map(h => {
                        const value = record[h];
                        if (value === null || value === undefined) return '';
                        const str = String(value);
                        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                            return `"${str.replace(/"/g, '""')}"`;
                        }
                        return str;
                    });
                    rows.push(row.join(','));
                }
            }
        }

        return [headers.join(','), ...rows].join('\n');
    }

    /**
     * Export to Salesforce Data Loader CSV format (Leads)
     */
    exportLeadsCSV(companies) {
        const headers = Object.keys(this.leadMapping);
        const rows = [];

        for (const { data } of companies) {
            if (!data || data.error) continue;

            // Create one lead per contact, or one lead if no contacts
            const contacts = data.contacts?.length ? data.contacts : [null];

            for (const contact of contacts) {
                const record = this.exportLead(data, contact);
                if (record) {
                    const row = headers.map(h => {
                        const value = record[h];
                        if (value === null || value === undefined) return '';
                        const str = String(value);
                        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                            return `"${str.replace(/"/g, '""')}"`;
                        }
                        return str;
                    });
                    rows.push(row.join(','));
                }
            }
        }

        return [headers.join(','), ...rows].join('\n');
    }

    /**
     * Export to Salesforce JSON format
     * @param {Array} companies - Array of { domain, data } objects
     * @param {Object} options - Export options
     * @returns {Object} Salesforce-compatible structure
     */
    export(companies, options = {}) {
        const accounts = [];
        const contacts = [];
        const leads = [];

        for (const { domain, data } of companies) {
            if (!data || data.error) continue;

            // Export Account
            const account = this.exportAccount(data);
            if (account) {
                account.ExternalId__c = domain; // For upsert matching
                accounts.push(account);
            }

            // Export Contacts
            if (data.contacts) {
                for (const contact of data.contacts) {
                    const exported = this.exportContact(contact, data.company?.name);
                    if (exported) {
                        contacts.push(exported);
                    }
                }
            }

            // Export Leads (alternative format)
            if (options.includeLeads) {
                const contactList = data.contacts?.length ? data.contacts : [null];
                for (const contact of contactList) {
                    const lead = this.exportLead(data, contact);
                    if (lead) {
                        leads.push(lead);
                    }
                }
            }
        }

        return {
            format: 'salesforce',
            version: '1.0',
            exportDate: new Date().toISOString(),
            accounts: {
                records: accounts,
                objectType: 'Account'
            },
            contacts: {
                records: contacts,
                objectType: 'Contact'
            },
            leads: options.includeLeads ? {
                records: leads,
                objectType: 'Lead'
            } : undefined,
            instructions: {
                importMethods: [
                    'Data Loader (CSV files)',
                    'Data Import Wizard',
                    'Workbench (workbench.developerforce.com)'
                ],
                steps: [
                    '1. For Data Loader: Use exportAccountsCSV() and exportContactsCSV()',
                    '2. Import Accounts first, then Contacts',
                    '3. Match Contacts to Accounts via Account.Name lookup',
                    '4. Or use Leads for simpler single-object import'
                ],
                customFields: [
                    'CRM_Platform__c (Account)',
                    'CS_Platform__c (Account)',
                    'Total_Funding__c (Account)',
                    'Last_Funding_Round__c (Account)',
                    'Data_Confidence__c (Account)',
                    'LinkedIn_Profile__c (Contact)',
                    'Contact_Tier__c (Contact)',
                    'Verification_Confidence__c (Contact)'
                ]
            }
        };
    }
}

module.exports = SalesforceExporter;
