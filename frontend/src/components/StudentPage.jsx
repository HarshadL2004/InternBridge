import React, { useContext, useEffect, useState } from 'react';
import SearchNav from './shared/SearchNav';
import JobCard from './shared/JobCard';
import AnimatedBackground from './shared/AnimatedBackground';
import { AuthContext } from '../config/AuthProvider';

const StudentPage = () => {
    const { user } = useContext(AuthContext);
    const [allInternships, setAllInternships] = useState([]); // Store all fetched internships
    const [filteredInternships, setFilteredInternships] = useState([]); // Store search results
    const [appliedInternships, setAppliedInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('available');

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch all local internships
            const localRes = await fetch("http://localhost:5001/internships");
            const localData = await localRes.json();

            // Fetch external internships
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
            
            setAllInternships(combined);
            setFilteredInternships(combined);

            // Fetch applied internships if user logged in
            if (user?.email) {
                const appRes = await fetch(`http://localhost:5001/applications/student/${user.email}`);
                const appData = await appRes.json();
                // Ensure appData is an array
                setAppliedInternships(Array.isArray(appData) ? appData : []);
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            setAppliedInternships([]); // Fallback to empty array on fetch error
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleSearch = (searchText, role) => {
        const query = searchText?.toLowerCase() || "";
        const roleQuery = role === "All Roles" ? "" : role?.toLowerCase() || "";

        const filtered = allInternships.filter(job => {
            const matchesTitle = job.title?.toLowerCase().includes(query);
            const matchesCompany = job.email?.toLowerCase().includes(query);
            const matchesRole = roleQuery ? job.role?.toLowerCase().includes(roleQuery) : true;
            
            // Search text can match title OR company
            return (matchesTitle || matchesCompany) && matchesRole;
        });

        setFilteredInternships(filtered);
    };

    const tabClass = (tab) => `px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
        activeTab === tab 
        ? 'bg-[#05AF2B] text-white shadow-[0_0_20px_rgba(5,175,43,0.3)]' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

    return (
        <div className="min-h-screen" style={{ background: '#070f09' }}>

            {/* ── Hero ─── */}
            <div className="relative pt-16 pb-12 px-4 overflow-hidden text-center">
                <AnimatedBackground height={100} />
                <div className="max-w-[1400px] mx-auto relative z-20 space-y-6 fade-in-up">
                    <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-[#4ade80] font-semibold tracking-widest uppercase">
                        <span className="w-1.5 h-1.5 bg-[#05AF2B] rounded-full animate-pulse" />
                        Student Dashboard
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Explore <span className="gradient-text">Internships</span>
                    </h1>
                    
                    {/* Tabs Toggles */}
                    <div className="flex justify-center gap-3 mt-8">
                        <button onClick={() => setActiveTab('available')} className={tabClass('available')}>
                            Available Internships
                        </button>
                        <button onClick={() => setActiveTab('applied')} className={tabClass('applied')}>
                            Applied Internships ({Array.isArray(appliedInternships) ? appliedInternships.length : 0})
                        </button>
                    </div>

                    {activeTab === 'available' && (
                        <div className="max-w-3xl mx-auto mt-8">
                            <SearchNav onSearch={handleSearch} />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Content ─── */}
            <div className="max-w-[1400px] mx-auto w-full px-6 pb-24">
                
                {loading ? (
                    <div className="flex items-center justify-center w-full min-h-64">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-2 border-[#05AF2B]/30 border-t-[#05AF2B] rounded-full animate-spin" />
                            <span className="text-gray-500 text-sm">Loading internships...</span>
                        </div>
                    </div>
                ) : activeTab === 'available' ? (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                            <div>
                                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                    Live <span className="text-[#05AF2B]">Opportunities</span>
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Discover roles from campus and top tech partners</p>
                            </div>
                            <span className="badge-green">{filteredInternships.length} Results</span>
                        </div>

                        {filteredInternships.length === 0 ? (
                            <div className="flex flex-col items-center justify-center w-full min-h-64 gap-4 text-center glass-card rounded-3xl p-12">
                                <div className="text-5xl">🔍</div>
                                <h2 className="text-xl font-bold text-gray-300">No Internships Found</h2>
                                <p className="text-gray-500 text-sm">Try adjusting your search filters or browse other categories.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredInternships.map((job, i) => (
                                    <div key={job._id} className="fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
                                        <JobCard job={job} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                My <span className="text-[#05AF2B]">Applications</span>
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Track the status of your submitted applications</p>
                        </div>

                        {!Array.isArray(appliedInternships) || appliedInternships.length === 0 ? (
                            <div className="flex flex-col items-center justify-center w-full min-h-64 gap-4 text-center glass-card rounded-3xl p-12">
                                <div className="text-5xl">📁</div>
                                <h2 className="text-xl font-bold text-gray-300">No Applications Yet</h2>
                                <p className="text-gray-500 text-sm max-w-md">You haven't applied for any internships yet. Head over to the available tab to start your journey!</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.isArray(appliedInternships) && appliedInternships.map((app, i) => (
                                    <div key={app._id} className="fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
                                        <JobCard job={app.jobDetails} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentPage;

