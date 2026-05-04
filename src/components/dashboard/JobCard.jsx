import React from 'react';
import { Building2, MapPin, Calendar, Clock, User, Briefcase } from 'lucide-react';

const JobCard = ({ job }) => {
    if (!job) return null;

    const {
        job_title,
        job_code,
        work_order_number, // Added
        job_status,
        customer,
        customer_address,
        scheduled_start_time,
        current_job_status
    } = job;

    const displayId = job_code || work_order_number || 'N/A'; // Added
    const statusColor = current_job_status?.status_color || '#3b82f6';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{job_title}</h2>
                    <p className="text-slate-500 text-sm mt-1">Job #{displayId}</p>
                </div>
                <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: statusColor }}
                >
                    {current_job_status?.status_name || 'Unknown'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-700">Customer</p>
                            <p className="text-sm text-slate-600">
                                {customer?.customer_first_name} {customer?.customer_last_name}
                            </p>
                            {customer?.customer_company_name && (
                                <p className="text-xs text-slate-400">{customer.customer_company_name}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-700">Location</p>
                            <p className="text-sm text-slate-600">
                                {customer_address?.street}, {customer_address?.city}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-700">Scheduled Date</p>
                            <p className="text-sm text-slate-600">
                                {scheduled_start_time ? new Date(scheduled_start_time).toLocaleDateString() : 'Not Scheduled'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-700">Time</p>
                            <p className="text-sm text-slate-600">
                                {scheduled_start_time ? new Date(scheduled_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
