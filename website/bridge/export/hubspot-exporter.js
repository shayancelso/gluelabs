/**
 * HubSpot Exporter - Generates HubSpot-compatible JSON for import
 * Maps research data to HubSpot company and contact properties
 */

class HubSpotExporter {
    constructor() {
        // HubSpot property mappings
        this.companyMapping = {
            'domain': 'company.domain',
            'name': 'company.name',
            'industry': 'company.industry',
            'description': 'company.description',
            'founded_year': 'company.founded',
            'city': 'company.headquarters.city',
            'state': 'company.headquarters.state',
            'country': 'company.headquarters.country',
            'annualrevenue': 'financials.estimatedRevenue.value',
            'numberofemployees': 'financials.headcount.current',
            'total_money_raised': 'financials.funding.totalRaised',
            // Custom properties (need to be created in HubSpot)
            'crm_platform': 'technographics.crm.value',
            'cs_platform': 'technographics.customerSuccess.value',
            'growth_stage': 'marketPosition.growthStage',
            'data_confidence': 'metadata.overallConfidence'
        };

        this.contactMapping = {
            'email': 'email.pattern',
            'firstname': 'firstName',
            'lastname': 'lastName',
            'jobtitle': 'title',
            'linkedinbio': 'linkedIn',
            // Custom properties
            'contact_tier': 'tier',
            'verification_confidence': 'verification.confidence'
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

        // Handle ranges like "$50M-100M"
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
     * Parse funding string to number
     */
    parseFunding(fundingStr) {
        return this.parseRevenue(fundingStr);
    }

    /**
     * Export company to HubSpot format
     */
    exportCompany(data) {
        if (!data) return null;

        const properties = {};

        for (const [hubspotProp, sourcePath] of Object.entries(this.companyMapping)) {
            let value = this.getValue(data, sourcePath);

            // Special handling for certain fields
            if (hubspotProp === 'annualrevenue' && value) {
                value = this.parseRevenue(value);
            } else if (hubspotProp === 'total_money_raised' && value) {
                value = this.parseFunding(value);
            } else if (hubspotProp === 'numberofemployees' && value) {
                value = parseInt(value, 10) || null;
            } else if (hubspotProp === 'founded_year' && value) {
                // Extract year if full date provided
                const yearMatch = String(value).match(/\d{4}/);
                value = yearMatch ? yearMatch[0] : value;
            }

            if (value !== null && value !== undefined && value !== '') {
                properties[hubspotProp] = value;
            }
        }

        return { properties };
    }

    /**
     * Export contact to HubSpot format
     */
    exportContact(contact, companyDomain) {
        if (!contact) return null;

        // Parse name
        const nameParts = (contact.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const contactData = {
            ...contact,
            firstName,
            lastName
        };

        const properties = {};

        for (const [hubspotProp, sourcePath] of Object.entries(this.contactMapping)) {
            const value = this.getValue(contactData, sourcePath);
            if (value !== null && value !== undefined && value !== '') {
                properties[hubspotProp] = value;
            }
        }

        // Add company association
        if (companyDomain) {
            properties.associatedcompanyid = companyDomain; // Will need to resolve in HubSpot
        }

        return { properties };
    }

    /**
     * Export all data for single company
     */
    exportSingle(domain, data) {
        const company = this.exportCompany(data);
        const contacts = [];

        if (data.contacts) {
            for (const contact of data.contacts) {
                const exported = this.exportContact(contact, domain);
                if (exported) {
                    contacts.push(exported);
                }
            }
        }

        return {
            company,
            contacts
        };
    }

    /**
     * Export multiple companies to HubSpot batch format
     * @param {Array} companies - Array of { domain, data } objects
     * @returns {Object} HubSpot batch import format
     */
    export(companies) {
        const companiesArray = [];
        const contactsArray = [];

        for (const { domain, data } of companies) {
            if (!data || data.error) continue;

            const exported = this.exportSingle(domain, data);

            if (exported.company) {
                companiesArray.push(exported.company);
            }

            contactsArray.push(...exported.contacts);
        }

        return {
            format: 'hubspot',
            version: '1.0',
            exportDate: new Date().toISOString(),
            companies: {
                inputs: companiesArray
            },
            contacts: {
                inputs: contactsArray
            },
            instructions: {
                importUrl: 'https://app.hubspot.com/import',
                steps: [
                    'Go to Contacts > Import in HubSpot',
                    'Select "Start an import"',
                    'Choose "File from computer"',
                    'Upload this JSON file',
                    'Map properties as needed',
                    'Complete the import'
                ],
                customProperties: [
                    'crm_platform (Company)',
                    'cs_platform (Company)',
                    'growth_stage (Company)',
                    'data_confidence (Company)',
                    'contact_tier (Contact)',
                    'verification_confidence (Contact)'
                ]
            }
        };
    }

    /**
     * Export to HubSpot CSV format (alternative)
     */
    exportCSV(companies) {
        const CSVExporter = require('./csv-exporter');
        const csvExporter = new CSVExporter();

        // Override field mappings for HubSpot
        csvExporter.fieldGroups.hubspot = [
            { key: 'company.domain', header: 'Company Domain Name' },
            { key: 'company.name', header: 'Company Name' },
            { key: 'company.industry', header: 'Industry' },
            { key: 'company.headquarters.city', header: 'City' },
            { key: 'company.headquarters.state', header: 'State/Region' },
            { key: 'company.headquarters.country', header: 'Country/Region' },
            { key: 'financials.headcount.current', header: 'Number of Employees' },
            { key: 'financials.estimatedRevenue.value', header: 'Annual Revenue' },
            { key: 'company.description', header: 'Description' }
        ];

        return csvExporter.export(companies, { groups: ['hubspot'] });
    }
}

module.exports = HubSpotExporter;
