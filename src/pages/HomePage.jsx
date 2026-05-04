import React, { useState } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchJobDetails } from '../services/api/zuperApi';

const HomePage = () => {
    const [inputJobId, setInputJobId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGenerate = async () => {
        if (!inputJobId.trim()) return;
        setLoading(true);
        setError('');

        try {
            // We only need basic details here to get the UID if the user entered a number
            // But fetchJobDetails returns the full object. 
            // Optimally we should just allow the router to handle the ID if it's already a UID.
            // But strict requirement: "Fetch details and show on webpage".
            // Let's resolve the ID first.

            const fetchedData = await fetchJobDetails(inputJobId.trim());
            if (fetchedData && fetchedData.job_uid) {
                // Navigate to details page
                navigate(`/jobs/${fetchedData.job_uid}/details`, { state: { jobData: fetchedData } });
            } else {
                setError('Job not found.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch job details. Please check the ID/URL.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center space-y-8">

                <div className="space-y-2">
                    <div className="flex justify-center mb-4">
                        <span className="bg-blue-600 text-white p-2 rounded-xl">
                            <Sparkles size={32} />
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Paste Job URL</h2>
                    <p className="text-slate-500 text-lg">Paste the full Zuper Job URL to fetch details and generate an AI analysis.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-3 max-w-lg mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="https://web.zuperpro.com/jobs/..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg"
                                value={inputJobId}
                                onChange={(e) => setInputJobId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !inputJobId}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition-colors flex items-center gap-2 text-lg"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generate'}
                        </button>
                    </div>

                    {error && (
                        <div className="text-red-600 font-medium bg-red-50 py-2 px-4 rounded-lg inline-block">
                            {error}
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-center gap-8 text-slate-400 text-sm">
                    <span>v1.0.0</span>
                    <span>•</span>
                    <span>Powered by Gemini 2.0</span>
                </div>

            </div>
        </div>
    );
};

export default HomePage;
