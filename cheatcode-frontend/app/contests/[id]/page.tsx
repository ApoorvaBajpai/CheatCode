"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getContest } from '@/lib/api';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
    _id: string;
    title: string;
    description: string;
    constraints: string[];
    sampleTestCases: { input: string; expectedOutput: string }[];
}

interface Contest {
    _id: string;
    title: string;
    duration: number;
    questions: Question[];
}

export default function ContestViewer() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [contest, setContest] = useState<Contest | null>(null);
    const [started, setStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0); // seconds

    useEffect(() => {
        getContest(id).then(res => setContest(res.data));
    }, [id]);

    // Timer countdown
    useEffect(() => {
        if (!started || timeLeft <= 0) return;
        const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
        return () => clearInterval(t);
    }, [started, timeLeft]);

    const startContest = () => {
        if (!contest) return;
        setTimeLeft(contest.duration * 60);
        setStarted(true);
    };

    const fmt = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    if (!contest) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/40 text-sm">
            Loading...
        </div>
    );

    // ── Pre-start screen ─────────────────────────────────────────────────────
    if (!started) return (
        <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
            <div className="max-w-md w-full mx-auto px-8 text-center">
                <h1 className="text-3xl font-bold mb-3">{contest.title}</h1>
                <div className="flex items-center justify-center gap-6 text-white/40 text-sm mb-10">
                    <span>{contest.questions.length} questions</span>
                    <span>·</span>
                    <span>{contest.duration} minutes</span>
                </div>
                <button
                    onClick={startContest}
                    className="px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-base font-bold transition-colors"
                >
                    Start Contest →
                </button>
                <button onClick={() => router.push('/contests')}
                    className="block mx-auto mt-4 text-sm text-white/30 hover:text-white transition-colors">
                    ← Back to dashboard
                </button>
            </div>
        </main>
    );

    const q = contest.questions[currentQ];

    // ── Active contest view ──────────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
            {/* Top bar */}
            <header className="h-12 border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 bg-black/40">
                <span className="text-sm font-medium text-white/70">{contest.title}</span>
                <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white/60'}`}>
                    {timeLeft === 0 ? '⏰ Time Up!' : <><Clock className="inline w-3.5 h-3.5 mr-1" />{fmt(timeLeft)}</>}
                </span>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Question list sidebar */}
                <aside className="w-48 border-r border-white/5 p-4 flex-shrink-0">
                    <p className="text-xs text-white/30 font-semibold uppercase mb-3">Questions</p>
                    {contest.questions.map((q, i) => (
                        <button
                            key={q._id}
                            onClick={() => setCurrentQ(i)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors truncate ${i === currentQ
                                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="font-mono text-xs text-white/30 mr-2">Q{i + 1}</span>
                            {q.title || `Question ${i + 1}`}
                        </button>
                    ))}
                </aside>

                {/* Problem description */}
                <div className="flex-1 overflow-y-auto p-8">
                    <h2 className="text-xl font-bold mb-1 text-white">{q.title}</h2>
                    <p className="text-xs text-white/30 mb-6">Question {currentQ + 1} of {contest.questions.length}</p>

                    <div className="text-[15px] leading-relaxed text-white/80 whitespace-pre-wrap mb-8">
                        {q.description}
                    </div>

                    {q.constraints.filter(Boolean).length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-white/60 mb-3">Constraints</h3>
                            <ul className="space-y-1.5">
                                {q.constraints.filter(Boolean).map((c, i) => (
                                    <li key={i} className="text-sm text-white/50 font-mono flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0" />
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {q.sampleTestCases.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-white/60 mb-3">Sample Test Cases</h3>
                            <div className="space-y-3">
                                {q.sampleTestCases.map((tc, i) => (
                                    <div key={i} className="rounded-lg bg-white/[0.03] border border-white/5 overflow-hidden">
                                        <div className="px-4 py-2 border-b border-white/5">
                                            <span className="text-xs font-semibold text-white/40">Example {i + 1}</span>
                                        </div>
                                        <div className="p-4 font-mono text-sm space-y-2">
                                            <div>
                                                <span className="text-white/30">Input: </span>
                                                <span className="text-white/70">{tc.input}</span>
                                            </div>
                                            <div>
                                                <span className="text-white/30">Output: </span>
                                                <span className="text-white/70">{tc.expectedOutput}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex gap-3 mt-10">
                        <button onClick={() => setCurrentQ(i => Math.max(0, i - 1))}
                            disabled={currentQ === 0}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm disabled:opacity-30 hover:bg-white/10 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Prev
                        </button>
                        <button onClick={() => setCurrentQ(i => Math.min(contest.questions.length - 1, i + 1))}
                            disabled={currentQ === contest.questions.length - 1}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm disabled:opacity-30 hover:bg-white/10 transition-colors">
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
