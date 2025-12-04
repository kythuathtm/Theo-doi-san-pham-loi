
import React, { useState, useEffect, useRef } from 'react';
import { User, SystemSettings } from '../types';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowRightOnRectangleIcon, CompanyLogo, ShieldCheckIcon } from './Icons';

interface Props {
  onLogin: (user: User) => void;
  users: User[];
  settings: SystemSettings;
}

const Login: React.FC<Props> = ({ onLogin, users, settings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
      const timer = setTimeout(() => {
          setIsLoaded(true);
          if (usernameRef.current) {
              usernameRef.current.focus();
          }
      }, 100); 
      return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
            setLoading(false);
            return;
        }

        const normalizedInput = username.trim().toLowerCase();
        const user = users.find(u => u.username.toLowerCase() === normalizedInput);

        if (user && user.password === password) {
            onLogin(user);
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
            setLoading(false);
        }
    }, 800);
  };

  const renderBackground = () => {
      if (settings.backgroundType === 'image' && settings.backgroundValue) {
          return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                 <div className="absolute inset-0 bg-cover bg-center z-0 animate-pulse-slow transition-transform duration-[40s] hover:scale-110 ease-linear" style={{ backgroundImage: `url(${settings.backgroundValue})`, transform: 'scale(1.1)' }}></div>
                 <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[6px]"></div>
            </div>
          );
      }
      
      if (settings.backgroundType === 'color' && settings.backgroundValue) {
          return (
            <div className="absolute inset-0" style={{ backgroundColor: settings.backgroundValue }}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
            </div>
          );
      }
      
      // Modern Mesh Gradient Background
      return (
       <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#0f172a]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] opacity-100"></div>
          
          {/* Animated Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] bg-pink-500/10 rounded-full mix-blend-screen filter blur-[80px] animate-blob animation-delay-4000"></div>
          
          {/* Noise Overlay for texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-[0.03]"></div>
       </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-white font-sans selection:bg-pink-500 selection:text-white p-4 sm:p-6 lg:p-8">
       {renderBackground()}
       
       {/* 
          Container Layout:
          - Mobile: w-full, max-w-xl (Stacked)
          - Desktop (lg+): w-[66vw] (2/3 of viewport width), max-w-none (Split 7/5)
       */}
       <div className={`relative z-10 w-full max-w-xl lg:w-[66vw] lg:max-w-none grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            
            {/* LEFT PANEL: Branding (7/12 on desktop) */}
            <div className="lg:col-span-7 flex flex-col justify-center h-full p-4 lg:p-16 text-center lg:text-left order-2 lg:order-1">
                
                <div className="flex flex-col justify-center space-y-8">
                    {/* Logo Area */}
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl shrink-0 ring-1 ring-white/10">
                             {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-md" />
                            ) : (
                                <CompanyLogo className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-md" />
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            <h3 className="text-xs sm:text-sm font-bold text-blue-200 uppercase tracking-[0.2em] mb-1">Công ty Cổ phần Vật tư Y tế</h3>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-none drop-shadow-lg">Hồng Thiện Mỹ</h1>
                        </div>
                    </div>

                    {/* Main Headings */}
                    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white leading-[0.9] tracking-tighter drop-shadow-xl">
                                WELCOME<br/>BACK!
                            </h2>
                            <div className="w-24 h-2 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full mt-6 mx-auto lg:mx-0 shadow-lg shadow-pink-500/20"></div>
                        </div>
                        
                        {/* System Name Card */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 sm:p-6 rounded-2xl inline-block text-left shadow-xl max-w-xl mx-auto lg:mx-0 hover:bg-white/10 transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                    <ShieldCheckIcon className="w-5 h-5 text-blue-300"/>
                                </div>
                                <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Hệ thống quản lý</span>
                            </div>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-snug">
                                THEO DÕI & XỬ LÝ<br/>
                                <span className="text-blue-300">KHIẾU NẠI CHẤT LƯỢNG SẢN PHẨM</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 lg:mt-16 animate-fade-in" style={{ animationDelay: '500ms' }}>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        © 2025 Công ty Cổ phần Vật tư Y tế Hồng Thiện Mỹ
                     </p>
                </div>
            </div>

            {/* RIGHT PANEL: Login Form (5/12 on desktop) */}
            <div className="lg:col-span-5 w-full order-1 lg:order-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                {/* Glass Card */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group mx-4 lg:mx-0">
                    
                    {/* Subtle Reflection */}
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] group-hover:animate-shine pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="mb-8">
                            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Đăng nhập</h2>
                            <p className="text-blue-100/70 text-sm font-medium">Vui lòng nhập thông tin tài khoản để tiếp tục.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            
                            {/* Username Input */}
                            <div className="space-y-2 group/input">
                                <label className="text-xs font-bold text-blue-200 uppercase tracking-wider ml-1 group-focus-within/input:text-white transition-colors">Tên đăng nhập</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-[#003DA5] transition-colors">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                    <input 
                                        ref={usernameRef}
                                        type="text" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)} 
                                        className="block w-full pl-11 pr-4 py-3.5 bg-white/90 border border-transparent rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:bg-white transition-all font-semibold shadow-inner text-sm sm:text-base"
                                        placeholder="Nhập username..."
                                        autoComplete="username"
                                        required 
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2 group/input">
                                <label className="text-xs font-bold text-blue-200 uppercase tracking-wider ml-1 group-focus-within/input:text-white transition-colors">Mật khẩu</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-[#003DA5] transition-colors">
                                        <LockClosedIcon className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className="block w-full pl-11 pr-12 py-3.5 bg-white/90 border border-transparent rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:bg-white transition-all font-semibold shadow-inner text-sm sm:text-base"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        required 
                                        disabled={loading}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#003DA5] p-2 rounded-xl hover:bg-blue-50 transition-all cursor-pointer outline-none active:scale-95" 
                                        title={showPassword ? "Ẩn" : "Hiện"}
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-sm font-bold text-red-100 animate-shake backdrop-blur-md shadow-sm">
                                    <span className="text-lg leading-none mt-0.5">⚠️</span>
                                    <span className="leading-snug">{error}</span>
                                </div>
                            )}

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white text-sm font-bold shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center uppercase tracking-widest group relative overflow-hidden"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            Đăng nhập <ArrowRightOnRectangleIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs text-blue-200/80 mt-6 px-1">
                                <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" className="peer h-4 w-4 rounded border-white/30 bg-black/20 text-pink-500 focus:ring-0 cursor-pointer transition-all checked:bg-pink-500 checked:border-transparent" />
                                    </div>
                                    <span className="font-medium group-hover:underline decoration-white/30 underline-offset-2">Ghi nhớ đăng nhập</span>
                                </label>
                                <a href="#" className="font-medium hover:text-white transition-colors hover:underline decoration-white/30 underline-offset-2">Quên mật khẩu?</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
};

export default Login;
