"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getContests, deleteContest } from '@/lib/api';
import { Plus, Clock, FileText, Trash2, Play } from 'lucide-react';

interface ContestSummary {
    _id: string;
    title: string;
    duration: number;
    questionCount: number;
    createdAt: string;
}

export default function ContestsDashboard() {
    const router = useRouter();
    const [contests, setContests] = useState<ContestSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            const res = await getContests();
            setContests(res.data);
        } catch (err: any) {
            if (err.response?.status === 401) router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/login'); return; }
        fetchAll();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this contest?')) return;
        await deleteContest(id);
        setContests(prev => prev.filter(c => c._id !== id));
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="border-b border-white/5 px-8 py-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">CheatCode</h1>
                    <p className="text-sm text-white/40 mt-0.5">Contest Platform</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/submissions" className="text-sm text-white/40 hover:text-white transition-colors">
                        My Submissions
                    </Link>
                    <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                        className="text-sm text-white/30 hover:text-white transition-colors">
                        Logout
                    </button>
                    <Link href="/contests/create"
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-semibold transition-colors">
                        <Plus className="w-4 h-4" /> New Contest
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-8 pt-10">
                <h2 className="text-lg font-semibold mb-6 text-white/80">Your Contests</h2>

                {loading && (
                    <p className="text-white/30 text-sm">Loading...</p>
                )}

                {!loading && contests.length === 0 && (
                    <div className="text-center py-20 border border-white/5 rounded-xl">
                        <p className="text-white/30 mb-4">No contests yet.</p>
                        <Link href="/contests/create" className="text-violet-400 hover:underline text-sm">
                            Create your first contest →
                        </Link>
                    </div>
                )}

                <div className="grid gap-4">
                    {contests.map(c => (
                        <div
                            key={c._id}
                            className="flex items-center justify-between p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white truncate">{c.title}</h3>
                                <div className="flex gap-4 mt-1.5 text-xs text-white/40">
                                    <span className="flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5" />
                                        {c.questionCount} question{c.questionCount !== 1 ? 's' : ''}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {c.duration} min
                                    </span>
                                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 ml-4">
                                <Link
                                    href={`/contests/${c._id}`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-400 text-sm font-medium hover:bg-violet-600/30 transition-colors"
                                >
                                    <Play className="w-3.5 h-3.5" />
                                    Start
                                </Link>
                                <button
                                    onClick={() => handleDelete(c._id)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
