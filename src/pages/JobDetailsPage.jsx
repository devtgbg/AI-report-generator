import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import JobHeader from '../components/dashboard/JobHeader';
import JobSidebar from '../components/dashboard/JobSidebar';
import StatusTimeline from '../components/dashboard/StatusTimeline';
import JobExpandedDetails from '../components/dashboard/JobExpandedDetails';
import JobAssets from '../components/dashboard/JobAssets';
import ChecklistSidebar from '../components/dashboard/ChecklistSidebar';
import { fetchJobDetails } from '../services/api/zuperApi';

const JobDetailsPage = () => {
    const { jobId } = useParams();
    const location = useLocation();

    // Initialize with passed state if available, otherwise null
    const [jobData, setJobData] = useState(location.state?.jobData || null);
    const [loading, setLoading] = useState(!jobData);
    const [checklistOpen, setChecklistOpen] = useState(false);
    const [selectedChecklist, setSelectedChecklist] = useState([]);
    const [selectedStatusName, setSelectedStatusName] = useState('');

    useEffect(() => {
        // If no data passed via router state (e.g. direct URL hit), fetch it
        if (!jobData && jobId) {
            const loadData = async () => {
                try {
                    setLoading(true);
                    const data = await fetchJobDetails(jobId);
                    setJobData(data);
                } catch (error) {
                    console.error("Failed to load job details", error);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [jobId, jobData]);

    const handleViewChecklist = (checklist, statusName) => {
        setSelectedChecklist(checklist);
        setSelectedStatusName(statusName);
        setChecklistOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center">
                    <Sparkles className="w-12 h-12 text-blue-300 mb-4" />
                    <div className="text-slate-400 font-medium">Loading Job Details...</div>
                </div>
            </div>
        );
    }

    if (!jobData) return <div className="p-8 text-center">Job not found.</div>;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">

            {/* Header */}
            <JobHeader job={jobData} />

            <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto px-4 mt-8">

                {/* Left Sidebar: Timeline (3 Cols) */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <div className="font-bold text-slate-700 px-1">Status History</div>
                    <StatusTimeline
                        history={jobData.job_status}
                        onViewChecklist={handleViewChecklist}
                    />
                </div>

                {/* Center: Details (6 Cols) */}
                <div className="col-span-12 lg:col-span-6 space-y-6">
                    <JobExpandedDetails job={jobData} />
                    <JobAssets assets={jobData.assets} />
                    {/* Note: In Zuper UI, checklist is usually in sidebar or modal, not inline in center. 
                      We moved it to the sidebar drawer as requested. */}
                </div>

                {/* Right Sidebar: Assignees & Meta (3 Cols) */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <JobSidebar job={jobData} />
                </div>

            </div>

            {/* Checklist Drawer */}
            <ChecklistSidebar
                isOpen={checklistOpen}
                onClose={() => setChecklistOpen(false)}
                checklistData={selectedChecklist}
                statusName={selectedStatusName}
            />

        </div>
    );
};

export default JobDetailsPage;
