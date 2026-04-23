import { useContext, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { AuthContext } from '../config/AuthProvider';
import AnimatedBackground from './shared/AnimatedBackground';
import { HiOutlineBriefcase, HiOutlineCalendar, HiOutlineCurrencyDollar, HiOutlineClipboardList } from 'react-icons/hi';

const AddJob = () => {
    const [role, setRole] = useState("Select a skill");
    const roles = [
        "Select a skill",
        "Web Developer",
        "Software Engineer",
        "UI/UX Designer",
        "Mobile App Developer",
        "Data Scientist",
    ];

    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="flex items-center justify-center w-full h-screen" style={{ background: '#070f09' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#05AF2B]/30 border-t-[#05AF2B] rounded-full animate-spin" />
                    <span className="text-gray-500 text-sm">Checking permissions...</span>
                </div>
            </div>
        );
    }

    const handelSerssion = async (e) => {
        e.preventDefault();
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
        });

        const title = e.target.title.value;
        const description = e.target.description.value;
        const salary = e.target.salary.value;
        const responsibilities = e.target.Responsibilities.value;
        const deadline = e.target.deadline.value;
        const joiningDate = e.target.joiningDate.value;
        const role = e.target.role.value;
        const email = user.email;

        if (!title || !description || !salary || !responsibilities || !deadline || !joiningDate || !role) {
            Toast.fire({ icon: "error", title: 'All fields must be filled out.' });
            return;
        }

        const jobDetails = { title, description, salary, responsibilities, deadline, joiningDate, role, email, postedAt: new Date().toISOString() };

        Swal.fire({
            title: "Post this internship?",
            text: "It will be visible to all students immediately.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#05AF2B",
            cancelButtonColor: "#1a2e1e",
            confirmButtonText: "Yes, Post it!",
            background: '#0f2418',
            color: '#fff',
        }).then(async (result) => {
            if (result.isConfirmed) {
                axios.post('https://internbridge-backend-098c.onrender.com/add_internship', jobDetails)
                    .then(res => {
                        if (res.data.acknowledged) {
                            Swal.fire({ title: "Posted! 🎉", text: "Your internship is now live.", icon: "success", background: '#0f2418', color: '#fff', confirmButtonColor: '#05AF2B' });
                            e.target.reset();
                            setRole("Select a skill");
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        Swal.fire("Error", "Could not post internship", "error");
                    });
            }
        });
    };

    const fields = [
        { name: 'title', type: 'text', placeholder: 'Internship Title', icon: <HiOutlineBriefcase />, span: 3 },
        { name: 'description', type: 'text', placeholder: 'Brief Description', icon: <HiOutlineClipboardList />, span: 3 },
        { name: 'salary', type: 'number', placeholder: 'Stipend per month (USD)', icon: <HiOutlineCurrencyDollar />, span: 3 },
        { name: 'Responsibilities', type: 'text', placeholder: 'Responsibilities (comma-separated)', icon: <HiOutlineClipboardList />, span: 3 },
    ];

    return (
        <div className="min-h-screen relative px-4 py-16" style={{ background: '#070f09' }}>
            <AnimatedBackground height={100} />

            <div className="max-w-3xl mx-auto relative z-10 fade-in-up">
                {/* Page Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 badge-green mb-4">
                        <span className="w-1.5 h-1.5 bg-[#05AF2B] rounded-full" />
                        Company Dashboard
                    </div>
                    <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Post an <span className="gradient-text">Internship</span>
                    </h1>
                    <p className="text-gray-500 mt-3 text-sm max-w-md mx-auto">
                        Fill in the details below to connect with talented students looking for opportunities.
                    </p>
                </div>

                <form onSubmit={handelSerssion}>
                    <div className="glass-card rounded-3xl p-8 space-y-6">
                        <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Internship Details
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Title */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">Title</label>
                                <input name="title" type="text" placeholder="e.g. Frontend Developer Intern" className="input-premium rounded-xl" />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">Description</label>
                                <input name="description" type="text" placeholder="Brief role overview..." className="input-premium rounded-xl" />
                            </div>

                            {/* Stipend */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">Stipend ($/mo)</label>
                                <input name="salary" type="number" placeholder="500" className="input-premium rounded-xl" />
                            </div>

                            {/* Role */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">Skill Category</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    name="role"
                                    className="input-premium rounded-xl bg-[#070f09] appearance-none cursor-pointer"
                                >
                                    {roles.map(r => (
                                        <option key={r} value={r} className="bg-[#0f2418] text-white">{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Responsibilities */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">Responsibilities</label>
                                <input name="Responsibilities" type="text" placeholder="e.g. Build UI, Write tests, Code reviews" className="input-premium rounded-xl" />
                            </div>

                            {/* Deadline */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">Application Deadline</label>
                                <input name="deadline" type="date" className="input-premium rounded-xl" />
                            </div>

                            {/* Joining Date */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">Joining Date</label>
                                <input name="joiningDate" type="date" className="input-premium rounded-xl" />
                            </div>
                        </div>

                        {/* Posting as */}
                        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(5,175,43,0.06)', border: '1px solid rgba(5,175,43,0.15)' }}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#05AF2B]/40 to-emerald-900/50 flex items-center justify-center">
                                <span className="text-[#4ade80] font-black">{user.email?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Posting as</p>
                                <p className="text-sm font-semibold text-white">{user.email}</p>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary-glow w-full py-4 text-base !rounded-2xl">
                            🚀 Publish Internship
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddJob;
