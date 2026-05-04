export default {
    buildPrompt: (jobData) => {
        return `You are a certified vehicle inspector conducting a thorough inspection.

Job Information:
- Job Number: ${jobData.job_number || 'N/A'}
- Category: ${jobData.category || 'N/A'}
- Inspection Date: ${jobData.scheduled_date || new Date().toISOString().split('T')[0]}

Vehicle Details:
- Type: ${jobData.asset?.type || 'N/A'}
- Serial: ${jobData.asset?.serial_number || 'N/A'}
- Fleet: ${jobData.asset?.fleet_number || 'N/A'}

Customer: ${jobData.customer?.name || 'N/A'}
Inspector: ${jobData.technician?.name || 'N/A'}

Inspection Items:
${jobData.work_performed?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'Standard inspection checklist'}

Notes: ${jobData.notes || 'No additional notes'}

Generate a detailed inspection report with these sections:

1. **CRITICAL FAILURES**: List any items that failed inspection and require immediate attention. Mark each as "FAIL" with explanation.

2. **PASSED INSPECTIONS**: List all systems and components that passed inspection. Mark each as "PASS".

3. **ADVISORY ITEMS**: List items that passed but show signs of wear or may need attention soon.

4. **INSPECTION RESULT**: Provide an overall PASS/FAIL verdict and summary.

Use a checklist format with ✓ for PASS and ✗ for FAIL. Be specific and safety-focused.`;
    },

    format: (aiResponse, jobData) => {
        return {
            title: `${jobData.category} - ${jobData.job_number}`,
            content: `# ${jobData.category}

**Inspection Date:** ${jobData.scheduled_date || new Date().toLocaleDateString()}  
**Inspector:** ${jobData.technician?.name || 'N/A'}

---

## Vehicle Information
- **Type:** ${jobData.asset?.type || 'N/A'}
- **Serial Number:** ${jobData.asset?.serial_number || 'N/A'}
- **Fleet Number:** ${jobData.asset?.fleet_number || 'N/A'}
- **Customer:** ${jobData.customer?.name || 'N/A'}

---

${aiResponse}

---

**Inspector Signature:** _________________  
**Date:** ${new Date().toLocaleDateString()}

*This inspection report is valid for 30 days from date of issue.*`,
            metadata: {
                job_id: jobData.job_uid,
                job_number: jobData.job_number,
                category: jobData.category,
                generated_at: new Date().toISOString()
            }
        };
    }
};
