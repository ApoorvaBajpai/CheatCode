"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createContest } from '@/lib/api';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
    title: string;
    description: string;
    constraints: string[];
    sampleTestCases: { input: string; expectedOutput: string }[];
}

const emptyQuestion = (): Question => ({
    title: '',
    description: '',
    constraints: [''],
    sampleTestCases: [{ input: '', expectedOutput: '' }],
});

export default function CreateContest() {
    const router = useRouter();

    // Step 1 state
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [numQ, setNumQ] = useState('');

    // Step 2 state
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [saving, setSaving] = useState(false);

    // ── Step 1 → Step 2 ─────────────────────────────────────────────────────
    const goToStep2 = () => {
        if (!title.trim() || !duration || !numQ) return;
        const count = Math.max(1, parseInt(numQ));
        setQuestions(Array.from({ length: count }, emptyQuestion));
        setCurrentQ(0);
        setStep(2);
    };

    // ── Question field helpers ──────────────────────────────────────────────
    const setQ = (fn: (q: Question) => Question) =>
        setQuestions(prev => prev.map((q, i) => i === currentQ ? fn(q) : q));

    const updateConstraint = (i: number, val: string) =>
        setQ(q => { const c = [...q.constraints]; c[i] = val; return { ...q, constraints: c }; });

    const addConstraint = () =>
        setQ(q => ({ ...q, constraints: [...q.constraints, ''] }));

    const removeConstraint = (i: number) =>
        setQ(q => ({ ...q, constraints: q.constraints.filter((_, ci) => ci !== i) }));

    const updateTestCase = (i: number, field: 'input' | 'expectedOutput', val: string) =>
        setQ(q => {
            const tc = [...q.sampleTestCases];
            tc[i] = { ...tc[i], [field]: val };
            return { ...q, sampleTestCases: tc };
        });

    const addTestCase = () =>
        setQ(q => ({ ...q, sampleTestCases: [...q.sampleTestCases, { input: '', expectedOutput: '' }] }));

    const removeTestCase = (i: number) =>
        setQ(q => ({ ...q, sampleTestCases: q.sampleTestCases.filter((_, ti) => ti !== i) }));

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            await createContest({ title, duration: parseInt(duration), questions });
            router.push('/contests');
        } catch (e) {
            alert('Failed to save. Make sure backend is running.');
        } finally {
            setSaving(false);
        }
    };

    const q = questions[currentQ];

    // ════════════════════════════════════════════════════════════════════════
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <header className="border-b border-white/5 px-8 py-5 flex items-center gap-4">
                <button onClick={() => step === 1 ? router.push('/contests') : setStep(1)}
                    className="text-white/40 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="font-bold text-lg">Create Contest</h1>
                    <p className="text-xs text-white/30">Step {step} of 2</p>
                </div>
            </header>

            {/* ── STEP 1: Contest metadata ─────────────────────────────────── */}
            {step === 1 && (
                <div className="max-w-lg mx-auto px-8 pt-16">
                    <h2 className="text-xl font-semibold mb-8">Contest Details</h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Contest Name *</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Google Mock Round 1"
                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500/60 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">Duration (minutes) *</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    placeholder="90"
                                    min="1"
                                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500/60 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">No. of Questions *</label>
                                <input
                                    type="number"
                                    value={numQ}
                                    onChange={e => setNumQ(e.target.value)}
                                    placeholder="3"
                                    min="1"
                                    max="20"
                                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500/60 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={goToStep2}
                        disabled={!title.trim() || !duration || !numQ}
                        className="mt-8 flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition-colors"
                    >
                        Next: Add Questions <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ── STEP 2: Question editor ──────────────────────────────────── */}
            {step === 2 && q && (
                <div className="max-w-3xl mx-auto px-8 pt-8">
                    {/* Question tabs */}
                    <div className="flex gap-2 mb-8 flex-wrap">
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQ(i)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${i === currentQ
                                        ? 'bg-violet-600 border-violet-500 text-white'
                                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                                    }`}
                            >
                                Q{i + 1}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Question Title *</label>
                            <input
                                value={q.title}
                                onChange={e => setQ(q => ({ ...q, title: e.target.value }))}
                                placeholder="e.g. Two Sum"
                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500/60 transition-colors"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Description *</label>
                            <textarea
                                value={q.description}
                                onChange={e => setQ(q => ({ ...q, description: e.target.value }))}
                                placeholder="Describe the problem..."
                                rows={6}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500/60 transition-colors resize-y font-mono"
                            />
                        </div>

                        {/* Constraints */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm text-white/60">Constraints</label>
                                <button onClick={addConstraint} className="text-xs text-violet-400 hover:text-violet-300">
                                    + Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {q.constraints.map((c, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            value={c}
                                            onChange={e => updateConstraint(i, e.target.value)}
                                            placeholder={`1 <= n <= 10^5`}
                                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500/60 font-mono transition-colors"
                                        />
                                        <button onClick={() => removeConstraint(i)}
                                            className="text-white/20 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sample Test Cases */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm text-white/60">Sample Test Cases</label>
                                <button onClick={addTestCase} className="text-xs text-violet-400 hover:text-violet-300">
                                    + Add
                                </button>
                            </div>
                            <div className="space-y-3">
                                {q.sampleTestCases.map((tc, i) => (
                                    <div key={i} className="p-4 rounded-lg bg-white/[0.03] border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-white/30 font-semibold">Case {i + 1}</span>
                                            <button onClick={() => removeTestCase(i)}
                                                className="text-white/20 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-white/40 mb-1">Input</p>
                                                <textarea
                                                    value={tc.input}
                                                    onChange={e => updateTestCase(i, 'input', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-xs font-mono outline-none focus:border-violet-500/50 resize-none transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/40 mb-1">Expected Output</p>
                                                <textarea
                                                    value={tc.expectedOutput}
                                                    onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-xs font-mono outline-none focus:border-violet-500/50 resize-none transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Navigation + Save */}
                    <div className="flex justify-between mt-10 pb-12">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentQ(i => Math.max(0, i - 1))}
                                disabled={currentQ === 0}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm disabled:opacity-30 hover:bg-white/10 transition-colors"
                            >
                                ← Prev
                            </button>
                            <button
                                onClick={() => setCurrentQ(i => Math.min(questions.length - 1, i + 1))}
                                disabled={currentQ === questions.length - 1}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm disabled:opacity-30 hover:bg-white/10 transition-colors"
                            >
                                Next →
                            </button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
                        >
                            {saving ? 'Saving...' : '✓ Save Contest'}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
