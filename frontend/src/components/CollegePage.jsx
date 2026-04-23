import React, { useEffect, useState } from 'react';
import AnimatedBackground from './shared/AnimatedBackground';

const CollegePage = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5001/college/stats')
            .then(res => res.json())
            .then(data => {
                setStatsData(data);
                setLoading(false);
            }).catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading || !statsData) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#070f09' }}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-[#05AF2B]/30 border-t-[#05AF2B] rounded-full animate-spin" />
                <span className="text-gray-500 text-sm">Loading dashboard...</span>
            </div>
        </div>
    );

    const { studentCount, companyCount, applicationCount, studentList, companyList } = statsData;

    const stats = [
        {
            label: 'Registered Students',
            value: studentCount,
            icon: '🎓',
            color: '#05AF2B',
            bg: 'rgba(5, 175, 43, 0.08)',
            border: 'rgba(5, 175, 43, 0.2)',
        },
        {
            label: 'Active Companies',
            value: companyCount,
            icon: '🏢',
            color: '#3b82f6',
            bg: 'rgba(59, 130, 246, 0.08)',
            border: 'rgba(59, 130, 246, 0.2)',
        },
        {
            label: 'Applied Internships',
            value: applicationCount,
            icon: '📝',
            color: '#a78bfa',
            bg: 'rgba(139, 92, 246, 0.08)',
            border: 'rgba(139, 92, 246, 0.2)',
        },
    ];

    return (
        <div className="min-h-screen" style={{ background: '#070f09' }}>

            {/* ── Header ── */}
            <div className="relative pt-16 pb-16 px-6 overflow-hidden">
                <AnimatedBackground height={100} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#070f09] pointer-events-none z-10" />

                <div className="max-w-[1400px] mx-auto relative z-20 fade-in-up space-y-3">
                    <div className="inline-flex items-center gap-2 badge-green">
                        <span className="w-1.5 h-1.5 bg-[#05AF2B] rounded-full animate-pulse" />
                        College Administration
                    </div>
                    <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Campus <span className="gradient-text">Overview</span>
                    </h1>
                    <p className="text-gray-400 text-sm max-w-xl">
                        Monitor registered users, active companies, and student application progress.
                    </p>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 pb-24 space-y-10">

                {/* ── Stat Cards ── */}
                <div className="grid sm:grid-cols-3 gap-5 fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {stats.map(s => (
                        <div
                            key={s.label}
                            className="glass-card card-glow rounded-2xl p-6 flex items-center gap-5"
                            style={{ borderColor: s.border }}
                        >
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                                style={{ background: s.bg, border: `1px solid ${s.border}` }}
                            >
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
                                <p className="text-3xl font-black text-white mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: s.color }}>
                                    {s.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Tables ── */}
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Students List */}
                    <div className="glass-card rounded-3xl p-7 fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                Registered Students
                            </h3>
                            <span className="badge-green">{studentList.length}</span>
                        </div>
                        <div className="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentList.map((u, i) => (
                                        <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#05AF2B]/30 to-emerald-900/40 flex items-center justify-center shrink-0">
                                                        <span className="text-[#4ade80] text-xs font-bold">{u.email?.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-sm text-gray-300">{u.email}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Companies List */}
                    <div className="glass-card rounded-3xl p-7 fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                Registered Companies
                            </h3>
                            <span className="badge-purple">{companyList.length}</span>
                        </div>
                        <div className="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companyList.map((u, i) => (
                                        <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3b82f6]/30 to-blue-900/40 flex items-center justify-center shrink-0">
                                                        <span className="text-blue-400 text-xs font-bold">{u.email?.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-sm text-gray-300">{u.email}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollegePage;
