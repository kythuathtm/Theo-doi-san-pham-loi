
import React, { useMemo, useState, useEffect } from 'react';
import { DefectReport } from '../types';
import { 
    CheckCircleIcon, ClockIcon, 
    ShoppingBagIcon, TagIcon, 
    ShieldCheckIcon,
    CubeIcon, ChartPieIcon, 
    InboxIcon, SparklesIcon,
    TableCellsIcon,
    BuildingStoreIcon,
    BarChartIcon,
    XIcon
} from './Icons';

interface Props {
  reports: DefectReport[];
  onFilterSelect: (filterType: 'status' | 'defectType' | 'all' | 'search' | 'brand' | 'month', value?: string) => void;
  onSelectReport: (report: DefectReport) => void;
  onOpenAiAnalysis: () => void;
  isLoading?: boolean;
}

// --- COLOR PALETTE ---
const COLORS = {
    PRIMARY: '#003DA5', // HTM Blue
    SUCCESS: '#059669', // Emerald
    WARNING: '#D97706', // Amber
    DANGER: '#DC2626',  // Red
    VIOLET: '#7C3AED',  // Violet
    TEAL: '#0D9488',    // Teal
    SLATE: '#64748B',   // Slate
};

// --- ANIMATED COUNT COMPONENT ---
const CountUp = ({ value, duration = 1000, suffix = "" }: { value: number, duration?: number, suffix?: string }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        let totalMilSec = duration;
        let incrementTime = (totalMilSec / end) * 5; 

        // fallback for large numbers
        if (incrementTime < 5) incrementTime = 10; 
        
        const timer = setInterval(() => {
            start += Math.ceil(end / (totalMilSec / 10)); // increment
            if (start >= end) {
                start = end;
                clearInterval(timer);
            }
            setDisplay(start);
        }, 10);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <>{display.toLocaleString()}{suffix}</>;
};

// --- SUB-COMPONENTS ---

const GlassCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
    <div 
        className={`bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] relative overflow-hidden animate-slide-up ring-1 ring-white/40 ${className}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        {children}
    </div>
);

const KpiCard = ({ title, value, icon, subLabel, color, onClick, delay }: any) => (
    <button 
        onClick={onClick}
        className="group relative flex flex-col justify-between p-6 rounded-[2rem] bg-white/40 backdrop-blur-lg border border-white/60 hover:bg-white/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5 w-full text-left overflow-hidden ring-1 ring-white/50 animate-slide-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-opacity group-hover:opacity-40`} style={{ backgroundColor: color }}></div>
        
        <div className="flex items-center gap-3 relative z-10 mb-4">
            <div className={`p-2.5 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md`} style={{ backgroundColor: `${color}15`, color: color }}>
                {icon}
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</span>
        </div>
        
        <div className="relative z-10">
            <div className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-1 drop-shadow-sm">
                {value}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 opacity-80">{subLabel}</div>
        </div>
    </button>
);

