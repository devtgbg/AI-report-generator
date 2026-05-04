export default {
    buildPrompt: (jobData) => {
        return `You are documenting a vehicle collection/delivery for logistics tracking.

Job Information:
- Job Number: ${jobData.job_number || 'N/A'}
- Category: ${jobData.category || 'N/A'}
- Date: ${jobData.scheduled_date || new Date().toISOString().split('T')[0]}

Customer: ${jobData.customer?.name || 'N/A'}
Location: ${jobData.customer?.location || 'N/A'}

Vehicle:
- Type: ${jobData.asset?.type || 'N/A'}
- Fleet: ${jobData.asset?.fleet_number || 'N/A'}
- Odometer: ${jobData.odometer_reading || 'N/A'}

Handler: ${jobData.technician?.name || 'N/A'}

Activities:
${jobData.work_performed?.join('\n') || 'Collection/Delivery completed'}

Notes: ${jobData.notes || 'No additional notes'}

Generate a logistics report with these sections:

1. **COLLECTION/DELIVERY SUMMARY**: Brief description of the activity

2. **VEHICLE CONDITION ON COLLECTION**: Document any existing damage, wear, or issues noted at time of collection

3. **ITEMS COLLECTED WITH VEHICLE**: List keys, chargers, accessories, documents

4. **HANDLING NOTES**: Any special instructions or observations during transport

Keep it factual and focused on documenting condition for liability purposes.`;
    },

    format: (aiResponse, jobData) => {
        return {
            title: `${jobData.category} Report - ${jobData.job_number}`,
            content: `# ${jobData.category} Report

**Date:** ${jobData.scheduled_date || new Date().toLocaleDateString()}  
**Job Number:** ${jobData.job_number || 'N/A'}

---

## Collection/Delivery Details
- **Customer:** ${jobData.customer?.name || 'N/A'}
- **Location:** ${jobData.customer?.location || 'N/A'}
- **Vehicle:** ${jobData.asset?.type || 'N/A'} - ${jobData.asset?.fleet_number || 'N/A'}
- **Odometer:** ${jobData.odometer_reading || 'N/A'}

---

${aiResponse}

---

**Handler:** ${jobData.technician?.name || 'N/A'}  
**Timestamp:** ${new Date().toLocaleString()}  
**Signature:** _________________`,
            metadata: {
                job_id: jobData.job_uid,
                job_number: jobData.job_number,
                category: jobData.category,
                generated_at: new Date().toISOString()
            }
        };
    }
};
