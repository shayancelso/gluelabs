/**
 * CSV Exporter - Generates CSV exports from research data
 * Supports configurable field selection
 */

class CSVExporter {
    constructor() {
        this.fieldGroups = {
            company: [
                { key: 'company.domain', header: 'Domain' },
                { key: 'company.name', header: 'Company Name' },
                { key: 'company.industry', header: 'Industry' },
                { key: 'company.businessModel', header: 'Business Model' },
                { key: 'company.founded', header: 'Founded' },
                { key: 'company.headquarters.city', header: 'HQ City' },
                { key: 'company.headquarters.state', header: 'HQ State' },
                { key: 'company.headquarters.country', header: 'HQ Country' }
            ],
            financials: [
                { key: 'financials.estimatedRevenue.value', header: 'Est. Revenue' },
                { key: 'financials.funding.totalRaised', header: 'Total Funding' },
                { key: 'financials.funding.lastRound.type', header: 'Last Round Type' },
                { key: 'financials.funding.lastRound.amount', header: 'Last Round Amount' },
                { key: 'financials.funding.lastRound.date', header: 'Last Round Date' },
                { key: 'financials.headcount.current', header: 'Employees' },
                { key: 'financials.headcount.trend', header: 'Headcount Trend' }
            ],
            technographics: [
                { key: 'technographics.crm.value', header: 'CRM' },
                { key: 'technographics.customerSuccess.value', header: 'CS Platform' },
                { key: 'technographics.marketing.value', header: 'Marketing Automation' },
                { key: 'technographics.dataWarehouse.value', header: 'Data Warehouse' }
            ],
            contacts: [
                { key: 'contacts[0].name', header: 'Contact 1 Name' },
                { key: 'contacts[0].title', header: 'Contact 1 Title' },
                { key: 'contacts[0].email.pattern', header: 'Contact 1 Email' },
                { key: 'contacts[0].linkedIn', header: 'Contact 1 LinkedIn' },
                { key: 'contacts[1].name', header: 'Contact 2 Name' },
                { key: 'contacts[1].title', header: 'Contact 2 Title' },
                { key: 'contacts[1].email.pattern', header: 'Contact 2 Email' },
                { key: 'contacts[1].linkedIn', header: 'Contact 2 LinkedIn' },
                { key: 'contacts[2].name', header: 'Contact 3 Name' },
                { key: 'contacts[2].title', header: 'Contact 3 Title' },
                { key: 'contacts[2].email.pattern', header: 'Contact 3 Email' },
                { key: 'contacts[2].linkedIn', header: 'Contact 3 LinkedIn' }
            ],
            painPoints: [
                { key: 'painPoints[0].title', header: 'Pain Point 1' },
                { key: 'painPoints[0].confidence', header: 'PP1 Confidence' },
                { key: 'painPoints[1].title', header: 'Pain Point 2' },
                { key: 'painPoints[1].confidence', header: 'PP2 Confidence' },
                { key: 'painPoints[2].title', header: 'Pain Point 3' },
                { key: 'painPoints[2].confidence', header: 'PP3 Confidence' }
            ],
            poc: [
                { key: 'pocRecommendations[0].tool', header: 'POC 1 Tool' },
                { key: 'pocRecommendations[0].relevanceScore', header: 'POC 1 Score' },
                { key: 'pocRecommendations[1].tool', header: 'POC 2 Tool' },
                { key: 'pocRecommendations[1].relevanceScore', header: 'POC 2 Score' }
            ],
            metadata: [
                { key: 'metadata.researchDate', header: 'Research Date' },
                { key: 'metadata.overallConfidence', header: 'Data Confidence' }
            ]
        };
    }

    /**
     * Get nested value from object using dot notation
     */
    getValue(obj, path) {
        const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
        let value = obj;

        for (const part of parts) {
            if (value === null || value === undefined) {
                return '';
            }
            value = value[part];
        }

        if (value === null || value === undefined) {
            return '';
        }

        if (Array.isArray(value)) {
            return value.join(', ');
        }

        return String(value);
    }

    /**
     * Escape CSV field value
     */
    escapeCSV(value) {
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    /**
     * Get fields based on selected groups
     */
    getFields(groups = ['company', 'financials', 'technographics', 'contacts']) {
        const fields = [];
        for (const group of groups) {
            if (this.fieldGroups[group]) {
                fields.push(...this.fieldGroups[group]);
            }
        }
        return fields;
    }

    /**
     * Export single company data to CSV row
     */
    exportRow(data, fields) {
        return fields.map(field => this.escapeCSV(this.getValue(data, field.key)));
    }

    /**
     * Export multiple companies to CSV string
     * @param {Array} companies - Array of { domain, data } objects
     * @param {Object} options - Export options
     * @returns {string} CSV content
     */
    export(companies, options = {}) {
        const groups = options.groups || ['company', 'financials', 'technographics', 'contacts'];
        const fields = this.getFields(groups);

        // Header row
        const header = fields.map(f => this.escapeCSV(f.header)).join(',');

        // Data rows
        const rows = companies.map(({ data }) => {
            if (!data || data.error) {
                return fields.map(() => '').join(',');
            }
            return this.exportRow(data, fields).join(',');
        });

        return [header, ...rows].join('\n');
    }

    /**
     * Export contacts as separate rows (one contact per row)
     */
    exportContacts(companies, options = {}) {
        const fields = [
            { key: 'domain', header: 'Company Domain' },
            { key: 'companyName', header: 'Company Name' },
            { key: 'name', header: 'Contact Name' },
            { key: 'firstName', header: 'First Name' },
            { key: 'lastName', header: 'Last Name' },
            { key: 'title', header: 'Title' },
            { key: 'email', header: 'Email' },
            { key: 'linkedIn', header: 'LinkedIn URL' },
            { key: 'tier', header: 'Tier' },
            { key: 'confidence', header: 'Verification Confidence' }
        ];

        const header = fields.map(f => this.escapeCSV(f.header)).join(',');
        const rows = [];

        for (const { domain, data } of companies) {
            if (!data || !data.contacts) continue;

            for (const contact of data.contacts) {
                const nameParts = (contact.name || '').split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                const row = {
                    domain,
                    companyName: data.company?.name || '',
                    name: contact.name || '',
                    firstName,
                    lastName,
                    title: contact.title || '',
                    email: contact.email?.pattern || contact.email?.address || '',
                    linkedIn: contact.linkedIn || '',
                    tier: contact.tier || '',
                    confidence: contact.verification?.confidence || ''
                };

                rows.push(fields.map(f => this.escapeCSV(row[f.key] || '')).join(','));
            }
        }

        return [header, ...rows].join('\n');
    }

    /**
     * Get available field groups
     */
    getAvailableGroups() {
        return Object.keys(this.fieldGroups);
    }
}

module.exports = CSVExporter;
