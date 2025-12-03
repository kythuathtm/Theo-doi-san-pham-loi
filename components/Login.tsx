
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

    // Simulate network delay for better UX (prevent instant flicker)
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
                 <div className="absolute inset-0 bg-cover bg-center z-0 animate-pulse-slow transition-transform duration-[20s] hover:scale-110 ease-linear" style={{ backgroundImage: `url(${settings.backgroundValue})`, transform: 'scale(1.1)' }}></div>
                 <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px]"></div>
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
          {/* Animated Blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-300/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"></div>
              <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-4000"></div>
          </div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
       </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-slate-800 font-sans selection:bg-[#003DA5] selection:text-white p-4">
       {renderBackground()}
       
       {/* Main Card Container */}
       <div className={`relative z-10 w-full max-w-[1200px] transition-all duration-700 ease-out transform ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        
        <div className="bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rounded-[32px] overflow-hidden flex flex-col md:flex-row min-h-[680px] ring-1 ring-white/20 backdrop-blur-sm">
            
            {/* --- LEFT PANEL: BRANDING (7/12) --- */}
            <div className="relative w-full md:w-7/12 bg-[#003DA5] text-white p-12 lg:p-16 flex flex-col justify-between overflow-hidden group">
                
                {/* Advanced Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#004dc7] via-[#003DA5] to-[#001b4d] opacity-100 z-0"></div>
                
                {/* Abstract Geometric Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-10 z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    <circle cx="90" cy="10" r="20" fill="white" className="animate-pulse-slow" />
                </svg>
                
                {/* Floating Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-[100px] animate-blob z-0"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#C5003E]/40 rounded-full blur-[80px] animate-blob animation-delay-2000 z-0"></div>

                {/* Content Layer */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                            {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <CompanyLogo className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold tracking-[0.2em] text-[10px] uppercase opacity-70 text-blue-100">Hệ thống quản lý</span>
                            <span className="font-black text-xl uppercase leading-none tracking-tight">
                                {settings.companyName ? settings.companyName.split(' ').slice(0, 3).join(' ') : 'HTM JSC'}
                            </span>
                        </div>
                    </div>

                    {/* Main Message */}
                    <div className="my-auto py-12">
                        <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-8 animate-slide-up shadow-lg" style={{ animationDelay: '200ms' }}>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                            Quality Control System
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[0.9] tracking-tighter animate-slide-up drop-shadow-lg" style={{ animationDelay: '300ms' }}>
                            Hello,<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-200">Welcome!</span>
                        </h1>
                        
                        <div className="w-24 h-2 bg-gradient-to-r from-[#C5003E] to-orange-500 rounded-full mb-8 animate-slide-up origin-left" style={{ animationDelay: '400ms' }}></div>
                        
                        <p className="text-blue-100/90 text-lg font-medium leading-relaxed max-w-lg animate-slide-up" style={{ animationDelay: '500ms' }}>
                            {settings.appName || 'Hệ thống Theo dõi & Xử lý Khiếu nại Chất lượng Sản phẩm toàn diện, giúp nâng cao hiệu quả và sự hài lòng của khách hàng.'}
                        </p>
                    </div>

                    {/* Footer / Floating Card */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                         <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 max-w-sm hover:bg-white/20 transition-colors cursor-default">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <ShieldCheckIcon className="w-5 h-5 text-emerald-300" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Bảo mật & An toàn</p>
                                <p className="text-[11px] text-blue-200">Dữ liệu được mã hóa và bảo vệ</p>
                            </div>
                         </div>
                         <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mt-6 pl-1">
                            © {new Date().getFullYear()} {settings.companyName || 'HONG THIEN MY JSC'}. v2.0
                         </p>
                    </div>
                </div>
            </div>

            {/* --- RIGHT PANEL: FORM (5/12) --- */}
            <div className="w-full md:w-5/12 bg-white relative flex flex-col justify-center">
                {/* Decorative top right shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] z-0"></div>

                <div className="w-full relative z-10 px-8 md:px-12 lg:px-16 py-12">
                    <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Đăng nhập</h2>
                        <p className="text-slate-500 font-medium text-sm">Vui lòng nhập thông tin tài khoản để tiếp tục.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        
                        <div className="space-y-5">
                            <div className="group">
                                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-[#003DA5]">
                                    Tên đăng nhập
                                </label>
                                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003DA5] transition-colors">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                    <input 
                                        ref={usernameRef}
                                        type="text" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)} 
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-[#003DA5]/10 focus:border-[#003DA5] outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:bg-white hover:border-slate-300 shadow-sm" 
                                        placeholder="Nhập username..."
                                        autoComplete="username"
                                        required 
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-[#003DA5]">
                                    Mật khẩu
                                </label>
                                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003DA5] transition-colors">
                                        <LockClosedIcon className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-[#003DA5]/10 focus:border-[#003DA5] outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:bg-white hover:border-slate-300 shadow-sm" 
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        required 
                                        disabled={loading}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#003DA5] p-2 rounded-xl hover:bg-blue-50 transition-all cursor-pointer outline-none focus:text-[#003DA5] active:scale-90" 
                                        title={showPassword ? "Ẩn" : "Hiện"}
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 text-sm font-bold text-red-600 animate-shake shadow-sm">
                                <span className="text-lg leading-none mt-0.5">⚠️</span>
                                <span className="leading-snug">{error}</span>
                            </div>
                        )}

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-[#003DA5] to-[#002a70] hover:to-[#003DA5] text-white text-sm font-extrabold shadow-xl shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center uppercase tracking-wider group relative overflow-hidden h-[56px]"
                            >
                                {/* Button Shine Effect */}
                                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-shine"></div>
                                
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xác thực...
                                    </>
                                ) : (
                                    <>
                                        Truy cập hệ thống <ArrowRightOnRectangleIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
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
