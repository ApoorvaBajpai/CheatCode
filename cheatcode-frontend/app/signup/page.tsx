"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api';

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handle = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await register(form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);
            router.push('/contests');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-full max-w-sm px-8">
                <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
                <p className="text-white/40 text-sm mb-8">Join CheatCode</p>

                <form onSubmit={handle} className="space-y-4">
                    {['username', 'email', 'password'].map(field => (
                        <input key={field}
                            type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            value={(form as any)[field]} required
                            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-violet-500/60 transition-colors"
                        />
                    ))}
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <button disabled={loading}
                        className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-white transition-colors">
                        {loading ? 'Creating…' : 'Create Account'}
                    </button>
                </form>
                <p className="text-white/30 text-sm text-center mt-6">
                    Have an account? <Link href="/login" className="text-violet-400 hover:underline">Sign in</Link>
                </p>
            </div>
        </main>
    );
}
