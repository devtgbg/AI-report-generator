import React from 'react';
import { Check, Clock, User, List } from 'lucide-react';

const StatusTimeline = ({ history, onViewChecklist }) => {
    if (!history || history.length === 0) return null;

    // Sort history: newest first
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            {/* Title hidden as it's often implicit in this sidebar layout */}

            <div className="relative pl-2 space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200" />

                {sortedHistory.map((status, idx) => {
                    const isCompleted = status.status_type === 'COMPLETED';
                    const isCurrent = idx === 0;

                    return (
                        <div key={idx} className="relative flex gap-4">
                            {/* Icon/Dot */}
                            <div className={`relative z-10 w-10 h-10 rounded-full border-4 flex items-center justify-center shrink-0 bg-white
                        ${isCompleted ? 'border-green-100' : 'border-white'}
                    `}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white
                            ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}
                            ${isCurrent && !isCompleted ? 'bg-blue-500' : ''}
                        `}>
                                    {isCompleted ? <Check className="w-3 h-3" /> : (isCurrent ? <div className="w-2 h-2 bg-white rounded-full" /> : <div className="w-2 h-2 bg-slate-400 rounded-full" />)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{status.status_name}</h4>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(status.created_at).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>

                                {status.done_by && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <User className="w-3 h-3" />
                                        <span className="truncate">{status.done_by.first_name} {status.done_by.last_name}</span>
                                    </div>
                                )}

                                {status.checklist && status.checklist.length > 0 && (
                                    <button
                                        onClick={() => onViewChecklist && onViewChecklist(status.checklist, status.status_name)}
                                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-semibold mt-3 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                    >
                                        <List className="w-3 h-3" />
                                        View Checklist
                                    </button>
                                )}

                                {status.remarks && (
                                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                        "{status.remarks}"
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default StatusTimeline;
