import { useEffect, useState } from "react";
import SearchNav from "./shared/SearchNav";
import AnimatedBackground from "./shared/AnimatedBackground";
import JobCard from "./shared/JobCard";
import Footer from "./Footer";

const statsData = [
    { value: "10K+", label: "Internships" },
    { value: "500+", label: "Companies" },
    { value: "50K+", label: "Students" },
];

const features = [
    {
        title: "Diverse Categories",
        desc: "Find internships across software, design, data, and more.",
        icon: "🚀"
    },
    {
        title: "Direct Connect",
        desc: "Communicate directly with hiring managers and recruiters.",
        icon: "💬"
    },
    {
        title: "Career Growth",
        desc: "Access exclusive workshops and career guidance resources.",
        icon: "📈"
    }
];

const steps = [
    { step: "01", title: "Create Profile", desc: "Build a standout profile with your skills." },
    { step: "02", title: "Search Roles", desc: "Filter by industry, role, or company." },
    { step: "03", title: "Apply Fast", desc: "One-click application to multiple roles." },
    { step: "04", title: "Get Hired", desc: "Interview and land your dream internship." }
];

const Home = () => {
    const [allJobs, setAllJobs] = useState([]); // Master list
    const [jobs, setJobs] = useState([]); // Filtered list
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const localRes = await fetch("https://internbridge-backend-098c.onrender.com/internships");
                const localData = await localRes.json();

                const arbeitRes = await fetch("https://www.arbeitnow.com/api/job-board-api");
                const arbeitData = await arbeitRes.json();

                const today = new Date().toISOString().split('T')[0];

                const formattedArbeit = [];
                const seenJobs = new Set();
                const itKeywords = [
                    'software', 'developer', 'engineer', 'data', 'it', 'computing', 'web', 'frontend', 'backend', 'fullstack', 
                    'devops', 'cyber', 'ai', 'machine learning', 'tech', 'cloud', 'aws', 'azure', 'javascript', 'python', 
                    'java', 'react', 'node', 'security', 'tester', 'qa', 'mobile', 'ios', 'android', 'embedded', 'network',
                    'systems', 'application'
                ];

                (arbeitData.data || []).forEach(job => {
                    const title = job.title.toLowerCase();
                    const tags = (job.tags || []).map(t => t.toLowerCase());
                    const isIT = itKeywords.some(kw => title.includes(kw) || tags.some(t => t.includes(kw)));

                    if (isIT) {
                        const jobKey = `${job.title}-${job.company_name}`.toLowerCase();
                        if (!seenJobs.has(jobKey)) {
                            seenJobs.add(jobKey);
                            
                            // Determine a better role name from tags if possible
                            let bestRole = "IT & Software";
                            if (title.includes('frontend')) bestRole = "Frontend Developer";
                            else if (title.includes('backend')) bestRole = "Backend Developer";
                            else if (title.includes('fullstack')) bestRole = "Fullstack Developer";
                            else if (title.includes('data')) bestRole = "Data Science / Engineering";
                            else if (title.includes('mobile') || title.includes('ios') || title.includes('android')) bestRole = "Mobile App Developer";
                            else if (title.includes('cyber') || title.includes('security')) bestRole = "Cybersecurity";
                            else if (tags.length > 0) bestRole = job.tags[0];

                            // Quick decode and strip tags for card preview
                            const decode = (str) => {
                                const txt = document.createElement("textarea");
                                txt.innerHTML = str;
                                return txt.value;
                            };
                            const cleanText = decode(job.description).replace(/<[^>]*>?/gm, '');

                            formattedArbeit.push({
                                _id: `arbeit-${job.slug}`,
                                title: job.title,
                                description: cleanText.substring(0, 180) + "...",
                                salary: "Industry Standard",
                                deadline: "Ongoing",
                                joiningDate: "Immediate",
                                email: job.company_name,
                                role: bestRole,
                                external: true
                            });
                        }
                    }
                });

                const activeLocalJobs = localData.filter(job => !job.deadline || job.deadline >= today);
                const combined = [...activeLocalJobs, ...formattedArbeit];
                setAllJobs(combined);
                setJobs(combined);
            } catch (err) {
                console.error("Error fetching jobs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleSearch = (searchText, role) => {
        const query = searchText?.toLowerCase() || "";
        const roleQuery = role === "All Roles" ? "" : role?.toLowerCase() || "";

        const filtered = allJobs.filter(job => {
            const matchesTitle = job.title?.toLowerCase().includes(query);
            const matchesCompany = job.email?.toLowerCase().includes(query);
            const matchesRole = roleQuery ? job.role?.toLowerCase().includes(roleQuery) : true;
            
            return (matchesTitle || matchesCompany) && matchesRole;
        });

        setJobs(filtered);
    };

    return (
        <div className="relative flex flex-col min-h-screen" style={{ background: '#070f09' }}>

            {/* ── Hero Section ───────────────────────────────── */}
            <div className="relative pt-20 pb-28 px-4 overflow-hidden">
                <AnimatedBackground height={100} />

                {/* Radial overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#070f09] pointer-events-none z-10" />

                <div className="max-w-[1400px] mx-auto text-center relative z-20 space-y-8 fade-in-up">
                    {/* Label badge */}
                    <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-[#4ade80] font-semibold tracking-widest uppercase">
                        <span className="w-1.5 h-1.5 bg-[#05AF2B] rounded-full animate-pulse" />
                        Live Opportunities Available
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black leading-tight text-white">
                        Find Your Dream{' '}
                        <span className="gradient-text">Internship</span>
                    </h1>

                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Kickstart your career by applying to the best internship opportunities
                        offered by top companies directly through our campus portal.
                    </p>

                    {/* Search */}
                    <div className="max-w-3xl mx-auto mt-6">
                        <SearchNav onSearch={handleSearch} />
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap justify-center gap-8 pt-8">
                        {statsData.map(({ value, label }) => (
                            <div key={label} className="text-center">
                                <div className="text-3xl font-black gradient-text">{value}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Job Cards ───────────────────────────────────── */}
            <div className="mx-auto max-w-[1400px] w-full px-6 pb-24">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-white">
                            Available <span className="text-[#05AF2B]">Opportunities</span>
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Browse and apply to the latest internships</p>
                    </div>
                    <span className="badge-green">
                        {jobs.length} Results
                    </span>
                </div>

                {/* Cards Grid */}
                {loading ? (
                    <div className="flex items-center justify-center w-full min-h-96">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-2 border-[#05AF2B]/30 border-t-[#05AF2B] rounded-full animate-spin" />
                            <span className="text-gray-500 text-sm">Loading internships...</span>
                        </div>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center w-full min-h-96 gap-4 text-center">
                        <div className="text-5xl">🔍</div>
                        <p className="text-gray-400">No internships found. Try adjusting your search.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job, i) => (
                            <div key={job._id} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                <JobCard job={job} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Why Choose Us ────────────────────────────────── */}
            <div className="py-24 px-6 relative overflow-hidden">
                 <div className="max-w-[1400px] mx-auto relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-bold text-white">Why <span className="text-[#05AF2B]">InternBridge</span>?</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">We prioritize your career trajectory with features designed for impact.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="glass-card p-10 rounded-3xl space-y-4 hover:border-[#05AF2B]/40 transition-all duration-300">
                                <div className="text-4xl mb-4">{f.icon}</div>
                                <h3 className="text-xl font-bold text-white">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>

            {/* ── How It Works ─────────────────────────────────── */}
            <div className="py-24 px-6 bg-[#0a1a0f]/50">
                 <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 space-y-8">
                        <h2 className="text-4xl font-black text-white leading-tight">Fast-track your intern search in <span className="gradient-text">4 simple steps</span></h2>
                        <p className="text-gray-400 leading-relaxed">Our platform is optimized for speed and clarity, ensuring you spend less time searching and more time growing.</p>
                        <button className="btn-primary-glow">Learn More About Us</button>
                    </div>
                    <div className="lg:w-1/2 grid sm:grid-cols-2 gap-6">
                        {steps.map((s, i) => (
                            <div key={i} className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] space-y-4">
                                <div className="text-xs font-bold text-[#05AF2B] tracking-tighter opacity-50">{s.step}</div>
                                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>

            {/* ── Newsletter ────────────────────────────────────── */}
            <div className="py-24 px-6 relative">
                <div className="max-w-4xl mx-auto glass-card rounded-[40px] p-12 text-center space-y-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#05AF2B]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-3xl font-black text-white">Never miss an <span className="text-[#05AF2B]">Update</span></h2>
                        <p className="text-gray-400 max-w-md mx-auto">Get the best internship opportunities delivered straight to your inbox every week.</p>
                        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 mt-8">
                            <input type="email" placeholder="Enter your email address" className="input-premium rounded-2xl flex-1" />
                            <button className="btn-primary-glow px-8 rounded-2xl">Subscribe</button>
                        </div>
                        <p className="text-[10px] text-gray-600">By subscribing, you agree with our Terms of Service and Privacy Policy.</p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Home;

