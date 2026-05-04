import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useReportGeneration from '../hooks/useReportGeneration';
import { Sparkles, Loader2, AlertCircle, FileText, Printer, FileOutput } from 'lucide-react';
import { fetchJobDetails } from '../services/api/zuperApi';
import TerminalLoader from '../components/ui/TerminalLoader';

const AiReportPage = () => {
    const { jobId } = useParams();
    const { report, loading: aiLoading, error: aiError, progress, streamedContent, generateReport } = useReportGeneration();
    const [jobData, setJobData] = useState(null);
    const [initLoading, setInitLoading] = useState(true);
    const hasStartedRef = React.useRef(false);

    useEffect(() => {
        // Prevent double execution in Strict Mode
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        // 1. Fetch Job Data first
        const load = async () => {
            try {
                const data = await fetchJobDetails(jobId);
                setJobData(data);

                // 2. Trigger AI Generation
                if (data) {
                    generateReport(jobId);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setInitLoading(false);
            }
        };

        if (jobId) {
            load();
        }
    }, [jobId]);

    const isLoading = initLoading || aiLoading;
    const error = aiError;

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8 print:p-0 print:bg-white">

            {/* Header (Hidden in Print) */}
            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Premium AI Report</h1>
                </div>

                {report && !isLoading && (
                    <button
                        onClick={() => window.print()}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        Print Report
                    </button>
                )}
            </div>

            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none min-h-[600px] flex flex-col">

                {/* 1. Split Screen Loading State */}
                {isLoading && (
                    <div className="flex flex-1 flex-col lg:flex-row h-full">
                        {/* Left: AI Console */}
                        <div className="w-full lg:w-1/2 bg-slate-950 p-6 border-r border-slate-800 flex flex-col">
                            <div className="mb-4 flex items-center gap-2 text-blue-400">
                                <Sparkles className="w-4 h-4" />
                                <span className="font-mono text-sm tracking-wider uppercase">AI Agent Console</span>
                            </div>
                            <TerminalLoader steps={[progress]} />
                        </div>

                        {/* Right: Live Draft Preview */}
                        <div className="w-full lg:w-1/2 p-8 bg-slate-50 flex flex-col">
                            <div className="mb-4 flex items-center gap-2 text-slate-400">
                                <FileOutput className="w-4 h-4" />
                                <span className="font-mono text-sm tracking-wider uppercase">Draft Preview</span>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 p-8 overflow-y-auto font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {streamedContent ? (
                                    <>
                                        {streamedContent}
                                        <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse align-middle"></span>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-50" />
                                        <span>Waiting for AI output...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Error State */}
                {!isLoading && error && (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-red-600 space-y-4">
                        <AlertCircle className="w-12 h-12 bg-red-50 p-2 rounded-full" />
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold">Generation Failed</h3>
                            <p className="text-sm opacity-80">{error}</p>
                        </div>
                        <button
                            onClick={() => generateReport(jobId)}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* 3. Success State - The Final Report */}
                {!isLoading && !error && report && (
                    <div className="p-12 print:p-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
                        {/* Report Header */}
                        <div className="border-b border-slate-200 pb-8 mb-8 flex justify-between items-start">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-bold text-slate-900">Job Completion Report</h1>
                                <p className="text-slate-500">Generated on {new Date().toLocaleDateString()}</p>
                            </div>
                            {jobData && (
                                <div className="text-right space-y-1">
                                    <div className="font-bold text-slate-900">{jobData.customer_name}</div>
                                    <div className="text-sm text-slate-500">{jobData.customer_address?.city}, {jobData.customer_address?.state}</div>
                                    <div className="text-xs bg-slate-100 px-2 py-1 rounded inline-block mt-1 font-mono text-slate-600">
                                        #{jobData.work_order_number || jobData.job_code}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Report Body */}
                        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-slate-800 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-600 prose-li:text-slate-600">
                            <div dangerouslySetInnerHTML={{ __html: formatReportContent(report.content) }} />
                        </div>

                        {/* Footer */}
                        <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between text-sm text-slate-400 print:mt-8">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                <span>AI Analysis by Zuper</span>
                            </div>
                            <div>
                                Page 1 of 1
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const formatReportContent = (text) => {
    if (!text) return '';
    let html = text.replace(/\n/g, '<br/>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return html;
};

export default AiReportPage;
