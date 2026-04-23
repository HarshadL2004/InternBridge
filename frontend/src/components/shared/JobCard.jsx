import React from 'react';
import { BiUser } from 'react-icons/bi';
import { FaDollarSign } from 'react-icons/fa';
import { HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi';
import { NavLink } from 'react-router-dom';

const JobCard = ({ job }) => {
    const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const initial = job.email?.charAt(0).toUpperCase() || '?';

    return (
        <div className="glass-card card-glow rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden group h-full">
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#05AF2B]/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Top row: date + role */}
            <div className="flex items-center justify-between">
                <span className="badge-green">{today}</span>
                <span className="badge-purple">{job.role || 'General'}</span>
            </div>

            {/* Title */}
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-white group-hover:text-[#05AF2B] transition-colors duration-300 line-clamp-1"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {job.title}
                </h2>

                {/* Stipend row */}
                <div className="flex items-center gap-2 mt-2 bg-white/[0.04] rounded-xl px-4 py-2.5 border border-white/[0.06]">
                    <FaDollarSign className="text-[#05AF2B] w-4 h-4 shrink-0" />
                    <span className="text-xs text-gray-400 flex-1">Stipend</span>
                    <span className="text-sm font-semibold text-white">
                        {isNaN(job.salary) ? job.salary : `$${job.salary}/mo`}
                    </span>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed flex-1">
                {job.description || "No description provided."}
            </p>

            {/* Deadline & Joining badges */}
            <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 badge-red">
                    <HiOutlineCalendar className="w-3 h-3" />
                    {job.deadline || 'Ongoing'}
                </div>
                <div className="flex items-center gap-1.5 badge-green">
                    <HiOutlineClock className="w-3 h-3" />
                    {job.joiningDate || 'Immediate'}
                </div>
            </div>

            {/* Divider */}
            <div className="divider-green" />

            {/* Footer: poster + CTA */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#05AF2B]/30 to-emerald-900/50 border border-[#05AF2B]/30 flex items-center justify-center">
                        <span className="text-[#4ade80] text-xs font-bold">{initial}</span>
                    </div>
                    <span className="text-xs text-gray-400 max-w-[110px] truncate">{job.email}</span>
                </div>
                <NavLink
                    to={`/job/${job._id}`}
                    className="btn-primary-glow !py-2 !px-4 !text-xs !rounded-xl"
                >
                    View Details →
                </NavLink>
            </div>
        </div>
    );
};

export default JobCard;