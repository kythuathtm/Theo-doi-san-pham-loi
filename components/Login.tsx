
import React, { useState } from 'react';
import { User } from '../types';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from './Icons';

interface Props {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<Props> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
        if (!username || !password) {
            setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
            setLoading(false);
            return;
        }

        const normalizedInput = username.trim().toLowerCase();
        const user = users.find(u => u.username.toLowerCase() === normalizedInput);

        if (user && user.password === password) {
            onLogin(user);
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
            setLoading(false);
        }
    }, 800);
  };

  // Brand Colors:
  // Blue: #003DA5 (Pantone 293 C) - Primary
  // Red: #C5003E (Pantone 1935 C) - Error/Alert

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faff] relative overflow-hidden font-sans selection:bg-[#003DA5]/20">
       {/* Subtle Background Gradient */}
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-[#f8faff] to-white pointer-events-none"></div>
       
       {/* Decorative Circle (Subtle Brand Presence) */}
       <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#003DA5]/5 to-transparent blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[400px] px-6">
        {/* Card Container */}
        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,61,165,0.15)] border border-white p-8 sm:p-10 flex flex-col items-center text-center transition-all duration-300 transform hover:scale-[1.005]">
            
            {/* Company Logo */}
            <div className="mb-8 w-full flex justify-center">
               <div className="relative p-4">
                   <div className="absolute inset-0 bg-blue-50 rounded-full blur-xl opacity-50"></div>
                   <img 
                      src="https://theme.hstatic.net/200000763901/1001148531/14/logo.png?v=171" 
                      alt="Hồng Thiện Mỹ Logo" 
                      className="relative h-28 w-auto object-contain"
                   />
               </div>
            </div>

            <div className="w-full mb-8">
                <h2 className="text-2xl font-black text-[#003DA5]">Đăng nhập</h2>
                <p className="text-slate-400 text-sm mt-2 font-medium">Hệ thống Theo dõi Sản phẩm Lỗi</p>
            </div>
            
            <form onSubmit={handleSubmit} className="w-full space-y-5">
                <div className="text-left space-y-4">
                    {/* Username Input */}
                    <div className="relative group">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#003DA5] text-slate-400">
                            <UserIcon className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#003DA5]/30 focus:ring-4 focus:ring-[#003DA5]/10 transition-all duration-200"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#003DA5] text-slate-400">
                            <LockClosedIcon className="h-5 w-5" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#003DA5]/30 focus:ring-4 focus:ring-[#003DA5]/10 transition-all duration-200"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#003DA5] transition-colors focus:outline-none cursor-pointer"
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                                <EyeIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="text-[#C5003E] text-xs font-bold bg-[#C5003E]/5 p-3 rounded-xl border border-[#C5003E]/10 flex items-center justify-center gap-2 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-[#003DA5] text-white text-sm font-bold hover:bg-[#002a7a] focus:outline-none focus:ring-4 focus:ring-[#003DA5]/30 active:scale-[0.98] transition-all shadow-[0_10px_20px_-10px_rgba(0,61,165,0.4)] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang xử lý...</span>
                        </div>
                    ) : 'Đăng nhập'}
                </button>
            </form>
        </div>
        
        {/* Footer/Copyright */}
        <div className="mt-8 text-center">
             <p className="text-xs font-medium text-slate-400">© 2024 Hồng Thiện Mỹ. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
