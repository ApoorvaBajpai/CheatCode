import Link from 'next/link';
import { Terminal, Trophy, User } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full h-16 glass z-50 flex items-center justify-between px-8 border-b border-white/10">
            <div className="flex items-center gap-2">
                <Terminal className="text-primary w-6 h-6" />
                <span className="text-xl font-bold premium-gradient">CheatCode</span>
            </div>

            <div className="flex items-center gap-8">
                <Link href="/problems" className="hover:text-primary transition-colors">Problems</Link>
                <Link href="/contests" className="hover:text-primary transition-colors">Contests</Link>
                <Link href="/leaderboard" className="hover:text-primary transition-colors flex items-center gap-1">
                    <Trophy className="w-4 h-4" /> Leaderboard
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <User className="w-5 h-5" />
                </div>
            </div>
        </nav>
    );
}
