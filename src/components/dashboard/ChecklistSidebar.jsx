import React from 'react';
import { X, Printer, Image as ImageIcon } from 'lucide-react';

const ChecklistSidebar = ({ isOpen, onClose, checklistData, statusName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-2xl w-full flex">
                <div className="w-full h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
                        <h2 className="text-lg font-bold text-slate-800">
                            Checklist for Status '{statusName || 'Started'}'
                        </h2>
                        <div className="flex items-center gap-4">
                            {/* Print/Edit icons placeholder if needed */}
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {(!checklistData || checklistData.length === 0) ? (
                            <div className="text-center py-10 text-slate-500">No checklist details found.</div>
                        ) : (
                            checklistData.map((item, idx) => {
                                // Handling different types of checklist items mostly based on the detailed text dump provided
                                // The dump shows Headers (e.g. "Battery Section") and Question/Answer pairs.

                                const isHeader = item.type === 'HEADER' || !item.answer;
                                // Note: In some structures, header items might just mean bold text without an answer.
                                // We'll rely on the visual cue: if it looks like a header (bold, capitalized) or has specific type.

                                // Render logic based on item type or content
                                return (
                                    <div key={idx} className="space-y-2">
                                        {/* Question / Label */}
                                        <div className={isHeader ? "text-base font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2 mt-6" : "text-sm text-slate-500 font-medium"}>
                                            {item.description || item.question}
                                        </div>

                                        {/* Answer */}
                                        {!isHeader && item.answer && (
                                            <div className="text-sm font-semibold text-slate-900 whitespace-pre-wrap">
                                                {item.answer}
                                            </div>
                                        )}

                                        {/* Images */}
                                        {item.type === 'IMAGE' || item.type === 'MULTI_IMAGE' || (item.answer && (item.answer.includes('http') || item.answer.includes('data:image'))) ? (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {/* This assumes answer contains URLs or we have attached files. 
                                         Adapting to common Zuper patterns where answer might be the URL 
                                         or regular attachments array. */}
                                                {getImagesFromItem(item).map((imgUrl, imgIdx) => (
                                                    <div key={imgIdx} className="relative w-32 h-24 rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity cursor-pointer">
                                                        <img src={imgUrl} alt="Checklist attachment" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })
                        )}

                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">
                            Close
                        </button>
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold text-sm hover:bg-orange-700 transition-colors shadow-sm flex items-center gap-2">
                            <Printer className="w-4 h-4" />
                            Print Checklist
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Helper to extract image URLs from checklist item
const getImagesFromItem = (item) => {
    if (!item.answer) return [];
    if (item.type === 'IMAGE' || item.type === 'MULTI_IMAGE') {
        return item.answer.split(',').filter(url => url.trim().length > 0);
    }
    // Heuristic: check if answer looks like a URL
    if (item.answer.startsWith('http') || item.answer.startsWith('data:image')) {
        return [item.answer];
    }
    return [];
};

export default ChecklistSidebar;
