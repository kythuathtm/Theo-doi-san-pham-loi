
import React, { useState, useEffect, useRef } from 'react';
import { User, SystemSettings } from '../types';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, CompanyLogo } from './Icons';

interface Props {
  onLogin: (user: User) => void;
  users: User[];
  settings: SystemSettings;
}

const Login: React.FC<Props> = ({ onLogin, users, settings }) => {
  const [username, setUsername] = useState(() => localStorage.getItem('app_saved_username') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('app_saved_username'));
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
      if (!username && usernameRef.current) {
          usernameRef.current.focus();
      }
      const timer = setTimeout(() => setIsLoaded(true), 100); 
      return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginProcess();
  };

  const handleLoginProcess = () => {
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
            if (rememberMe) {
                localStorage.setItem('app_saved_username', username.trim());
            } else {
                localStorage.removeItem('app_saved_username');
            }
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
                 <div className="absolute inset-0 bg-cover bg-center z-0 animate-pulse-slow transition-transform duration-[60s] hover:scale-110 ease-linear" style={{ backgroundImage: `url(${settings.backgroundValue})`, transform: 'scale(1.1)' }}></div>
                 <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[4px]"></div>
            </div>
          );
      }
      
      if (settings.backgroundType === 'color' && settings.backgroundValue) {
          return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ backgroundColor: settings.backgroundValue }}></div>
          );
      }
      
      // Modern Animated Mesh Gradient for Glassmorphism
      return (
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-400/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
          <div className="absolute top-[40%] left-[40%] w-[50vw] h-[50vw] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
          
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
       </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-slate-800 font-sans selection:bg-[#003DA5] selection:text-white p-4 sm:p-6">
       {renderBackground()}
       
       <div className={`relative z-10 w-full max-w-[440px] transition-all duration-1000 ease-out transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        
        {/* Glass Card */}
        <div className="bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-[2.5rem] border border-white/60 p-8 sm:p-12 ring-1 ring-white/40 relative overflow-hidden">
            
            {/* Ambient light inside card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-white/40 to-transparent blur-xl pointer-events-none"></div>

            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/80 shadow-xl shadow-blue-900/5 mb-6 p-5 transform hover:scale-105 transition-transform duration-500 animate-float">
                     {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
                    ) : (
                        <CompanyLogo className="w-full h-full text-[#003DA5] drop-shadow-sm" />
                    )}
                </div>
                
                {settings.companyName.includes('HỒNG THIỆN MỸ') ? (
                    <div className="text-center space-y-1">
                        <h1 className="text-lg font-extrabold text-[#003DA5] tracking-tight uppercase"> 
                            CÔNG TY CỔ PHẦN VẬT TƯ Y TẾ
                        </h1>
                        <h1 className="text-2xl font-black text-[#C5003E] tracking-tighter uppercase drop-shadow-sm">
                            HỒNG THIỆN MỸ
                        </h1>
                    </div>
                ) : (
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight text-center drop-shadow-sm">
                        {settings.companyName || 'Hồng Thiện Mỹ'}
                    </h1>
                )}

                <p className="text-xs font-bold text-slate-500 mt-3 text-center uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/30 border border-white/50 backdrop-blur-sm">
                    {settings.appName || 'Hệ thống Quản lý Chất lượng'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="space-y-5">
                    <div className="group relative transition-all duration-300">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 ml-1 block group-focus-within:text-[#003DA5] transition-colors">Tên đăng nhập</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-slate-500 group-focus-within:text-[#003DA5] transition-colors" />
                            </div>
                            <input 
                                ref={usernameRef}
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                className="block w-full pl-11 pr-4 py-3.5 bg-white/40 border border-white/60 rounded-2xl text-slate-800 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#003DA5]/50 focus:bg-white/60 transition-all shadow-sm focus:shadow-lg backdrop-blur-sm"
                                placeholder="Nhập username..."
                                autoComplete="username"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="group relative transition-all duration-300">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 ml-1 block group-focus-within:text-[#003DA5] transition-colors">Mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-slate-500 group-focus-within:text-[#003DA5] transition-colors" />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="block w-full pl-11 pr-12 py-3.5 bg-white/40 border border-white/60 rounded-2xl text-slate-800 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#003DA5]/50 focus:bg-white/60 transition-all shadow-sm focus:shadow-lg backdrop-blur-sm"
                                placeholder="Nhập mật khẩu..."
                                autoComplete="current-password"
                                disabled={loading}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#003DA5] p-2 rounded-xl hover:bg-white/50 transition-all cursor-pointer outline-none active:scale-95" 
                                title={showPassword ? "Ẩn" : "Hiện"}
                                disabled={loading}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${rememberMe ? 'bg-[#003DA5] border-[#003DA5]' : 'border-slate-400/50 bg-white/40 group-hover:border-[#003DA5]'}`}>
                            {rememberMe && <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                        <span className={`text-xs font-bold transition-colors ${rememberMe ? 'text-[#003DA5]' : 'text-slate-600 group-hover:text-[#003DA5]'}`}>Ghi nhớ</span>
                    </label>
                    <a href="#" className="text-xs font-bold text-slate-500 hover:text-[#003DA5] transition-colors hover:underline">Quên mật khẩu?</a>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 flex items-center gap-3 text-xs font-bold text-red-600 animate-shake shadow-sm backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-1 flex-shrink-0 animate-pulse"></span>
                        <span>{error}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-4 rounded-2xl bg-[#003DA5] text-white text-sm font-bold shadow-xl shadow-blue-900/20 hover:bg-[#002a70] hover:shadow-2xl hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center uppercase tracking-widest active:scale-[0.98] active:translate-y-0 relative overflow-hidden group border border-white/20"
                >
                    <div className="absolute inset-0 bg-white/20 blur-lg group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center gap-2">
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </>
                        ) : 'Đăng Nhập'}
                    </span>
                    {/* Hover Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>
                </button>
            </form>
            
            <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-[0.25em] hover:text-slate-600 transition-colors cursor-default">
                    © 2025 Secure System
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
