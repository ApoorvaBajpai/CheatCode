"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubmissions } from '@/lib/api';
import { Clock, ChevronDown, ChevronRight } from 'lucide-react';

const fmt = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

const STATUS_COLOR: Record<string, string> = {
    'Accepted': 'text-emerald-400',
    'Wrong Answer': 'text-red-400',
    'Error': 'text-orange-400',
    'Skipped': 'text-white/30',
};

export default function SubmissionsPage() {
    const [subs, setSubs] = useState<any[]>([]);
    const [open, setOpen] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSubmissions().then(r => setSubs(r.data)).finally(() => setLoading(false));
    }, []);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <header className="border-b border-white/5 px-8 py-5 flex items-center justify-between">
                <div>
                    <Link href="/contests" className="text-white/30 text-sm hover:text-white">← Contests</Link>
                    <h1 className="text-xl font-bold mt-1">My Submissions</h1>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-8 pt-8">
                {loading && <p className="text-white/30 text-sm">Loading…</p>}
                {!loading && subs.length === 0 && (
                    <p className="text-white/30 text-sm">No submissions yet. Complete a contest to see results here.</p>
                )}

                <div className="space-y-3">
                    {subs.map(sub => (
                        <div key={sub._id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                            {/* Header row */}
                            <button
                                onClick={() => setOpen(open === sub._id ? null : sub._id)}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.03] transition-colors"
                            >
                                <div className="text-left">
                                    <p className="font-semibold text-white">{sub.contestTitle}</p>
                                    <div className="flex gap-4 mt-1 text-xs text-white/40">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {fmt(sub.timeTaken)}
                                        </span>
                                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                                        <span>{sub.answers?.length} question{sub.answers?.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                {open === sub._id ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
                            </button>

                            {/* Expanded answers */}
                            {open === sub._id && (
                                <div className="border-t border-white/5">
                                    {sub.answers.map((a: any, i: number) => (
                                        <div key={i} className="border-b border-white/[0.04] last:border-0 p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-medium text-white/80">Q{i + 1}: {a.questionTitle}</p>
                                                <span className={`text-xs font-semibold ${STATUS_COLOR[a.status] || 'text-white/40'}`}>
                                                    {a.status}
                                                </span>
                                            </div>

                                            {a.output && (
                                                <div className="mb-3 p-3 rounded-lg bg-black/30 border border-white/5">
                                                    <p className="text-xs text-white/30 mb-1">Output</p>
                                                    <pre className="text-xs text-white/60 font-mono whitespace-pre-wrap">{a.output}</pre>
                                                </div>
                                            )}

                                            {a.code && (
                                                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                                                    <p className="text-xs text-white/30 mb-1">{a.language}</p>
                                                    <pre className="text-xs text-white/60 font-mono whitespace-pre-wrap overflow-x-auto">{a.code}</pre>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
