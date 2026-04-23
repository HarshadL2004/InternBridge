import { useState } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";

const SearchNav = ({ onSearch }) => {
    const [searchText, setSearchText] = useState("");
    const [role, setRole] = useState("All Roles");

    const roles = [
        "All Roles",
        "Web Developer",
        "Software Engineer",
        "UI/UX Designer",
        "Mobile App Developer",
        "Data Scientist",
    ];

    const handleSearch = () => {
        onSearch(searchText, role);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="flex items-center flex-col sm:flex-row gap-3">
                {/* Main search bar */}
                <div className="flex items-center glass rounded-2xl px-4 py-3 w-full flex-1 gap-3 border border-[rgba(5,175,43,0.2)] hover:border-[rgba(5,175,43,0.4)] focus-within:border-[#05AF2B] focus-within:shadow-[0_0_24px_rgba(5,175,43,0.15)] transition-all duration-300">

                    {/* Search input */}
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search internships, skills, companies..."
                        className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    />

                    {/* Divider */}
                    <div className="w-px h-5 bg-white/10 hidden sm:block" />

                    {/* Role dropdown */}
                    <div className="relative flex items-center gap-1 shrink-0">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="bg-transparent text-gray-300 outline-none cursor-pointer text-xs max-w-[130px] appearance-none pr-4"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            {roles.map((r) => (
                                <option key={r} value={r} className="bg-[#0f2418] text-white">
                                    {r}
                                </option>
                            ))}
                        </select>
                        <FiChevronDown className="absolute right-0 text-gray-500 w-3 h-3 pointer-events-none" />
                    </div>

                    {/* Search button */}
                    <button
                        onClick={handleSearch}
                        className="w-9 h-9 bg-gradient-to-br from-[#05AF2B] to-emerald-700 rounded-xl flex items-center justify-center text-white hover:shadow-[0_0_16px_rgba(5,175,43,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
                    >
                        <FiSearch size={16} />
                    </button>
                </div>

                {/* Advanced search pill */}
                <button className="whitespace-nowrap text-xs font-semibold text-[#05AF2B] border border-[#05AF2B]/40 px-4 py-3 rounded-2xl hover:bg-[#05AF2B]/10 hover:border-[#05AF2B] transition-all duration-200 tracking-wide">
                    Filters ⚙
                </button>
            </div>

            {/* Quick role tags */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {roles.map((r) => (
                    <button
                        key={r}
                        onClick={() => { setRole(r); onSearch(searchText, r); }}
                        className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 ${
                            role === r
                                ? 'bg-[#05AF2B]/20 border-[#05AF2B]/50 text-[#4ade80]'
                                : 'border-white/10 text-gray-500 hover:border-white/25 hover:text-gray-300'
                        }`}
                    >
                        {r}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchNav;