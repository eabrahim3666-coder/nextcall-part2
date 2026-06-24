"use client";

export default function AIStatusPill({ isActive }: { isActive: boolean }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isActive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
            <span className="relative flex h-2 w-2">
                {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className={`text-xs font-medium ${isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isActive ? 'AI Active' : 'Limit Reached'}
            </span>
        </div>
    );
}