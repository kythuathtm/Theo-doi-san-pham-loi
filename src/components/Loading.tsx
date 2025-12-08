
import React from 'react';
import { CompanyLogo } from './Icons';

const Loading: React.FC = () => (
  <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 animate-fade-in bg-slate-50/50">
    <div className="relative">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center p-3 relative z-10 animate-pop">
            <CompanyLogo className="w-full h-full text-[#003DA5] animate-pulse-slow" />
        </div>
        <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-xl animate-pulse"></div>
    </div>
    <div className="mt-6 flex flex-col items-center gap-2">
        <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#003DA5] w-1/2 animate-shimmer rounded-full"></div>
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Đang tải dữ liệu...</span>
    </div>
  </div>
);

export default Loading;