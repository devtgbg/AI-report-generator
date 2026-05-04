import React from 'react';
import { ClipboardCheck, CheckCircle2, MessageSquare, Image as ImageIcon } from 'lucide-react';

const JobChecklist = ({ job }) => {
    // Find the status history item that contains a checklist
    // Usually the completion status or recent updates have it
    const checklistData = job?.job_status?.find(status => status.checklist && status.checklist.length > 0)?.checklist
        || job?.checklist;

    if (!checklistData || checklistData.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                Inspection Checklist
            </h3>

            <div className="space-y-4">
                {checklistData.map((item, idx) => {
                    if (item.type === 'HEADER') {
                        return (
                            <h4 key={idx} className="text-sm font-bold text-slate-700 bg-slate-100 p-2 rounded mt-4 uppercase tracking-wide">
                                {item.question}
                            </h4>
                        );
                    }

                    return (
                        <div key={idx} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                            <p className="text-sm font-medium text-slate-600 mb-1">{item.question}</p>

                            {item.type === 'IMAGE' || item.type === 'MULTI_IMAGE' ? (
                                <div className="flex gap-2 overflow-x-auto mt-2">
                                    {item.answer ? item.answer.split(',').map((imgUrl, i) => (
                                        <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-slate-200 hover:opacity-90">
                                            <img src={imgUrl} alt="Checklist" className="w-full h-full object-cover" />
                                        </a>
                                    )) : <span className="text-xs text-slate-400 italic">No image provided</span>}
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-3 rounded text-slate-800 text-sm font-medium border border-slate-100">
                                    {item.answer || <span className="text-slate-400 italic">No answer</span>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default JobChecklist;
