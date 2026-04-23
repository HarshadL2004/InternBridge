import { NavLink } from 'react-router-dom';
import img1 from '/1.png';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../config/AuthProvider';
import AnimatedBackground from './shared/AnimatedBackground';

const Signup = () => {
    const { setUser } = useContext(AuthContext);
    const navg = useNavigate();

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmpassword = e.target.confirmpassword.value;
        const role = e.target.role.value;

        if (!email || !password || !confirmpassword || !role) {
            Toast.fire({ icon: "error", title: 'All fields must be filled out.' });
            return;
        }
        if (password !== confirmpassword) {
            Toast.fire({ icon: "error", title: "Passwords don't match" });
            return;
        }

        axios.post('https://internbridge-backend-098c.onrender.com/add_user', { email, password, role })
            .then(() => {
                const newUser = { email, role };
                localStorage.setItem('user', JSON.stringify(newUser));
                setUser(newUser);
                Toast.fire({ icon: "success", title: `Welcome aboard! 🎉` });
                navg(location.state || '/');
            })
            .catch(err => console.log(err));
    };

    const handleSocial = (platform) => {
        Swal.fire({
            title: "Coming Soon",
            text: `${platform} login will be available in the next update.`,
            icon: "info",
            background: '#0f2418',
            color: '#fff',
            confirmButtonColor: '#05AF2B',
        });
    };

    const roleOptions = [
        { value: 'Student', label: '🎓  Student', desc: 'Find & apply to internships' },
        { value: 'Company', label: '🏢  Company', desc: 'Post and manage internships' },
        { value: 'College', label: '🏫  College', desc: 'Manage campus placements' },
    ];

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-16" style={{ background: '#070f09' }}>
            <AnimatedBackground height={100} />

            <div className="w-full max-w-4xl flex flex-row-reverse items-center gap-16 relative z-10">

                {/* ── Form Card ── */}
                <div className="glass-card rounded-3xl p-10 w-full max-w-md fade-in-up">
                    {/* Header */}
                    <div className="mb-7 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#05AF2B] to-emerald-800 shadow-[0_0_24px_rgba(5,175,43,0.4)] mb-4">
                            <span className="text-white font-black text-xl">IB</span>
                        </div>
                        <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Create account
                        </h1>
                        <p className="text-gray-500 text-sm mt-2">
                            Already a member?{' '}
                            <NavLink to="/login" className="text-[#05AF2B] hover:text-[#4ade80] transition-colors font-semibold">
                                Sign in
                            </NavLink>
                        </p>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                className="input-premium rounded-xl"
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">I am a...</label>
                            <select
                                name="role"
                                id="role"
                                className="input-premium rounded-xl bg-[#070f09] appearance-none cursor-pointer"
                            >
                                {roleOptions.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-[#0f2418] text-white">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Min. 8 characters"
                                className="input-premium rounded-xl"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 font-medium tracking-wider uppercase">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmpassword"
                                placeholder="Repeat password"
                                className="input-premium rounded-xl"
                            />
                        </div>

                        <button type="submit" className="btn-primary-glow w-full py-3 mt-1 text-base !rounded-xl">
                            Create Account →
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 divider-green" />
                        <span className="text-xs text-gray-600">or sign up with</span>
                        <div className="flex-1 divider-green" />
                    </div>

                    {/* Social */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSocial('Google')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-gray-300 text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                        >
                            <svg viewBox="0 0 32 32" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z" />
                            </svg>
                            Google
                        </button>
                        <button
                            onClick={() => handleSocial('Twitter')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-gray-300 text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                        >
                            <svg viewBox="0 0 32 32" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M31.937 6.093c-1.177 0.516-2.437 0.871-3.765 1.032 1.355-0.813 2.391-2.099 2.885-3.631-1.271 0.74-2.677 1.276-4.172 1.579-1.192-1.276-2.896-2.079-4.787-2.079-3.625 0-6.563 2.937-6.563 6.557 0 0.521 0.063 1.021 0.172 1.495-5.453-0.255-10.287-2.875-13.52-6.833-0.568 0.964-0.891 2.084-0.891 3.303 0 2.281 1.161 4.281 2.916 5.457-1.073-0.031-2.083-0.328-2.968-0.817v0.079c0 3.181 2.26 5.833 5.26 6.437-0.547 0.145-1.131 0.229-1.724 0.229-0.421 0-0.823-0.041-1.224-0.115 0.844 2.604 3.26 4.5 6.14 4.557-2.239 1.755-5.077 2.801-8.135 2.801-0.521 0-1.041-0.025-1.563-0.088 2.917 1.86 6.36 2.948 10.079 2.948 12.067 0 18.661-9.995 18.661-18.651 0-0.276 0-0.557-0.021-0.839 1.287-0.917 2.401-2.079 3.281-3.396z" />
                            </svg>
                            Twitter
                        </button>
                    </div>
                </div>

                {/* ── Illustration Side ── */}
                <div className="hidden lg:flex flex-col items-center gap-6 flex-1">
                    <img src={img1} alt="Signup Illustration" className="w-80 drop-shadow-2xl" />
                    <div className="text-center">
                        <p className="text-white font-bold text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Your Future Starts Here
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Connect with 500+ companies hiring interns</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
