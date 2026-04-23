import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../config/AuthProvider';
import JobCard from './shared/JobCard';
import SearchNav from './shared/SearchNav';
import { NavLink } from 'react-router-dom';
import AnimatedBackground from './shared/AnimatedBackground';

const CompanyPage = () => {
    const { user } = useContext(AuthContext);
    const [allInternships, setAllInternships] = useState([]);
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email) {
            fetch(`https://internbridge-backend-098c.onrender.com/internships/company/${user.email}`)
                .then(res => res.json())
                .then(data => { 
                    setAllInternships(data);
                    setInternships(data); 
                    setLoading(false); 
                })
                .catch(err => { console.error(err); setLoading(false); });
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleSearch = (searchText, role) => {
        const query = searchText?.toLowerCase() || "";
        const roleQuery = role === "All Roles" ? "" : role?.toLowerCase() || "";

        const filtered = allInternships.filter(job => {
            const matchesTitle = job.title?.toLowerCase().includes(query);
            const matchesRole = roleQuery ? job.role?.toLowerCase().includes(roleQuery) : true;
            return matchesTitle && matchesRole;
        });

        setInternships(filtered);
    };

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#070f09' }}>
            <p className="text-red-400 text-lg font-semibold">Please log in to view the Company Dashboard.</p>
        </div>
    );

    return (
        <div className="min-h-screen" style={{ background: '#070f09' }}>
            {/* ── Header ── */}
            <div className="relative pt-16 pb-16 px-6 overflow-hidden">
                <AnimatedBackground height={100} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#070f09] pointer-events-none z-10" />

                <div className="max-w-[1400px] mx-auto relative z-20 fade-in-up">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 badge-green">
                                <span className="w-1.5 h-1.5 bg-[#05AF2B] rounded-full animate-pulse" />
                                Company Dashboard
                            </div>
                            <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                Your <span className="gradient-text">Internships</span>
                            </h1>
                            <p className="text-gray-400 text-sm">
                                Welcome, <span className="text-white font-medium">{user.email}</span>. Manage your active listings below.
                            </p>
                        </div>
                        <NavLink
                            to="/add_job"
                            className="btn-primary-glow !rounded-2xl text-sm shrink-0 text-center"
                        >
                            + Post New Internship
                        </NavLink>
                    </div>

                    {/* Search Bar for Company */}
                    <div className="max-w-3xl mt-10">
                        <SearchNav onSearch={handleSearch} />
                    </div>
                </div>
            </div>

            {/* ── Stats & Cards ── */}
            <div className="max-w-[1400px] mx-auto px-6 pb-24">
                {/* Quick stat */}
                <div className="mb-10">
                    <div className="glass-card rounded-2xl p-6 inline-flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#05AF2B]/30 to-emerald-900/40 flex items-center justify-center">
                            <span className="text-[#4ade80] font-black text-xl">📋</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Listed</p>
                            <p className="text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {internships.length}
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center w-full min-h-64">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-2 border-[#05AF2B]/30 border-t-[#05AF2B] rounded-full animate-spin" />
                            <span className="text-gray-500 text-sm">Loading your internships...</span>
                        </div>
                    </div>
                ) : internships.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {internships.map((internship, i) => (
                            <div key={internship._id} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                <JobCard job={internship} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center w-full min-h-64 gap-4 text-center glass-card rounded-3xl p-12">
                        <div className="text-5xl">📝</div>
                        <h2 className="text-xl font-bold text-gray-300">No Internships Posted Yet</h2>
                        <p className="text-gray-500 text-sm max-w-md">Start posting internships to connect with talented students from top campuses.</p>
                        <NavLink to="/add_job" className="btn-primary-glow !rounded-xl text-sm mt-4">
                            Post Your First Internship →
                        </NavLink>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyPage;
