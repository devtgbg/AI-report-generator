import React from 'react';
import { Tag, AlertCircle, Briefcase, Users, Layers, FileText, Calendar, Clock } from 'lucide-react';

const JobExpandedDetails = ({ job }) => {
    if (!job) return null;

    const {
        job_category,
        job_priority,
        job_type,
        job_description,
        job_tags,
        job_skills,
        scheduled_start_time,
        scheduled_end_time,
        creation_time
    } = job;

    // Helper for formatted date
    const formatDate = (dateString) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                Primary Details
            </h3>

            <div className="space-y-8">

                {/* Description - HTML Rendered */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
                    <div
                        className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 prose prose-sm max-w-none text-justify"
                        dangerouslySetInnerHTML={{ __html: job_description || "No description provided." }}
                    />
                </div>

                {/* Grid of Key Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Category */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Job Category</label>
                        <div className="font-medium text-slate-800">{job_category?.category_name || '---'}</div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Job Priority</label>
                        <div className="inline-flex">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                ${job_priority?.priority === 'High' ? 'bg-red-100 text-red-700' :
                                    job_priority?.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                        'bg-green-100 text-green-700'}`}>
                                {job_priority?.priority || 'Normal'}
                            </span>
                        </div>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Job Type</label>
                        <div className="font-medium text-slate-800">{job_type?.job_type_name || '---'}</div>
                    </div>

                    {/* Scheduled Start */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Scheduled Start</label>
                        <div className="font-medium text-slate-800 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(scheduled_start_time)}
                        </div>
                    </div>

                    {/* Scheduled End */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Scheduled End</label>
                        <div className="font-medium text-slate-800 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(scheduled_end_time)}
                        </div>
                    </div>

                    {/* Created On */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Job Created On</label>
                        <div className="text-sm text-slate-600">
                            {formatDate(creation_time)}
                        </div>
                    </div>
                </div>

                {/* Footer Meta (Tags/Skills) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Job Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {job_tags && job_tags.length > 0 ? (
                                job_tags.map((tag, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded border border-slate-200">
                                        {tag.tag_name || tag}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400 italic text-sm">---</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Job Skills</label>
                        <div className="flex flex-wrap gap-2">
                            {job_skills && job_skills.length > 0 ? (
                                job_skills.map((skill, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100">
                                        {skill.skill_name || skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400 italic text-sm">---</span>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default JobExpandedDetails;
