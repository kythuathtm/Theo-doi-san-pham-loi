
import React, { useState, useEffect, useRef } from 'react';
import { User, SystemSettings } from '../types';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowRightOnRectangleIcon, CompanyLogo } from './Icons';

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
                 <div className="absolute inset-0 bg-cover bg-center z-0 animate-pulse-slow" style={{ backgroundImage: `url(${settings.backgroundValue})`, transform: 'scale(1.05)' }}></div>
                 <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]"></div>
            </div>
          );
      }
      if (settings.backgroundType === 'color' && settings.backgroundValue) {
          return (
            <div className="absolute inset-0" style={{ backgroundColor: settings.backgroundValue }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
            </div>
          );
      }
      return (
       <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-50">
          <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-[#003DA5]/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-sky-400/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-[20%] w-[70vw] h-[70vw] bg-red-400/10 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]"></div>
          {/* Noise texture overlay for texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
       </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-slate-900 font-sans selection:bg-[#003DA5] selection:text-white">
       {renderBackground()}
       
       <div className={`relative z-10 w-full max-w-[480px] p-6 transition-all duration-700 ease-out transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden ring-1 ring-white/90">
            
            {/* Header Section */}
            <div className="flex flex-col items-center text-center mb-8 relative z-10">
               <div className={`mb-6 relative group/logo transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                   <div className="absolute -inset-10 bg-blue-500/20 rounded-full opacity-0 group-hover/logo:opacity-100 blur-3xl transition duration-700"></div>
                   
                   <div className="relative transform transition-transform duration-500 group-hover/logo:scale-105">
                        {settings.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" className="h-24 object-contain drop-shadow-2xl" />
                        ) : (
                            <div className="w-24 h-24 bg-white rounded-[1.5rem] flex items-center justify-center shadow-lg border border-slate-100 p-2">
                                <CompanyLogo className="w-full h-full" />
                            </div>
                        )}
                   </div>
               </div>
               
               <div className={`flex flex-col items-center w-full transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                   {/* Company Name */}
                   <div className="mb-5 space-y-1 w-full">
                        <p className="text-xs sm:text-sm font-bold text-[#003DA5] tracking-wide uppercase">
                            CÔNG TY CỔ PHẦN VẬT TƯ Y TẾ
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#C5003E] tracking-tight uppercase leading-none drop-shadow-sm">
                            HỒNG THIỆN MỸ
                        </h2>
                   </div>

                   {/* Welcome Divider */}
                   <div className="flex items-center gap-4 w-full justify-center mb-5 opacity-70">
                        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-slate-300 w-full max-w-[60px]"></div>
                        <span className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase">WELCOME</span>
                        <div className="h-px bg-gradient-to-l from-transparent via-slate-300 to-slate-300 w-full max-w-[60px]"></div>
                   </div>

                   {/* App Name */}
                   <div className="space-y-1">
                        <h1 className="text-sm sm:text-base font-bold text-slate-600 uppercase tracking-tight leading-snug">
                            HỆ THỐNG THEO DÕI PHẢN ÁNH
                        </h1>
                        <h1 className="text-lg sm:text-xl font-black text-[#003DA5] uppercase tracking-normal leading-snug">
                            CHẤT LƯỢNG SẢN PHẨM
                        </h1>
                   </div>
               </div>
            </div>
            
            <form onSubmit={handleSubmit} className={`space-y-5 relative z-10 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="space-y-4">
                    {/* Floating Label Username */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003DA5] transition-colors">
                            <UserIcon className="h-5 w-5" />
                        </div>
                        <input 
                            ref={usernameRef}
                            type="text" 
                            id="username"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            className="block pl-12 pr-4 pb-3 pt-6 w-full text-base font-bold text-slate-800 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-2xl border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-[#003DA5]/10 focus:border-[#003DA5] peer transition-all duration-200 shadow-inner" 
                            placeholder=" "
                            autoComplete="username"
                            required 
                            disabled={loading}
                        />
                        <label 
                            htmlFor="username" 
                            className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3.5 scale-75 top-4 z-10 origin-[0] left-12 peer-focus:text-[#003DA5] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3.5 font-bold uppercase tracking-wide cursor-text pointer-events-none"
                        >
                            Tên đăng nhập
                        </label>
                    </div>

                    {/* Floating Label Password */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003DA5] transition-colors">
                            <LockClosedIcon className="h-5 w-5" />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            id="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="block pl-12 pr-12 pb-3 pt-6 w-full text-base font-bold text-slate-800 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-2xl border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-[#003DA5]/10 focus:border-[#003DA5] peer transition-all duration-200 shadow-inner" 
                            placeholder=" "
                            autoComplete="current-password"
                            required 
                            disabled={loading}
                        />
                        <label 
                            htmlFor="password" 
                            className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3.5 scale-75 top-4 z-10 origin-[0] left-12 peer-focus:text-[#003DA5] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3.5 font-bold uppercase tracking-wide cursor-text pointer-events-none"
                        >
                            Mật khẩu
                        </label>
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#003DA5] hover:bg-blue-50 p-2 rounded-full transition-all cursor-pointer outline-none focus:text-[#003DA5] active:scale-95" 
                            tabIndex={-1}
                            title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            disabled={loading}
                        >
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-sm font-bold text-red-600 animate-shake shadow-sm">
                        <div className="shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-lg">⚠️</span>
                        </div>
                        <span className="leading-snug">{error}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#003DA5] to-[#002a70] hover:to-[#003DA5] text-white text-base font-bold shadow-xl shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center relative overflow-hidden group/btn uppercase tracking-wider"
                >
                     {/* Button Shine Effect */}
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out skew-y-12 origin-bottom"></div>
                     
                     {loading ? (
                         <>
                             <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             <span>Đang xác thực...</span>
                         </>
                     ) : (
                         <span className="flex items-center gap-2 relative z-10">
                            TRUY CẬP HỆ THỐNG <ArrowRightOnRectangleIcon className="h-5 w-5 opacity-80 group-hover/btn:translate-x-1 transition-transform" />
                         </span>
                     )}
                </button>
            </form>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className={`absolute bottom-4 w-full text-center z-10 p-4 transition-opacity duration-1000 delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
           <p className="text-[10px] font-black text-slate-400/60 tracking-[0.2em] uppercase mix-blend-multiply">
               © {new Date().getFullYear()} {settings.companyName || 'HONG THIEN MY MEDICAL JOINT STOCK COMPANY'}
           </p>
      </div>
    </div>
  );
};

export default Login;
