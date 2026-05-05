import { useState } from 'react';
import { fetchJobDetails } from '../services/api/zuperApi';
import { getTemplateForCategory } from '../templates/templateRegistry';
import { generateReportWithOllama, generateReportWithOllamaStreaming } from '../services/api/aiService';

export const useReportGeneration = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [jobData, setJobData] = useState(null);
    const [report, setReport] = useState(null);
    const [progress, setProgress] = useState('');
    const [streamedContent, setStreamedContent] = useState('');

    const generateReport = async (jobId) => {
        setLoading(true);
        setError(null);
        setReport(null);
        setProgress('');
        setStreamedContent('');

        try {
            // Step 1: Fetch from Zuper
            setProgress('Fetching job details from Zuper FMS...');
            const job = await fetchJobDetails(jobId);
            setJobData(job);

            // Step 2: Get template type
            setProgress(`Selecting report template for category: ${job.job_category?.category_name || job.category}...`);
            const template = getTemplateForCategory(job.job_category?.category_name || job.category);

            if (!template) {
                throw new Error(`No template found for category: ${job.job_category?.category_name}`);
            }

            // Helper to extract checklist data grouped by HEADER
            const extractChecklistData = (job) => {
                const sections = {};
                let currentSection = 'General';

                // Traverse all status history to find checklists
                job.job_status?.forEach(status => {
                    if (status.checklist && Array.isArray(status.checklist)) {
                        status.checklist.forEach(item => {
                            if (item.type === 'HEADER') {
                                currentSection = item.question || 'General';
                                if (!sections[currentSection]) sections[currentSection] = [];
                            } else if (item.answer && item.answer !== 'N/A') {
                                // Capture Text items only (skip images)
                                if (!sections[currentSection]) sections[currentSection] = [];

                                if (item.type !== 'IMAGE' && item.type !== 'MULTI_IMAGE') {
                                    // Handle multi-line answers (e.g., multiple checkbox selections)
                                    const answer = item.answer;

                                    // Check if answer contains newlines (multiple selections)
                                    if (answer.includes('\n')) {
                                        // Split by newlines and add each as a sub-item
                                        const lines = answer.split('\n').filter(line => line.trim());
                                        sections[currentSection].push(`${item.question}:`);
                                        lines.forEach(line => {
                                            sections[currentSection].push(`  - ${line.trim()}`);
                                        });
                                    } else {
                                        // Regular single-line answer
                                        sections[currentSection].push(`${item.question}: ${answer}`);
                                    }
                                }
                            }
                        });
                    }
                });
                return sections;
            };

            const checklistData = extractChecklistData(job);
            console.log("DEBUG: Extracted Checklist Data:", JSON.stringify(checklistData, null, 2));
            console.log("DEBUG: Total checklist items:", Object.values(checklistData).flat().length);

            // HELPER: Smart Fuzzy Search for keys/values
            const findValue = (obj, partialKey) => {
                if (!obj) return null;
                const key = Object.keys(obj).find(k => k.toLowerCase().includes(partialKey.toLowerCase()));
                return key ? obj[key] : null;
            };

            const findCustomField = (fields, labelPart) => {
                return fields?.find(f => f.label.toLowerCase().includes(labelPart.toLowerCase()))?.value || null;
            };

            // HELPER: Scan all checklists in history for a specific question (case-insensitive)
            const findChecklistAnswer = (job, keyword) => {
                let foundAnswer = null;
                job.job_status?.forEach(status => {
                    if (status.checklist && Array.isArray(status.checklist)) {
                        const item = status.checklist.find(i =>
                            i.question && i.question.toLowerCase().includes(keyword.toLowerCase()) &&
                            i.answer && i.answer !== 'N/A'
                        );
                        if (item) foundAnswer = item.answer;
                    }
                });
                return foundAnswer;
            };

            // HELPER: Extract exact checklist answer by question (exact match case-insensitive)
            const getChecklistValue = (job, questionKey) => {
                let answer = null;
                job.job_status?.forEach(status => {
                    if (status.checklist && Array.isArray(status.checklist)) {
                        const item = status.checklist.find(i =>
                            i.question && i.question.toLowerCase() === questionKey.toLowerCase()
                        );
                        if (item && item.answer && item.answer !== 'N/A') {
                            answer = item.answer;
                        }
                    }
                });
                return answer;
            };

            // HELPER: Extract Battery Data (1-8 batteries)
            const extractBatteryData = (job) => {
                const batteries = [];
                for (let i = 1; i <= 8; i++) {
                    const voltage = getChecklistValue(job, `Battery ${i} Voltage`);
                    const soc = getChecklistValue(job, `Battery ${i} State of Charge`);
                    const soh = getChecklistValue(job, `Battery ${i} State of Health`);

                    // Only add if at least one value exists
                    if (voltage || soc || soh) {
                        batteries.push({
                            number: i,
                            voltage: voltage || '-',
                            stateOfCharge: soc || '-',
                            stateOfHealth: soh || '-'
                        });
                    }
                }
                return batteries;
            };

            // HELPER: Extract Electrics & Lights Data
            const extractElectricsData = (job) => ({
                keySwitch: getChecklistValue(job, 'Key Switch or Keypad if fitted'),
                forwardReverse: getChecklistValue(job, 'Forward/Reverse Switch & Buzzer'),
                horn: getChecklistValue(job, 'Horn'),
                headlightsFitted: getChecklistValue(job, 'Are Headlights fitted'),
                headlightsWorking: getChecklistValue(job, 'Are all headlights working'),
                headlightDefects: getChecklistValue(job, 'Headlight Defects'),
                indicatorsFitted: getChecklistValue(job, 'Are Indicators fitted'),
                indicatorsWorking: getChecklistValue(job, 'Are all indicators working'),
                indicatorDefects: getChecklistValue(job, 'Indicator Defects'),
                rearLightsFitted: getChecklistValue(job, 'Are Rear Lights Fitted'),
                rearLightsWorking: getChecklistValue(job, 'Are all rear lights working'),
                rearLightDefects: getChecklistValue(job, 'Rear Tail/Brake Light Defects'),
                towSwitch: getChecklistValue(job, 'Tow Switch Status')
            });

            // HELPER: Extract Steering & Suspension Data
            const extractSteeringData = (job) => ({
                steeringInspection: getChecklistValue(job, 'Steering and Wheel Alignment Visual Iinspection'),
                steeringNotes: getChecklistValue(job, 'Steering Notes'),
                frontSuspension: getChecklistValue(job, 'Front Suspension Visual Inspection'),
                frontSuspensionNotes: getChecklistValue(job, 'Front suspension notes:'),
                rearSuspension: getChecklistValue(job, 'Rear Suspension Visual Inspection'),
                rearSuspensionNotes: getChecklistValue(job, 'Rear Suspension Notes')
            });

            // HELPER: Extract Brakes & Wheels Data
            const extractBrakesWheelsData = (job) => ({
                brakingSystem: getChecklistValue(job, 'Braking System'),
                parkingBrake: getChecklistValue(job, 'Parking brake'),
                frontWheelCondition: getChecklistValue(job, 'Front Wheel Condition'),
                rearWheelCondition: getChecklistValue(job, 'Rear Wheel Condition'),
                tyreCondition: getChecklistValue(job, 'Tyre Condition'),
                tyrePressure: getChecklistValue(job, 'Tyre Pressure'),
                treadDepth: getChecklistValue(job, 'Tread Depth')
            });

            // HELPER: Extract Bodywork Data
            const extractBodyworkData = (job) => ({
                windscreen: getChecklistValue(job, 'Windscreen Condition'),
                frontFairing: getChecklistValue(job, 'Front Fairing Condition'),
                rearFairing: getChecklistValue(job, 'Rear Fairing Condition'),
                frontSeats: getChecklistValue(job, 'Front Seats Condition'),
                rearSeats: getChecklistValue(job, 'Rear Seats Condition'),
                cleanliness: getChecklistValue(job, 'Overall Cleanliness'),
                bodyworkNotes: getChecklistValue(job, 'Bodywork Notes')
            });

            // HELPER: Extract ALL Images from Checklists
            const extractInspectionImages = (job) => {
                const images = [];
                job.job_status?.forEach(status => {
                    if (status.checklist && Array.isArray(status.checklist)) {
                        status.checklist.forEach(item => {
                            if ((item.type === 'IMAGE' || item.type === 'MULTI_IMAGE') && item.answer && item.answer !== 'N/A') {
                                // Handle comma-separated URLs for MULTI_IMAGE
                                const urls = item.answer.split(',').map(u => u.trim()).filter(Boolean);
                                urls.forEach(url => {
                                    images.push({
                                        label: item.question || 'Inspection Photo',
                                        url: url
                                    });
                                });
                            }
                        });
                    }
                });
                return images;
            };

            // Extract all structured inspection data
            const batteryData = extractBatteryData(job);
            const electricsData = extractElectricsData(job);
            const steeringData = extractSteeringData(job);
            const brakesWheelsData = extractBrakesWheelsData(job);
            const bodyworkData = extractBodyworkData(job);
            const batteryPackSetup = getChecklistValue(job, 'Battery Pack Setup');
            const inspectionImages = extractInspectionImages(job);

            // Step 2b: Map Zuper Data to Report Template Format
            const isResidential = job.assets?.some(a => a.asset?.asset_category?.category_name === 'Residential') ||
                job.job_category?.category_name?.includes('Residential');

            const mappedJobData = {
                ...job,
                job_number: job.job_code || job.work_order_number || job.readable_id || (job.prefix && job.job_uid ? `${job.prefix}-${job.job_uid.substring(0, 6)}` : job.job_uid),
                category: job.job_category?.category_name || 'Service',
                scheduled_date: job.scheduled_start_time ? new Date(job.scheduled_start_time).toLocaleDateString() : new Date().toLocaleDateString(),
                status: job.current_job_status?.status_name || 'N/A',

                customer: {
                    // LEGACY FIELDS (For Templates)
                    name: isResidential
                        ? `${job.customer?.customer_first_name || ''} ${job.customer?.customer_last_name || ''}`.trim() || 'Residential Customer'
                        : (job.organization?.organization_name ||
                            job.customer?.customer_organization?.organization_name ||
                            (job.customer && (job.customer.customer_company_name || `${job.customer.customer_first_name || ''} ${job.customer.customer_last_name || ''}`.trim())) ||
                            'N/A'),

                    location: job.customer?.customer_billing_address ?
                        [job.customer.customer_billing_address.street, job.customer.customer_billing_address.city, job.customer.customer_billing_address.country].filter(Boolean).join(', ') :
                        [job.customer?.customer_address?.street, job.customer?.customer_address?.city].filter(Boolean).join(', ') ||
                        'Dubai, UAE',
                    contact: job.customer?.customer_contact_no?.mobile || 'N/A',

                    // DETAILED STRUCTURED FIELDS (For UI)
                    // If Residential, we generally HIDE organization unless it's explicitly set in a weird way, but usually it's Personal Name.
                    organization: isResidential
                        ? null
                        : (job.organization?.organization_name ||
                            job.customer?.customer_organization?.organization_name ||
                            job.customer?.customer_company_name ||
                            null),

                    contact_person: (job.customer?.customer_first_name || job.customer?.customer_last_name) ?
                        `${job.customer.customer_first_name || ''} ${job.customer.customer_last_name || ''}`.trim() :
                        findCustomField(job.custom_fields, 'Contact Person') ||
                        null,

                    email: job.customer?.customer_email ||
                        job.customer?.customer_billing_address?.email ||
                        job.customer?.customer_address?.email ||
                        null,

                    mobile: job.customer?.customer_contact_no?.mobile ||
                        job.customer?.customer_billing_address?.phone_number ||
                        job.customer?.customer_address?.phone_number ||
                        null,

                    address: (() => {
                        const addr = job.customer?.customer_billing_address || job.customer?.customer_address;
                        if (!addr) return findCustomField(job.custom_fields, 'Address') || null;
                        return [
                            addr.street,
                            addr.city,
                            addr.state,
                            addr.country,
                            addr.zip_code
                        ].filter(Boolean).join(', ');
                    })()
                },

                asset: {
                    // Brand - Check checklist answers, custom fields, then asset data
                    brand: findValue(job.checklist_internal_object, 'brand') ||
                        findChecklistAnswer(job, 'brand') ||
                        findCustomField(job.custom_fields, 'Brand') ||
                        (job.assets?.[0]?.asset || job.associated_assets?.[0])?.brand ||
                        null,

                    // Model - Check checklist answers, custom fields, then asset name
                    model: findValue(job.checklist_internal_object, 'model') ||
                        findChecklistAnswer(job, 'model') ||
                        findCustomField(job.custom_fields, 'Model') ||
                        (job.assets?.[0]?.asset || job.associated_assets?.[0])?.asset_name ||
                        (job.assets?.[0]?.asset || job.associated_assets?.[0])?.model ||
                        null,

                    // Legacy type field for backwards compatibility
                    type: findValue(job.checklist_internal_object, 'model') ||
                        findChecklistAnswer(job, 'model') ||
                        findValue(job.checklist_internal_object, 'brand') ||
                        findChecklistAnswer(job, 'brand') ||
                        findCustomField(job.custom_fields, 'Model') ||
                        (job.assets?.[0]?.asset || job.associated_assets?.[0])?.asset_name ||
                        (job.assets?.[0] || job.associated_assets?.[0])?.category?.category_name ||
                        'Vehicle',

                    serial_number: findValue(job.checklist_internal_object, 'serial_number') ||
                        findChecklistAnswer(job, 'serial number') ||
                        findCustomField(job.custom_fields, 'Serial') ||
                        (job.assets?.[0]?.asset || job.associated_assets?.[0])?.asset_serial_number ||
                        (job.assets?.[0] || job.associated_assets?.[0])?.serial_number ||
                        null,

                    fleet_number: findValue(job.checklist_internal_object, 'fleet') ||
                        findChecklistAnswer(job, 'fleet') ||
                        findCustomField(job.custom_fields, 'Fleet') ||
                        (job.assets?.[0]?.asset || job.associated_assets?.[0])?.fleet_number ||
                        (job.assets?.[0]?.asset || job.associated_assets?.[0])?.asset_code ||
                        null
                },

                technician: {
                    name: job.assigned_to?.[0]?.user ?
                        `${job.assigned_to[0].user.first_name} ${job.assigned_to[0].user.last_name || ''}`.trim() : 'N/A',
                    id: job.assigned_to?.[0]?.user?.emp_code || 'N/A'
                },

                // Keep original custom_fields array for UI usage
                custom_fields: job.custom_fields || [],

                // Formatted string for AI Prompt
                custom_fields_text: job.custom_fields?.map(f => `${f.label}: ${f.value}`).join('\n') || '',

                // Extract Remarks from Status History
                remarks: job.job_status?.map(s => s.remarks || s.remarks_free_text).filter(Boolean).join('\n') || '',

                // Add extracted checklist data
                checklist_details: checklistData,

                // Calculate Health Score
                health_score: (() => {
                    const allItems = Array.isArray(checklistData)
                        ? checklistData
                        : Object.values(checklistData).flat();

                    if (allItems.length === 0) return 100; // Default to 100 if no data
                    const negativeKeywords = ['fail', 'bad', 'replace', 'damaged', 'worn', 'no', 'monitor', 'attention'];
                    let issuesCount = 0;

                    allItems.forEach(item => {
                        const answer = item.split(':')[1]?.toLowerCase() || '';
                        if (negativeKeywords.some(keyword => answer.includes(keyword))) {
                            issuesCount++;
                        }
                    });

                    // Simple algorithm: Start at 100, deduct 5 for each issue, floor at 0
                    return Math.max(0, 100 - (issuesCount * 5));
                })(),

                // FULL RAW CONTEXT (Sanitized for tokens)
                full_job_json: JSON.stringify(job, (key, value) => {
                    // Remove large/redundant fields to save tokens
                    if (['profile_picture', 'description', 'meta_data', 'created_at', 'updated_at', 'synced_at', 'last_login_at', 'is_deleted'].includes(key)) return undefined;
                    return value;
                }, 2),

                // STRUCTURED INSPECTION DATA (For Static React Rendering)
                inspection: {
                    batteryPackSetup: batteryPackSetup,
                    batteries: batteryData,
                    electrics: electricsData,
                    steering: steeringData,
                    brakesWheels: brakesWheelsData,
                    bodywork: bodyworkData,
                    images: inspectionImages
                }
            };

            // UPDATE UI STATE WITH MAPPED DATA
            console.log("DEBUG: Mapped Job Data constructed:", mappedJobData.customer, mappedJobData.asset);
            setJobData(mappedJobData);

            // Step 3: Build AI prompt
            setProgress('Building AI prompt...');
            const prompt = template.buildPrompt(mappedJobData);

            // Step 4: Generate with AI (Streaming)
            setProgress('Initializing AI stream...');
            let fullAiResponse = '';
            let hasStartedStreaming = false;

            await generateReportWithOllamaStreaming(prompt, (chunk) => {
                fullAiResponse += chunk;
                setStreamedContent(prev => prev + chunk);
                // Update progress only once when we have enough content
                if (!hasStartedStreaming && fullAiResponse.length > 10) {
                    setProgress('Generating natural language summary...');
                    hasStartedStreaming = true; // Optimization: Avoids re-rendering on every chunk
                }
            });

            // Step 5: Format final report
            setProgress('Formatting final report...');
            const finalReport = template.format(fullAiResponse, mappedJobData);

            // Enhance report with metadata if not already present in format
            if (!finalReport.metadata) {
                finalReport.metadata = {
                    job_id: job.job_uid,
                    category: job.category,
                    generated_at: new Date().toISOString()
                };
            }

            setReport(finalReport);
            setProgress('');

            return finalReport;
        } catch (err) {
            console.error('Report generation error:', err);
            setError(err.message || 'Failed to generate report');
            setReport(null); // Clear report on error
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        jobData,
        report,
        progress,
        streamedContent,
        generateReport
    };
};

export default useReportGeneration;
