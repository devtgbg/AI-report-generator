import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, Edit, RotateCw, Plus, StickyNote, Sparkles } from 'lucide-react';

const JobHeader = ({ job }) => {
    if (!job) return null;

    return (
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">

                {/* Breadcrumb & ID */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link to="/" className="hover:text-blue-600 transition-colors">Jobs</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-slate-700">#{job.prefix || 'JOB'} {job.work_order_number || job.job_code} - {job.job_title}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Title & Status */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-blue-600 font-bold text-sm">#{job.prefix || ''}{job.work_order_number || job.job_code}</span>
                            <span
                                className="px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wide text-white"
                                style={{ backgroundColor: job.current_job_status?.status_color || '#2ecc71' }}
                            >
                                {job.current_job_status?.status_name}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">{job.job_title}</h1>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                            <span>{new Date(job.scheduled_start_time).toLocaleString()}</span>
                            <span>→</span>
                            <span>{new Date(job.scheduled_end_time).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Actions Toolbar */}
                    {/* Generate Premium Report Button */}
                    <div>
                        <button
                            onClick={() => window.open(`/jobs/${job.job_uid}/ai-report`, '_blank')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all px-6 py-3 rounded-xl font-bold flex items-center gap-3 group"
                        >
                            <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg">Generate Premium Report through AI</span>
                        </button>
                    </div>
                </div>

                {/* Tabs (Navigation / Status History) */}
                <div className="flex gap-8 border-b border-white pt-2">
                    <button className="text-slate-500 hover:text-blue-600 font-medium pb-3 border-b-2 border-transparent hover:border-blue-600 transition-all">
                        Navigation
                    </button>
                    <button className="text-blue-600 font-bold pb-3 border-b-2 border-blue-600">
                        Status History
                    </button>
                </div>

            </div>
        </div>
    );
};

const ActionButton = ({ icon: Icon, label, active }) => (
    <button className={`flex flex-col items-center gap-1 group ${active ? 'text-orange-600' : 'text-slate-500 hover:text-blue-600'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${active ? 'bg-orange-50 border border-orange-200' : 'bg-white border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50'}`}>
            <Icon className={`w-4 h-4 ${active ? 'text-orange-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
        </div>
        <span className="text-[10px] font-semibold">{label}</span>
    </button>
);

export default JobHeader;
