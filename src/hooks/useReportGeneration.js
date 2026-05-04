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

            // Step 2b: Map Zuper Data to Report Template Format
            const mappedJobData = {
                ...job,
                job_number: job.job_code || job.work_order_number || job.readable_id || (job.prefix && job.job_uid ? `${job.prefix}-${job.job_uid.substring(0, 6)}` : job.job_uid), // Fallback logic
                category: job.job_category?.category_name || 'Service',
                scheduled_date: job.scheduled_start_time ? new Date(job.scheduled_start_time).toLocaleDateString() : new Date().toLocaleDateString(),
                status: job.current_job_status?.status_name || 'N/A',

                customer: {
                    name: job.customer ?
                        (job.customer.customer_company_name || `${job.customer.customer_first_name || ''} ${job.customer.customer_last_name || ''}`).trim()
                        : 'N/A',
                    location: job.customer?.customer_address ?
                        [job.customer.customer_address.street, job.customer.customer_address.city].filter(Boolean).join(', ') : 'N/A',
                    contact: job.customer?.customer_contact_no?.mobile || 'N/A'
                },

                asset: {
                    // Try to find assets in common locations (assets or associated_assets)
                    type: (job.assets?.[0] || job.associated_assets?.[0])?.category?.category_name ||
                        (job.assets?.[0] || job.associated_assets?.[0])?.asset_category_name || 'N/A',
                    serial_number: (job.assets?.[0] || job.associated_assets?.[0])?.serial_number || 'N/A',
                    fleet_number: (job.assets?.[0] || job.associated_assets?.[0])?.fleet_number || 'N/A'
                },

                technician: {
                    name: job.assigned_to?.[0]?.user ?
                        `${job.assigned_to[0].user.first_name} ${job.assigned_to[0].user.last_name || ''}`.trim() : 'N/A',
                    id: job.assigned_to?.[0]?.user?.emp_code || 'N/A'
                }
            };

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