const BrandStatRow = ({ brand, label, color, data, onClick }: any) => (
    <div 
        onClick={onClick}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/30 border border-white/50 hover:bg-white/60 hover:border-white/80 transition-all cursor-pointer group backdrop-blur-sm"
    >
        <div className="flex items-center gap-4 mb-3 sm:mb-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md font-black text-sm tracking-tighter transition-transform group-hover:scale-110" style={{ backgroundColor: color }}>
                {brand}
            </div>
            <div>
                <h4 className="font-bold text-slate-800 text-sm">{label}</h4>
                <div className="h-1 w-12 rounded-full mt-1.5 opacity-30" style={{ backgroundColor: color }}></div>
            </div>
        </div>
        
        <div className="flex gap-6 sm:gap-10">
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Số phiếu</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-700">{data.count}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/50 text-slate-500 border border-white/50 backdrop-blur-sm">
                        {data.pct.toFixed(1)}%
                    </span>
                </div>
            </div>
            
            <div className="flex flex-col border-l border-slate-300/30 pl-6 sm:pl-10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sản phẩm (SKU)</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-700">{data.skuCount}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/50 text-slate-500 border border-white/50 backdrop-blur-sm">
                        {data.skuPct.toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>
    </div>
);

const ProgressBarChart = ({ data, color, onBarClick }: { data: any[], color: string, onBarClick?: (label: string) => void }) => (
    <div className="space-y-5">
        {data.map((item, idx) => (
            <div key={idx} onClick={() => onBarClick && onBarClick(item.label)} className="group animate-fade-in cursor-pointer" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-bold text-slate-600 group-hover:text-[#003DA5] transition-colors">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-800">{item.value}</span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-white/50 px-1 rounded backdrop-blur-sm">({item.percentage.toFixed(1)}%)</span>
                    </div>
                </div>
                <div className="h-2.5 w-full bg-slate-100/50 rounded-full overflow-hidden shadow-inner border border-white/30 backdrop-blur-sm">
                    <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color || color }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50"></div>
                    </div>
                </div>
            </div>
        ))}
        {data.length === 0 && <div className="text-center text-slate-400 text-xs py-8 font-medium">Chưa có dữ liệu cho bộ lọc này</div>}
    </div>
);

const MonthlyTrendChart = ({ data, onBarClick }: { data: { month: string, count: number }[], onBarClick?: (month: string) => void }) => {
    const max = Math.max(...data.map(d => d.count), 1);
    
    return (
        <div className="w-full h-56 flex flex-col justify-end gap-2 pt-8 pb-2 px-2 select-none">
            {data.length > 0 ? (
                <div className="flex items-end justify-between h-full w-full gap-2 sm:gap-4">
                    {data.map((d, i) => (
                        <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                            {/* Bar container */}
                            <div 
                                onClick={() => onBarClick && onBarClick(d.month)}
                                className="w-full relative flex items-end justify-center h-full rounded-t-xl bg-slate-50/30 hover:bg-slate-50/60 transition-colors cursor-pointer overflow-visible backdrop-blur-sm"
                            >
                                {/* The Bar */}
                                <div 
                                    className="w-2/3 max-w-[40px] bg-gradient-to-t from-[#003DA5] to-blue-400 rounded-t-md opacity-80 group-hover:opacity-100 transition-all duration-500 ease-out relative shadow-lg group-hover:shadow-blue-500/30"
                                    style={{ height: `${(d.count / max) * 100}%`, minHeight: '4px' }}
                                >
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 transform translate-y-2 group-hover:translate-y-0">
                                    {d.count} Phiếu
                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                </div>
                            </div>
                            
                            {/* Label */}
                            <div className="mt-2 text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors text-center w-full truncate">
                                {d.month}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-wider">
                    Chưa có dữ liệu theo tháng
                </div>
            )}
        </div>
    );
};

// --- DATA MODAL COMPONENT ---
interface DataModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const DataModal = ({ title, onClose, children }: DataModalProps) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 transition-opacity animate-fade-in">
        <div className="bg-white/80 backdrop-blur-2xl w-full max-w-4xl h-full max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-zoom-in ring-1 ring-white/60">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white/50">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-white/60 transition-all active:scale-95">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="flex-1 overflow-auto p-0 custom-scrollbar bg-transparent">
                {children}
            </div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

const DashboardReport: React.FC<Props> = ({ reports, onFilterSelect, onSelectReport, onOpenAiAnalysis, isLoading }) => {
    
    const [activeOriginTab, setActiveOriginTab] = useState<'All' | 'HTM' | 'VMA' | 'Khác'>('All');
    const [showDistributorModal, setShowDistributorModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);

    // DATA CALCULATION
    const metrics = useMemo(() => {
        const totalReports = reports.length;
        const uniqueDistributors = new Set(reports.map(r => r.nhaPhanPhoi?.trim()).filter(Boolean)).size;
        const uniqueTotalSKUs = new Set(reports.map(r => r.maSanPham?.trim()).filter(Boolean)).size;
        const completedCount = reports.filter(r => r.trangThai === 'Hoàn thành').length;
        const completionRate = totalReports > 0 ? (completedCount / totalReports) * 100 : 0;

        // Helper for Brand Stats
        const getBrandData = (brandName: string) => {
            const subset = reports.filter(r => r.nhanHang === brandName);
            const count = subset.length;
            const pct = totalReports > 0 ? (count / totalReports) * 100 : 0;
            const skus = new Set(subset.map(r => r.maSanPham?.trim()).filter(Boolean)).size;
            // SKU Percentage based on TOTAL unique SKUs in the system (filtered)
            const skuPct = uniqueTotalSKUs > 0 ? (skus / uniqueTotalSKUs) * 100 : 0;
            return { count, pct, skuCount: skus, skuPct };
        };

        // Brand Stats
        const brandStats = {
            HTM: getBrandData('HTM'),
            VMA: getBrandData('VMA'),
            Other: (() => {
                const subset = reports.filter(r => !['HTM', 'VMA'].includes(r.nhanHang));
                const count = subset.length;
                const pct = totalReports > 0 ? (count / totalReports) * 100 : 0;
                const skus = new Set(subset.map(r => r.maSanPham?.trim()).filter(Boolean)).size;
                const skuPct = uniqueTotalSKUs > 0 ? (skus / uniqueTotalSKUs) * 100 : 0;
                return { count, pct, skuCount: skus, skuPct };
            })()
        };

        // Error Origin Data Generator
        const getOriginData = (brandFilter: 'All' | 'HTM' | 'VMA' | 'Khác') => {
            let subset = reports;
            if (brandFilter === 'HTM') subset = reports.filter(r => r.nhanHang === 'HTM');
            else if (brandFilter === 'VMA') subset = reports.filter(r => r.nhanHang === 'VMA');
            else if (brandFilter === 'Khác') subset = reports.filter(r => !['HTM', 'VMA'].includes(r.nhanHang));
            
            const total = subset.length;
            const counts: Record<string, number> = {};
            
            subset.forEach(r => {
                const origin = r.loaiLoi || 'Chưa phân loại';
                counts[origin] = (counts[origin] || 0) + 1;
            });

            return Object.entries(counts).map(([key, value]) => ({
                label: key,
                value,
                percentage: total > 0 ? (value / total) * 100 : 0,
                color: key === 'Lỗi Sản xuất' ? COLORS.DANGER : 
                       key === 'Lỗi Nhà cung cấp' ? COLORS.WARNING : 
                       key === 'Lỗi Hỗn hợp' ? COLORS.VIOLET : COLORS.SLATE
            })).sort((a, b) => b.value - a.value);
        };

        const originData = {
            All: getOriginData('All'),
            HTM: getOriginData('HTM'),
            VMA: getOriginData('VMA'),
            Khác: getOriginData('Khác'),
        };

        // Status Distribution
        const statusCounts: Record<string, number> = {};
        reports.forEach(r => { statusCounts[r.trangThai] = (statusCounts[r.trangThai] || 0) + 1 });
        const statusColors: Record<string, string> = {
            'Mới': '#3B82F6', // Blue
            'Đang tiếp nhận': '#6366f1', // Indigo
            'Đang xác minh': '#06b6d4', // Cyan
            'Đang xử lý': COLORS.WARNING,
            'Chưa tìm ra nguyên nhân': COLORS.VIOLET,
            'Hoàn thành': COLORS.SUCCESS
        };
        const statusData = Object.entries(statusCounts).map(([key, value]) => ({
            label: key,
            value,
            percentage: (value / totalReports) * 100,
            color: statusColors[key] || COLORS.SLATE
        })).sort((a, b) => b.value - a.value);

        // Top 5 Products
        const productCounts: Record<string, { count: number, name: string }> = {};
        reports.forEach(r => {
            const key = r.maSanPham || 'Unknown';
            if (!productCounts[key]) {
                productCounts[key] = { count: 0, name: r.tenThuongMai || 'Không xác định' };
            }
            productCounts[key].count += 1;
        });
        const topProducts = Object.entries(productCounts)
            .map(([code, data]) => ({ code, name: data.name, count: data.count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Monthly Trend
        const monthlyStats: Record<string, number> = {};
        reports.forEach(r => {
            if (!r.ngayPhanAnh) return;
            try {
                const date = new Date(r.ngayPhanAnh);
                // Format: MM/YYYY
                if (!isNaN(date.getTime())) {
                    const key = `${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
                    monthlyStats[key] = (monthlyStats[key] || 0) + 1;
                }
            } catch (e) {}
        });

        const monthlyTrend = Object.entries(monthlyStats)
            .map(([month, count]) => {
                const [m, y] = month.split('/').map(Number);
                return { month, count, dateVal: new Date(y, m - 1).getTime() };
            })
            .sort((a, b) => a.dateVal - b.dateVal)
            .slice(-12); // Last 12 months

        return {
            totalReports,
            uniqueDistributors,
            uniqueTotalSKUs,
            completionRate,
            brandStats,
            originData,
            statusData,
            topProducts,
            monthlyTrend
        };
    }, [reports]);

    // --- Modal Data Aggregation ---
    const distributorStats = useMemo(() => {
        const stats: Record<string, { name: string, reportCount: number, skus: Set<string>, exchangeCount: number }> = {};
        reports.forEach(r => {
            const name = r.nhaPhanPhoi || 'Không xác định';
            if (!stats[name]) {
                stats[name] = { name, reportCount: 0, skus: new Set(), exchangeCount: 0 };
            }
            stats[name].reportCount++;
            if (r.maSanPham) stats[name].skus.add(r.maSanPham);
            stats[name].exchangeCount += (r.soLuongDoi || 0);
        });
        return Object.values(stats).sort((a, b) => b.reportCount - a.reportCount);
    }, [reports]);

    const productStats = useMemo(() => {
        const stats: Record<string, { code: string, name: string, reportCount: number, exchangeCount: number }> = {};
        reports.forEach(r => {
            const code = r.maSanPham || 'Unknown';
            if (!stats[code]) {
                stats[code] = { code, name: r.tenThuongMai || '', reportCount: 0, exchangeCount: 0 };
            }
            stats[code].reportCount++;
            stats[code].exchangeCount += (r.soLuongDoi || 0);
            if (r.tenThuongMai && r.tenThuongMai.length > stats[code].name.length) {
                stats[code].name = r.tenThuongMai;
            }
        });
        return Object.values(stats).sort((a, b) => b.reportCount - a.reportCount);
    }, [reports]);

    return (
        <div className="flex flex-col h-full w-full bg-transparent p-6 lg:p-8 overflow-y-auto custom-scrollbar">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 drop-shadow-sm">
                        <ChartPieIcon className="w-8 h-8 text-[#003DA5]" />
                        Dashboard Báo Cáo
                    </h2>
                    <p className="text-sm font-semibold text-slate-500 mt-1 ml-10 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse box-shadow-glow"></span>
                        Cập nhật theo thời gian thực
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onOpenAiAnalysis}
                        className="group flex items-center gap-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 border border-white/20 hover:shadow-indigo-500/50"
                    >
                        <SparklesIcon className="w-4 h-4 animate-pulse" />
                        <span className="text-sm font-bold">Phân tích AI</span>
                    </button>
                    
                    <button 
                        onClick={() => onFilterSelect('all')}
                        className="flex items-center gap-2 bg-white/40 hover:bg-white/70 text-slate-700 px-5 py-3 rounded-2xl border border-white/60 shadow-sm transition-all text-sm font-bold hover:shadow-md backdrop-blur-md"
                    >
                        <TableCellsIcon className="w-4 h-4 text-slate-500" />
                        <span>Dữ liệu gốc</span>
                    </button>
                </div>
            </div>

            {/* 1. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard 
                    title="Tổng Phiếu" 
                    value={<CountUp value={metrics.totalReports} />}
                    subValue="Hồ sơ ghi nhận"
                    icon={<InboxIcon className="w-5 h-5"/>}
                    color={COLORS.PRIMARY}
                    onClick={() => onFilterSelect('all')}
                    delay={0}
                />
                <KpiCard 
                    title="Nhà Phân Phối" 
                    value={<CountUp value={metrics.uniqueDistributors} />}
                    subValue="Có phát sinh lỗi"
                    icon={<BuildingStoreIcon className="w-5 h-5"/>}
                    color={COLORS.VIOLET}
                    onClick={() => setShowDistributorModal(true)}
                    delay={100}
                />
                <KpiCard 
                    title="Sản Phẩm (SKU)" 
                    value={<CountUp value={metrics.uniqueTotalSKUs} />}
                    subValue="Mã hàng bị phản ánh"
                    icon={<CubeIcon className="w-5 h-5"/>}
                    color={COLORS.WARNING}
                    onClick={() => setShowProductModal(true)}
                    delay={200}
                />
                <KpiCard 
                    title="Tỷ Lệ Hoàn Thành" 
                    value={<CountUp value={metrics.completionRate} suffix="%" />}
                    subValue="Đã xử lý xong"
                    icon={<CheckCircleIcon className="w-5 h-5"/>}
                    color={COLORS.SUCCESS}
                    onClick={() => onFilterSelect('status', 'Hoàn thành')}
                    delay={300}
                />
            </div>

            {/* 2. Monthly Trend & Status (NEW LAYOUT) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                {/* Monthly Trend Chart */}
                <GlassCard className="p-8 flex flex-col xl:col-span-2" delay={400}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-[#003DA5] rounded-xl">
                            <BarChartIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Số lỗi theo tháng</h3>
                    </div>
                    <div className="flex-1 flex items-end">
                        <MonthlyTrendChart 
                            data={metrics.monthlyTrend} 
                            onBarClick={(month) => onFilterSelect('month', month)}
                        />
                    </div>
                </GlassCard>

                {/* Status Distribution */}
                <GlassCard className="p-8" delay={500}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <ChartPieIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Trạng thái Xử lý</h3>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6">
                        {/* Donut Chart */}
                        <div className="relative w-40 h-40 flex-shrink-0">
                            <div 
                                className="w-full h-full rounded-full shadow-inner"
                                style={{ 
                                    background: `conic-gradient(${
                                        metrics.statusData.length > 0 
                                        ? metrics.statusData.reduce((acc, item, idx) => {
                                            const prevDeg = idx === 0 ? 0 : metrics.statusData.slice(0, idx).reduce((sum, i) => sum + i.percentage, 0) * 3.6;
                                            const currentDeg = prevDeg + (item.percentage * 3.6);
                                            return acc + `${item.color} ${prevDeg}deg ${currentDeg}deg, `;
                                        }, '').slice(0, -2) 
                                        : '#e2e8f0 0deg 360deg'
                                    })` 
                                }}
                            ></div>
                            <div className="absolute inset-0 m-auto w-24 h-24 bg-white/80 backdrop-blur-xl rounded-full flex flex-col items-center justify-center shadow-lg border border-white/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng</span>
                                <span className="text-2xl font-black text-slate-800 tracking-tighter">{metrics.totalReports}</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-1 gap-y-2 w-full">
                            {metrics.statusData.map((status, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => onFilterSelect('status', status.label)}
                                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-2 h-2 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: status.color }}></div>
                                        <span className="text-xs font-bold text-slate-600 truncate group-hover:text-slate-900">{status.label}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-800 bg-white/50 px-1.5 py-0.5 rounded shadow-sm border border-slate-200/50 backdrop-blur-sm">
                                        {status.percentage.toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* 3. Brand Stats & Error Origin Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Brand Statistics */}
                <GlassCard className="p-8 flex flex-col" delay={600}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <ShoppingBagIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Thống kê theo Nhãn hàng</h3>
                    </div>
                    
                    <div className="flex flex-col gap-4 flex-1 justify-center">
                        <BrandStatRow 
                            brand="HTM" 
                            label="HTM" 
                            color={COLORS.PRIMARY} 
                            data={metrics.brandStats.HTM} 
                            onClick={() => onFilterSelect('brand', 'HTM')}
                        />
                        <BrandStatRow 
                            brand="VMA" 
                            label="V.M.A" 
                            color={COLORS.SUCCESS} 
                            data={metrics.brandStats.VMA} 
                            onClick={() => onFilterSelect('brand', 'VMA')}
                        />
                        {metrics.brandStats.Other.count > 0 && (
                            <BrandStatRow 
                                brand="ETC" 
                                label="Khác" 
                                color={COLORS.SLATE} 
                                data={metrics.brandStats.Other} 
                                onClick={() => onFilterSelect('brand', 'Khác')}
                            />
                        )}
                    </div>
                </GlassCard>

                {/* Error Origin with Tabs */}
                <GlassCard className="p-8" delay={700}>
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                                <ShieldCheckIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg">Nguồn gốc Lỗi</h3>
                        </div>
                        
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100/50 p-1 rounded-xl shadow-inner border border-slate-200/50 backdrop-blur-sm">
                            {(['All', 'HTM', 'VMA', 'Khác'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={(e) => { e.stopPropagation(); setActiveOriginTab(tab); }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                        activeOriginTab === tab 
                                        ? 'bg-white text-[#003DA5] shadow-sm ring-1 ring-black/5' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                    }`}
                                >
                                    {tab === 'All' ? 'Tất cả' : tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-2 min-h-[200px]">
                        <ProgressBarChart 
                            data={metrics.originData[activeOriginTab]} 
                            color={COLORS.DANGER}
                            onBarClick={(label) => onFilterSelect('defectType', label)} 
                        />
                    </div>
                </GlassCard>
            </div>

            {/* 4. Top Products Row */}
            <div className="mb-4">
                <GlassCard className="p-8 flex flex-col" delay={800}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                            <TagIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Top 5 Sản phẩm bị phản ánh</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {metrics.topProducts.map((prod, idx) => (
                            <div key={idx} className="flex flex-col justify-between p-4 rounded-2xl bg-white/40 hover:bg-white/60 transition-all border border-white/50 shadow-sm group h-32 backdrop-blur-sm">
                                <div className="flex justify-between items-start">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${idx === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                        {idx + 1}
                                    </div>
                                    <span className="text-2xl font-black text-slate-800 leading-none">{prod.count}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-extrabold text-[#003DA5] truncate bg-blue-50/50 px-1.5 rounded w-fit mb-1 border border-blue-100/50">{prod.code}</p>
                                    <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-tight" title={prod.name}>{prod.name}</p>
                                </div>
                            </div>
                        ))}
                        {metrics.topProducts.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-400 text-sm font-bold opacity-50">Chưa có dữ liệu</div>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* --- DETAILS MODALS --- */}
            {showDistributorModal && (
                <DataModal title="Thống kê Nhà Phân Phối" onClose={() => setShowDistributorModal(false)}>
                    <table className="min-w-full divide-y divide-slate-200/50">
                        <thead className="bg-slate-50/80 backdrop-blur sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-16">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nhà Phân Phối</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Số Phiếu</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Số SP (SKU)</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-emerald-600 uppercase tracking-wider w-32">SL Đổi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-slate-100/50">
                            {distributorStats.map((item, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500 text-center">{idx + 1}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 text-center">{item.reportCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600 text-center">{item.skus.size}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 text-center">{item.exchangeCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DataModal>
            )}

            {showProductModal && (
                <DataModal title="Thống kê theo Sản Phẩm (SKU)" onClose={() => setShowProductModal(false)}>
                    <table className="min-w-full divide-y divide-slate-200/50">
                        <thead className="bg-slate-50/80 backdrop-blur sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-16">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Mã SP</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tên Thương Mại</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Số Phiếu</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-emerald-600 uppercase tracking-wider w-32">SL Đổi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-slate-100/50">
                            {productStats.map((item, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500 text-center">{idx + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#003DA5]">{item.code}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 text-center">{item.reportCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 text-center">{item.exchangeCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DataModal>
            )}

        </div>
    );
};

export default DashboardReport;
