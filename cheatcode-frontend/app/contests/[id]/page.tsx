"use client";
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getContest, runCode, saveSubmission } from '@/lib/api';
import { Clock, Play, Send, ChevronLeft, ChevronRight } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const STARTER: Record<string, string> = {
    python: '# Write your solution here\n',
    javascript: '// Write your solution here\n',
    cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // write your solution\n    return 0;\n}\n',
};

interface Question { _id: string; title: string; description: string; constraints: string[]; sampleTestCases: { input: string; expectedOutput: string }[]; }
interface Contest { _id: string; title: string; duration: number; questions: Question[]; }

export default function ContestPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [contest, setContest] = useState<Contest | null>(null);
    const [started, setStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const timeSpentRef = useRef(0);

    const [lang, setLang] = useState<Record<number, string>>({});
    const [codes, setCodes] = useState<Record<number, string>>({});
    const [output, setOutput] = useState<Record<number, { status: string; stdout: string; stderr: string } | null>>({});
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [authError, setAuthError] = useState(false);

    useEffect(() => { getContest(id).then(r => setContest(r.data)); }, [id]);

    useEffect(() => {
        if (!started || timeLeft <= 0) return;
        const t = setInterval(() => {
            setTimeLeft(s => s - 1);
            timeSpentRef.current += 1;
        }, 1000);
        return () => clearInterval(t);
    }, [started, timeLeft]);

    const startContest = () => {
        if (!contest) return;
        setTimeLeft(contest.duration * 60);
        setStarted(true);
    };

    const getLang = (i: number) => lang[i] || 'cpp';
    const getCode = (i: number) => codes[i] || STARTER[getLang(i)];

    const handleRun = async () => {
        if (!contest) return;
        const q = contest.questions[currentQ];
        const tc = q.sampleTestCases[0];
        if (!tc) return;
        setRunning(true);
        setOutput(o => ({ ...o, [currentQ]: null }));
        try {
            const res = await runCode({ code: getCode(currentQ), language: getLang(currentQ), stdin: tc.input });
            const actualOut = (res.data.stdout || '').trim();
            const expectedOut = tc.expectedOutput.trim();
            const passed = actualOut === expectedOut;
            setOutput(o => ({
                ...o,
                [currentQ]: {
                    status: res.data.stderr ? 'Error' : (passed ? 'Accepted' : 'Wrong Answer'),
                    stdout: res.data.stdout || '',
                    stderr: res.data.stderr || '',
                },
            }));
        } catch {
            setOutput(o => ({ ...o, [currentQ]: { status: 'Error', stdout: '', stderr: 'Run failed. Is the backend running?' } }));
        } finally { setRunning(false); }
    };

    const handleSubmit = async () => {
        if (!contest) return;
        const token = localStorage.getItem('token');
        if (!token) { setAuthError(true); return; }
        setSubmitting(true);
        const answers = contest.questions.map((q, i) => ({
            questionId: q._id,
            questionTitle: q.title,
            language: getLang(i),
            code: getCode(i),
            status: output[i]?.status || 'Skipped',
            output: output[i]?.stdout || '',
        }));
        try {
            await saveSubmission({ contestId: contest._id, contestTitle: contest.title, timeTaken: timeSpentRef.current, answers });
            router.push('/submissions');
        } catch {
            setAuthError(true);
        } finally { setSubmitting(false); }
    };

    const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    if (!contest) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/30 text-sm">Loading…</div>;

    // ── Auth error modal ──────────────────────────────────────────────────────
    if (authError) return (
        <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
                <p className="text-white text-lg font-bold mb-2">Not logged in</p>
                <p className="text-white/40 text-sm mb-6">You need an account to submit. Please log in or sign up.</p>
                <div className="flex gap-3 justify-center">
                    <Link href="/login" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-semibold text-white transition-colors">Log In</Link>
                    <Link href="/signup" className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm font-semibold text-white transition-colors">Sign Up</Link>
                </div>
                <button onClick={() => setAuthError(false)} className="mt-4 text-xs text-white/30 hover:text-white transition-colors">← Back to contest</button>
            </div>
        </main>
    );

    // ── Pre-start screen ──────────────────────────────────────────────────────
    if (!started) return (
        <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-3">{contest.title}</h1>
            <div className="flex gap-6 text-white/40 text-sm mb-10">
                <span>{contest.questions.length} questions</span>
                <span>·</span>
                <span>{contest.duration} minutes</span>
            </div>
            <button onClick={startContest} className="px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold transition-colors">
                Start Contest →
            </button>
            <button onClick={() => router.push('/contests')} className="mt-4 text-sm text-white/30 hover:text-white transition-colors">
                ← Back to Contests
            </button>
        </main>
    );

    const q = contest.questions[currentQ];
    const out = output[currentQ];

    // ── Active contest ────────────────────────────────────────────────────────
    return (
        <main className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
            <header className="h-11 border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0 bg-black/50">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/contests')} className="text-white/30 hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-white/60 truncate">{contest.title}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white/50'}`}>
                        <Clock className="inline w-3.5 h-3.5 mr-1" />{fmt(timeLeft)}
                    </span>
                    <button onClick={handleSubmit} disabled={submitting}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-xs font-bold transition-colors">
                        <Send className="w-3 h-3" />
                        {submitting ? 'Submitting…' : 'Submit All'}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Question sidebar */}
                <aside className="w-40 border-r border-white/5 flex flex-col flex-shrink-0 overflow-y-auto">
                    {contest.questions.map((_, i) => (
                        <button key={i} onClick={() => setCurrentQ(i)}
                            className={`px-3 py-2.5 text-left text-sm border-b border-white/[0.04] transition-colors ${i === currentQ ? 'bg-violet-600/20 text-violet-300' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                            Q{i + 1}
                            {output[i] && (
                                <span className={`ml-2 text-xs ${output[i]?.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>●</span>
                            )}
                        </button>
                    ))}
                </aside>

                {/* Left: description */}
                <div className="w-[38%] border-r border-white/5 overflow-y-auto p-6 flex-shrink-0">
                    <p className="text-xs text-white/30 mb-1">Question {currentQ + 1} of {contest.questions.length}</p>
                    <h2 className="text-lg font-bold mb-4">{q.title}</h2>
                    <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap mb-6">{q.description}</div>

                    {q.constraints.filter(Boolean).length > 0 && (
                        <div className="mb-6">
                            <p className="text-xs font-semibold text-white/40 mb-2 uppercase">Constraints</p>
                            <ul className="space-y-1">
                                {q.constraints.filter(Boolean).map((c, i) => (
                                    <li key={i} className="text-xs text-white/50 font-mono flex gap-2">
                                        <span className="text-white/20 mt-1">•</span>{c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {q.sampleTestCases.map((tc, i) => (
                        <div key={i} className="mb-3 rounded-lg bg-white/[0.03] border border-white/5 p-3">
                            <p className="text-xs text-white/30 mb-2 font-semibold">Example {i + 1}</p>
                            <p className="text-xs font-mono"><span className="text-white/30">Input: </span><span className="text-white/60">{tc.input}</span></p>
                            <p className="text-xs font-mono"><span className="text-white/30">Output: </span><span className="text-white/60">{tc.expectedOutput}</span></p>
                        </div>
                    ))}
                </div>

                {/* Right: editor + output */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Language + Run bar */}
                    <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0 bg-black/30">
                        <select
                            value={getLang(currentQ)}
                            onChange={e => setLang(l => ({ ...l, [currentQ]: e.target.value }))}
                            className="bg-[#1e1e2e] border border-white/20 text-white text-xs rounded px-2 py-1 outline-none cursor-pointer"
                        >
                            <option value="cpp" style={{ background: '#1e1e2e', color: '#fff' }}>C++</option>
                            <option value="python" style={{ background: '#1e1e2e', color: '#fff' }}>Python</option>
                            <option value="javascript" style={{ background: '#1e1e2e', color: '#fff' }}>JavaScript</option>
                        </select>

                        <div className="flex gap-2">
                            <button onClick={() => setCurrentQ(i => Math.max(0, i - 1))} disabled={currentQ === 0}
                                className="p-1.5 rounded text-white/30 hover:text-white disabled:opacity-20 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCurrentQ(i => Math.min(contest.questions.length - 1, i + 1))} disabled={currentQ === contest.questions.length - 1}
                                className="p-1.5 rounded text-white/30 hover:text-white disabled:opacity-20 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button onClick={handleRun} disabled={running}
                                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs rounded font-medium hover:bg-emerald-600/30 disabled:opacity-50 transition-colors">
                                <Play className="w-3 h-3" />
                                {running ? 'Running…' : 'Run'}
                            </button>
                        </div>
                    </div>

                    {/* Monaco */}
                    <div className="flex-1 overflow-hidden">
                        <MonacoEditor
                            height="100%"
                            language={getLang(currentQ) === 'cpp' ? 'cpp' : getLang(currentQ)}
                            theme="vs-dark"
                            value={getCode(currentQ)}
                            onChange={val => setCodes(c => ({ ...c, [currentQ]: val || '' }))}
                            options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 } }}
                        />
                    </div>

                    {/* Output panel */}
                    <div className="h-36 border-t border-white/5 bg-black/40 flex-shrink-0 overflow-y-auto p-3">
                        {!out && <p className="text-white/20 text-xs">Click Run to test against example input.</p>}
                        {out && (
                            <>
                                <p className={`text-xs font-bold mb-2 ${out.status === 'Accepted' ? 'text-emerald-400' : out.status === 'Wrong Answer' ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {out.status}
                                </p>
                                {out.stdout && <pre className="text-xs text-white/70 font-mono whitespace-pre-wrap">{out.stdout}</pre>}
                                {out.stderr && <pre className="text-xs text-red-400/70 font-mono whitespace-pre-wrap">{out.stderr}</pre>}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
