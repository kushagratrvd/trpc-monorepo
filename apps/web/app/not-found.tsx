import Link from "next/link"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                {/* Void glow effect */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full" />
                    <div className="relative">
                        <p className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-purple-800 font-pixel">
                            404
                        </p>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">
                    You fell into the void
                </h1>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved to another dimension.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#84cc16] px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#a3e635] hover:shadow-[0_0_20px_rgba(132,204,22,0.3)]"
                    >
                        Return to Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-sm border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:border-slate-600"
                    >
                        Go Home
                    </Link>
                </div>

                {/* Decorative void particles */}
                <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-purple-500/40 animate-pulse"
                            style={{ animationDelay: `${i * 200}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
