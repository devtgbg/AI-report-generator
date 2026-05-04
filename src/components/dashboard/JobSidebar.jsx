import React from 'react';
import { User, Clock, Building, ChevronRight, Mail } from 'lucide-react';

const JobSidebar = ({ job }) => {
    if (!job) return null;

    return (
        <div className="space-y-4">
            {/* Users/Teams Assigned */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                        <User className="w-4 h-4" />
                        <span>Users/Teams Assigned</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                        ({(job.assigned_to?.length || 0) + (job.assigned_to_team?.length || 0)})
                    </span>
                </div>

                <div className="p-4 space-y-4">
                    {/* Assigned Teams */}
                    {job.assigned_to_team?.map((item, idx) => (
                        <div key={`team-${idx}`} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                {item.team.team_name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{item.team.team_name}</p>
                            </div>
                        </div>
                    ))}

                    {/* Assigned Users */}
                    {job.assigned_to?.map((item, idx) => (
                        <div key={`user-${idx}`} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                {item.user.profile_picture ? (
                                    <img src={item.user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-slate-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                    {item.user.first_name} {item.user.last_name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{item.team?.team_name}</p>
                            </div>
                            <a href={`mailto:${item.user.email}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timelog Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Timelog Summary</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">(0) +</span>
                </div>

                <div className="p-8 flex flex-col items-center justify-center text-slate-400">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-100 flex items-center justify-center mb-3">
                        <Clock className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-xs font-medium">No Timelogs Found</p>
                </div>
            </div>

            {/* Organization */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                        <Building className="w-4 h-4" />
                        <span>Organization</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
            </div>

        </div>
    );
};

export default JobSidebar;
