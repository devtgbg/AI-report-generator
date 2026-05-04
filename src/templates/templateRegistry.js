import serviceTemplate from './service/serviceTemplate';
import inspectionTemplate from './inspection/inspectionTemplate';
import logisticsTemplate from './logistics/logisticsTemplate';
import tenantTemplate from './tenant/tenantTemplate';

// Map all 29 job categories to template types
export const TEMPLATE_MAPPING = {
    // Service Templates
    'AMC - Offsite': 'service',
    'AMC - Workshop': 'service',
    'Routine Service': 'service',
    'Mobile Service': 'service',
    'Breakdown Call Out': 'service',
    'Warranty Repairs': 'service',
    'On Site Repairs': 'service',
    'Battery Installation': 'service',

    // Inspection Templates
    'Health Check': 'inspection',
    'Health Check-Non Electric': 'inspection',
    'JGE Annual Inspection': 'inspection',
    'PDI': 'inspection',
    'Rental Inspection': 'inspection',
    'Rental PDI Checkout': 'inspection',
    'Rental PDI Return': 'inspection',

    // Logistics Templates
    'Collection': 'logistics',
    'Delivery': 'logistics',
    'AMC Collection & Valet': 'logistics',
    'PPM JGE Collection': 'logistics',
    'PPM JGE Delivery': 'logistics',

    // Tenant Templates
    'Tenant Entry Report': 'tenant',
    'Tenant Exit Report': 'tenant',

    // Specialized
    'Customer Estimate': 'service',
    'Install Long Roof & Solar': 'service',
    'New Cart Build from LVT': 'service',
    'Precedent Refurbishment': 'service',
    'Workshop Job Sheet': 'service',
    'PPM Cleaning': 'service',
    'PPM - EXPO': 'service'
};

export const TEMPLATES = {
    service: serviceTemplate,
    inspection: inspectionTemplate,
    logistics: logisticsTemplate,
    tenant: tenantTemplate
};

export const getTemplateForCategory = (category) => {
    const templateType = TEMPLATE_MAPPING[category] || 'service';
    return TEMPLATES[templateType];
};
