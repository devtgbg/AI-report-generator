export default {
    buildPrompt: (jobData) => {
        const isEntry = jobData.category?.includes('Entry');

        return `You are documenting a vehicle condition for ${isEntry ? 'tenant entry' : 'tenant exit'} purposes.

Job Information:
- Job Number: ${jobData.job_number || 'N/A'}
- Category: ${jobData.category || 'N/A'}
- Date: ${jobData.scheduled_date || new Date().toISOString().split('T')[0]}

Property: ${jobData.customer?.location || 'N/A'}
Inspector: ${jobData.technician?.name || 'N/A'}

Vehicle:
- Type: ${jobData.asset?.type || 'N/A'}
- Fleet: ${jobData.asset?.fleet_number || 'N/A'}
- Odometer: ${jobData.odometer_reading || 'N/A'}

Inspection Items:
${jobData.work_performed?.join('\n') || 'Standard condition assessment'}

Notes: ${jobData.notes || 'No additional notes'}

Generate a ${isEntry ? 'tenant entry' : 'tenant exit'} condition report with these sections:

1. **EXTERIOR CONDITION**: Document body, paint, tires, lights - note any scratches, dents, or damage

2. **INTERIOR CONDITION**: Document seats, dashboard, floor, storage - note cleanliness and damage

3. **MECHANICAL/ELECTRICAL**: Document battery level, brakes, horn, steering

4. **DAMAGE ASSESSMENT**: List any pre-existing damage with detailed descriptions for liability purposes

5. **${isEntry ? 'ACCEPTANCE' : 'RETURN'} STATUS**: Overall assessment of vehicle condition

Be extremely detailed about any damage to protect both tenant and property owner.`;
    },

    format: (aiResponse, jobData) => {
        return {
            title: `${jobData.category} - ${jobData.job_number}`,
            content: `# ${jobData.category}

**Date:** ${jobData.scheduled_date || new Date().toLocaleDateString()}  
**Property:** ${jobData.customer?.location || 'N/A'}  
**Inspector:** ${jobData.technician?.name || 'N/A'}

---

## Vehicle Details
- **Type:** ${jobData.asset?.type || 'N/A'}
- **Fleet Number:** ${jobData.asset?.fleet_number || 'N/A'}
- **Serial Number:** ${jobData.asset?.serial_number || 'N/A'}
- **Odometer Reading:** ${jobData.odometer_reading || 'N/A'}

---

${aiResponse}

---

## Sign-Off

**Inspector Name:** ${jobData.technician?.name || 'N/A'}  
**Inspector Signature:** _________________  
**Date:** ${new Date().toLocaleDateString()}

**Tenant Acknowledgment:**  
I acknowledge that the above condition assessment is accurate.

**Tenant Name:** _________________  
**Tenant Signature:** _________________  
**Date:** _________________

*Photos attached: [  ] Yes  [  ] No*`,
            metadata: {
                job_id: jobData.job_uid,
                job_number: jobData.job_number,
                category: jobData.category,
                generated_at: new Date().toISOString()
            }
        };
    }
};
