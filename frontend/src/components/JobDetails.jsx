import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState } from 'react';
import { BiCalendar } from 'react-icons/bi';
import { FaDollarSign } from 'react-icons/fa';
import { HiOutlineUser, HiOutlinePencil, HiOutlineTrash, HiX } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import AnimatedBackground from './shared/AnimatedBackground';

const JobDetails = () => {
    const { id } = useParams();
    const nav = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const parseExternalDescription = (xml) => {
        if (!xml) return { description: "", responsibilities: "", requirements: "", perks: "" };
        
        // Step 1: Decode HTML entities (&lt; -> <, &gt; -> >, &nbsp; -> space)
        const decode = (str) => {
            const txt = document.createElement("textarea");
            txt.innerHTML = str;
            return txt.value;
        };
        
        const decodedXml = decode(xml);
        
        const extract = (tag) => {
            const regex = new RegExp(`<gh-${tag}>([\\s\\S]*?)</gh-${tag}>`, 'i');
            const match = decodedXml.match(regex);
            if (!match) return "";
            
            let content = match[1];
            // Clean internal tags
            content = content.replace(/<title>([\s\S]*?)<\/title>/gi, '$1\n');
            content = content.replace(/<text>([\s\S]*?)<\/text>/gi, '$1\n');
            content = content.replace(/<bulletpoints>([\s\S]*?)<\/bulletpoints>/gi, '$1');
            content = content.replace(/<point>([\s\S]*?)<\/point>/gi, '• $1\n');
            content = content.replace(/<[^>]*>?/gm, ''); // Remove any remaining tags
            return content.trim();
        };

        // If no gh tags, just return cleaned description
        if (!decodedXml.includes('<gh-')) {
            return { 
                description: decodedXml.replace(/<[^>]*>?/gm, '').trim(), 
                responsibilities: "", 
                requirements: "", 
                perks: "" 
            };
        }

        return {
            description: extract('role-detail') || extract('intro'),
            responsibilities: extract('responsibilities'),
            requirements: extract('requirements'),
            perks: extract('perks')
        };
    };

    const { isPending, error, data: job, refetch } = useQuery({
        queryKey: [id, 'jobs'],
        queryFn: async () => {
            if (id.startsWith('arbeit-')) {
                // Fetch from external API
                const res = await fetch("https://www.arbeitnow.com/api/job-board-api");
                const arbeitData = await res.json();
                const slug = id.replace('arbeit-', '');
                const jobMatch = (arbeitData.data || []).find(j => j.slug === slug);
                
                if (!jobMatch) throw new Error("Job not found");

                const parsed = parseExternalDescription(jobMatch.description);

                return {
                    _id: id,
                    title: jobMatch.title,
                    description: parsed.description,
                    responsibilities: parsed.responsibilities,
                    requirements: parsed.requirements,
                    perks: parsed.perks,
                    salary: "Industry Standard",
                    deadline: "Ongoing",
                    joiningDate: "Immediate",
                    email: jobMatch.company_name,
                    role: jobMatch.tags?.[0] || "Remote",
                    external: true
                };
            } else {
                // Fetch from local backend
                const res = await fetch(`https://internbridge-backend-098c.onrender.com/internship/${id}`);
                return res.json();
            }
        },
    });

    const handelDelete = (id) => {
        Swal.fire({
            title: "Delete this internship?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#1a2e1e",
            confirmButtonText: "Yes, Delete",
            background: '#0f2418',
            color: '#fff',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.delete(`https://internbridge-backend-098c.onrender.com/internship/${id}`);
                    if (res.data.success) {
                        Swal.fire({ title: "Deleted!", text: res.data.message, icon: "success", background: '#0f2418', color: '#fff' });
                        nav("/");
                        refetch();
                    } else {
                        Swal.fire("Not Found", res.data.message, "error");
                    }
                } catch (error) {
                    Swal.fire("Error!", error.response?.data?.message || "Something went wrong.", "error");
                }
            }
        });
    };

    const openModal = () => { setFormData(job); setIsModalOpen(true); };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`https://internbridge-backend-098c.onrender.com/internship/${id}`, formData);
            if (res.data.success) {
                Swal.fire("Updated!", res.data.message, "success");
                setIsModalOpen(false);
                refetch();
            } else {
                Swal.fire("Error!", res.data.message, "error");
            }
        } catch (error) {
            Swal.fire("Error!", error.response?.data?.message || "Something went wrong.", "error");
        }
    };

    if (isPending) return (
        <div className="flex items-center justify-center w-full h-screen" style={{ background: '#070f09' }}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-[#05AF2B]/30 border-t-[#05AF2B] rounded-full animate-spin" />
                <span className="text-gray-500 text-sm">Loading internship...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-screen text-red-400" style={{ background: '#070f09' }}>
            An error occurred: {error.message}
        </div>
    );

    const userStorage = JSON.parse(localStorage.getItem('user'));
    const user = userStorage?.email;
    const userRole = userStorage?.role;
    const isOwner = user === job.email;

    const userEmail = JSON.parse(localStorage.getItem('user'))?.email;

    const handelApply = async () => {
        if (!userEmail) {
            Swal.fire("Error!", "Please login to apply.", "error");
            return;
        }

        if (!job?._id || !userEmail) {
            Swal.fire("Error!", "Missing internship or user information.", "error");
            return;
        }

        try {
            const res = await axios.post('https://internbridge-backend-098c.onrender.com/apply_internship', {
                jobId: job._id,
                jobTitle: job.title,
                jobCompany: job.email,
                studentEmail: userEmail,
                status: 'Applied'
            });

            if (res.data.success) {
                Swal.fire({
                    title: "Application Submitted! 🎉",
                    text: "You have successfully applied for this internship.",
                    icon: "success",
                    background: '#0f2418',
                    color: '#fff',
                    confirmButtonColor: '#05AF2B',
                });
            } else {
                Swal.fire({
                    title: "Already Applied",
                    text: res.data.message,
                    icon: "info",
                    background: '#0f2418',
                    color: '#fff',
                });
            }
        } catch (error) {
            Swal.fire("Error!", "Failed to submit application.", "error");
        }
    };

    return (
        <div className="min-h-screen relative flex justify-center px-4 py-16" style={{ background: '#070f09' }}>
            <AnimatedBackground height={100} />

            <div className="w-full max-w-3xl relative z-10 fade-in-up">
                <div className="glass-card rounded-3xl overflow-hidden">

                    {/* ── Hero Banner ── */}
                    <div className="relative w-full h-52 bg-gradient-to-r from-[#070f09] via-[#0f2418] to-[#05AF2B]/40 flex items-center justify-center overflow-hidden">
                        {/* Floating circles */}
                        <div className="absolute w-64 h-64 bg-[#05AF2B]/10 rounded-full -top-16 -right-16 blur-2xl" />
                        <div className="absolute w-32 h-32 bg-[#05AF2B]/15 rounded-full bottom-0 left-10 blur-xl" />
                        <div className="text-center relative z-10">
                            <h1 className="text-5xl font-black text-white/10 uppercase tracking-[0.15em]"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                InternBridge
                            </h1>
                            <div className="mt-3 flex items-center justify-center gap-2">
                                <div className="w-1.5 h-1.5 bg-[#05AF2B] rounded-full animate-pulse" />
                                <span className="text-xs text-[#4ade80] font-semibold tracking-widest uppercase">Active Opportunity</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Content ── */}
                    <div className="p-8 space-y-8">

                        {/* Title + Role */}
                        <div>
                            <span className="badge-purple mb-3 inline-block">{job.role || 'General'}</span>
                            <h1 className="text-3xl font-black text-white mt-1"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {job.title}
                            </h1>
                        </div>

                        {/* Key Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                {
                                    icon: <FaDollarSign className="w-5 h-5 text-[#05AF2B]" />,
                                    label: 'Stipend',
                                    value: isNaN(job.salary) ? job.salary : `$${job.salary}/mo`,
                                    bg: 'rgba(5,175,43,0.08)',
                                    border: 'rgba(5,175,43,0.2)',
                                },
                                {
                                    icon: <BiCalendar className="w-5 h-5 text-blue-400" />,
                                    label: 'Deadline',
                                    value: job.deadline || 'Ongoing',
                                    bg: 'rgba(59,130,246,0.08)',
                                    border: 'rgba(59,130,246,0.2)',
                                },
                                {
                                    icon: <BiCalendar className="w-5 h-5 text-purple-400" />,
                                    label: 'Joining',
                                    value: job.joiningDate || 'Immediate',
                                    bg: 'rgba(139,92,246,0.08)',
                                    border: 'rgba(139,92,246,0.2)',
                                },
                            ].map(s => (
                                <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                                    {s.icon}
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
                                        <p className="text-sm font-semibold text-white mt-0.5">{s.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                About the Role
                            </h2>
                            <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-line">
                                {job.description}
                            </p>
                        </div>

                        {/* Responsibilities */}
                        {job.responsibilities && (
                            <div>
                                <h2 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                    Main Tasks & Responsibilities
                                </h2>
                                <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-line">
                                    {job.responsibilities}
                                </p>
                            </div>
                        )}

                        {/* Requirements */}
                        {job.requirements && (
                            <div>
                                <h2 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                    Requirements / About You
                                </h2>
                                <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-line">
                                    {job.requirements}
                                </p>
                            </div>
                        )}

                        {/* Perks */}
                        {job.perks && (
                            <div>
                                <h2 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                    Why You'll Love It Here
                                </h2>
                                <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-line">
                                    {job.perks}
                                </p>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="divider-green" />

                        {/* Recruiter */}
                        <div className="flex items-center gap-4 p-5 rounded-2xl" style={{ background: 'rgba(5,175,43,0.06)', border: '1px solid rgba(5,175,43,0.15)' }}>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#05AF2B]/40 to-emerald-900/50 border border-[#05AF2B]/30 flex items-center justify-center">
                                <span className="text-[#4ade80] font-black text-xl">
                                    {job.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">{job.email}</p>
                                <p className="text-xs text-[#05AF2B] font-semibold tracking-wider uppercase mt-0.5">✓ Verified Recruiter</p>
                            </div>
                        </div>

                    {/* Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {userRole === 'Student' && (
                                <button
                                    onClick={handelApply}
                                    className="btn-primary-glow px-8 py-3 text-base !rounded-2xl"
                                >
                                    Apply Now →
                                </button>
                            )}

                            {isOwner && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={openModal}
                                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-400/30 hover:border-blue-400/60 px-4 py-2.5 rounded-xl transition-all duration-200"
                                    >
                                        <HiOutlinePencil className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handelDelete(job._id)}
                                        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 px-4 py-2.5 rounded-xl transition-all duration-200"
                                    >
                                        <HiOutlineTrash className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Update Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
                    <div className="glass-card rounded-3xl p-8 w-full max-w-lg shadow-2xl fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                Update Internship
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            {[
                                { name: 'title', label: 'Title', type: 'text', placeholder: 'Internship Title' },
                                { name: 'salary', label: 'Stipend', type: 'number', placeholder: 'Monthly stipend' },
                                { name: 'deadline', label: 'Deadline', type: 'date', placeholder: '' },
                            ].map(f => (
                                <div key={f.name} className="space-y-1.5">
                                    <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">{f.label}</label>
                                    <input
                                        type={f.type}
                                        name={f.name}
                                        value={formData[f.name] || ''}
                                        onChange={handleInputChange}
                                        placeholder={f.placeholder}
                                        className="input-premium rounded-xl"
                                    />
                                </div>
                            ))}

                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Describe the internship..."
                                    className="input-premium rounded-xl resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-sm text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary-glow !py-2.5 !px-6 !text-sm !rounded-xl">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDetails;
