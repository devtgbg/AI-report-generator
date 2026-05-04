import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

const TerminalLoader = ({ steps = [] }) => {
    const [logs, setLogs] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const scrollRef = useRef(null);

    // Simulation of "thinking" logs based on the current high-level step
    const thinkingLogs = [
        "analyzing job parameters...",
        "extracting asset metadata...",
        "validating checklist consistency...",
        "cross-referencing with historical data...",
        "formatting output structure...",
        "optimizing report layout..."
    ];

    useEffect(() => {
        // Add initial log
        if (logs.length === 0) {
            setLogs([{ text: "Initializing AI Agent...", type: 'info', timestamp: new Date() }]);
        }

        let tickCount = 0;
        // Interval to add simulated logs (stops after 30 seconds to avoid looking broken)
        const interval = setInterval(() => {
            tickCount++;
            if (tickCount > 20) {
                // Stop adding logs after ~30 seconds of simulation
                clearInterval(interval);
                return;
            }

            if (Math.random() > 0.6) {
                const randomLog = thinkingLogs[Math.floor(Math.random() * thinkingLogs.length)];
                addLog(randomLog, 'process');
            }
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    // Update logs when external step changes
    useEffect(() => {
        if (steps[currentStepIndex]) {
            addLog(steps[currentStepIndex], 'step');
        }
    }, [currentStepIndex, steps]);

    const addLog = (text, type) => {
        setLogs(prev => {
            // 1. If it's a main 'step'
            if (type === 'step') {
                // Check if this specific step is already the latest one (ignore strict mode duplicates)
                const lastLog = prev[prev.length - 1];
                if (lastLog && lastLog.text === text && lastLog.type === 'step') {
                    return prev;
                }

                // Mark all previous "step" logs as completed
                const updatedLogs = prev.map(log =>
                    log.type === 'step' && log.status === 'pending'
                        ? { ...log, status: 'completed' }
                        : log
                );

                return [...updatedLogs, { text, type, status: 'pending', timestamp: new Date() }];
            }

            // 2. For 'process' (random) logs, just add them
            return [...prev, { text, type, timestamp: new Date() }];
        });

        // Auto scroll
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-slate-950 rounded-lg overflow-hidden shadow-2xl border border-slate-800 font-mono text-sm relative">

                {/* Title Bar */}
                <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400 font-semibold">Zuper AI Agent</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                </div>

                {/* Terminal Content */}
                <div
                    ref={scrollRef}
                    className="p-6 h-[400px] overflow-y-auto space-y-3 scroll-smooth"
                >
                    {logs.map((log, idx) => (
                        <div key={idx} className={`flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300
                    ${log.type === 'step' ? 'mt-4' : 'text-slate-300 ml-4 border-l border-slate-800 pl-4'}
                `}>
                            <span className="text-slate-600 text-xs mt-1 min-w-[60px]">
                                [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                            </span>

                            <div className="flex-1 flex items-center gap-2">
                                {log.type === 'step' ? (
                                    log.status === 'completed' ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <div className="relative">
                                            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                        </div>
                                    )
                                ) : (
                                    <span className="text-slate-500">{'>'}</span>
                                )}

                                <span className={log.type === 'step' ? (log.status === 'completed' ? 'text-green-400' : 'text-blue-400 font-bold') : 'text-slate-400'}>
                                    {log.text}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Only show bottom spinner if we haven't finished the last step */}
                    {logs.length > 0 && logs[logs.length - 1].type === 'step' && logs[logs.length - 1].status === 'pending' && (
                        <div className="ml-24 text-xs text-blue-500/50 animate-pulse mt-1">
                            Working on this step...
                        </div>
                    )}
                </div>

            </div>
            <p className="text-center text-slate-500 mt-4 text-sm">Generating Premium Report...</p>
        </div>
    );
};

export default TerminalLoader;
