
import React, { useMemo, useState, useEffect } from 'react';
import { DefectReport } from '../types';
import { 
    CheckCircleIcon, ClockIcon, 
    ShoppingBagIcon, TagIcon, 
    FunnelIcon, ShieldCheckIcon, ArrowUpIcon, ArrowDownIcon,
    CubeIcon, ChartPieIcon, UserGroupIcon,
    InboxIcon, TruckIcon, SparklesIcon, WrenchIcon,
    TableCellsIcon, XIcon, ArrowRightOnRectangleIcon, EyeIcon,
    MagnifyingGlassIcon
} from './Icons';

interface Props {
  reports: DefectReport[];
  onFilterSelect: (filterType: 'status' | 'defectType' | 'all' | 'search' | 'brand', value?: string) => void;
  onSelectReport: (report: DefectReport) => void;
  onOpenAiAnalysis: () => void;
  isLoading?: boolean;
}

// --- BRAND PALETTE (Color System) ---
const BRAND = {
    PRIMARY: '#003DA5', // HTM Blue
    SUCCESS: '#009183', // VMA Green
    DANGER: '#C5003E',  // Alert Red
    DANGER_LIGHT: '#f43f5e', // Rose-500
    WARNING: '#F59E0B', // Amber
    INFO: '#3B82F6',    // Sky Blue
    CYAN: '#06b6d4',    // Cyan (For Verifying)
    VIOLET: '#8B5CF6',  // Violet
    INDIGO: '#6366F1',  // Indigo
    SLATE: '#64748B',   // Slate
};

// --- HELPER FUNCTIONS ---

const parseDate = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            return { year: y, month: m - 1, day: d };
        }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
    }
    return null;
};

const getSmoothPath = (points: {x: number, y: number}[]) => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cp1x = p0.x + (p1.x - p0.x) * 0.4;
        const cp1y = p0.y;
        const cp2x = p1.x - (p1.x - p0.x) * 0.4;
        const cp2y = p1.y;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
};

// --- ANIMATION COMPONENTS ---

const CountUp = ({ value, duration = 1000, className = "" }: { value: string | number, duration?: number, className?: string }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g,"")) || 0 : value;
    const isPercentage = typeof value === 'string' && value.includes('%');
    
    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const ease = 1 - Math.pow(1 - percentage, 3); 
            
            setDisplayValue(numericValue * ease);

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplayValue(numericValue);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [numericValue, duration]);

    const formatted = isPercentage 
        ? `${displayValue.toFixed(0)}%` 
        : Math.ceil(displayValue).toLocaleString('en-US');

    return <span className={className}>{formatted}</span>;
};

// --- VISUAL COMPONENTS ---

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 1);
    const min = 0;
    const width = 80;
    const height = 30;
    
    const points = data.map((val, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((val - min) / (max - min)) * height
    }));

    const pathD = getSmoothPath(points);

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height + 4}`} className="overflow-visible">
            <defs>
                <linearGradient id={`grad-spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={`${pathD} L ${width} ${height} L 0 ${height} Z`} fill={`url(#grad-spark-${color.replace('#', '')})`} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="2" fill="white" stroke={color} strokeWidth="1.5" />
        </svg>
    );
};

const KpiCard = ({ title, value, subValue, trend, icon, colorHex, onClick, trendInverse = false, delayIndex = 0 }: any) => {
    const isUp = trend.trend === 'up';
    const isNeutral = trend.trend === 'neutral';
    const isPositive = trendInverse ? !isUp : isUp;
    
    let trendColorClass = 'text-slate-400 bg-slate-50';
    let TrendIcon = isUp ? ArrowUpIcon : ArrowDownIcon;
    
    if (!isNeutral) {
        if (isPositive) trendColorClass = 'text-emerald-700 bg-emerald-50/50';
        else trendColorClass = 'text-rose-700 bg-rose-50/50';
    }

    return (
        <div 
            onClick={onClick} 
            className="group relative bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 ease-out cursor-pointer overflow-hidden hover:-translate-y-0.5 h-full flex flex-col justify-between animate-fade-in-up border-l-4"
            style={{ 
                animationDelay: `${delayIndex * 75}ms`,
                borderLeftColor: colorHex
            }}
        >
            <div 
                className="absolute -right-6 -top-6 w-32 h-32 rounded-full blur-2xl opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 pointer-events-none" 
                style={{ backgroundColor: colorHex }}
            ></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div 
                            className="p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110 bg-slate-50 group-hover:bg-white ring-1 ring-black/5"
                            style={{ color: colorHex }}
                        >
                            {React.cloneElement(icon, { className: "h-4 w-4" })}
                        </div>
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider leading-tight pt-0.5">{title}</p>
                    </div>
                </div>
                
                <div className="mb-3">
                    <h3 
                        className="text-3xl leading-none font-bold text-slate-800 tracking-tighter tabular-nums"
                    >
                        <CountUp value={value} />
                    </h3>
                </div>
                
                <div className="flex items-end justify-between mt-auto h-8">
                    <div className="flex flex-col justify-end">
                        {!isNeutral && (
                            <div className={`flex items-center gap-1 text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md w-fit mb-0.5 ${trendColorClass}`}>
                                <TrendIcon className="w-2.5 h-2.5 stroke-[3px]" />
                                {Math.abs(trend.percent)}%
                            </div>
                        )}
                        {subValue && (
                            <p className="text-[0.6rem] font-medium text-slate-400 truncate max-w-[80px]" title={subValue}>
                                {subValue}
                            </p>
                        )}
                    </div>
                    
                    <div className="w-20 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                         <Sparkline data={trend.sparkline} color={colorHex} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const DonutChart = ({ data, colors, centerLabel, onClickSlice }: any) => {
    const total = data.reduce((acc: number, item: any) => acc + item.value, 0);
    const [hoveredSlice, setHoveredSlice] = useState<any | null>(null);
    
    const size = 160;
    const strokeWidth = 14; 
    const hoverStrokeWidth = 20;
    const radius = 60; 
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    const activeItem = hoveredSlice || { label: centerLabel, value: total };
    
    let cumulativePercent = 0;

    if (total === 0) return (
        <div className="flex flex-col items-center justify-center h-40 text-slate-300">
            <ChartPieIcon className="w-8 h-8 opacity-20 mb-2"/>
            <span className="text-[0.6rem] font-bold uppercase tracking-wider opacity-60">Chưa có dữ liệu</span>
        </div>
    );

    return (
        <div className="flex flex-row items-center justify-center w-full select-none gap-4">
            <div className="relative w-[160px] h-[160px] flex-shrink-0">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 drop-shadow-md overflow-visible">
                    {data.map((item: any, index: number) => {
                        if (item.value === 0) return null;
                        const percent = item.value / total;
                        const strokeDasharray = `${percent * circumference} ${circumference}`;
                        const strokeDashoffset = -cumulativePercent * circumference;
                        cumulativePercent += percent;
                        const isHovered = hoveredSlice?.label === item.label;
                        
                        return (
                            <circle
                                key={index}
                                r={radius}
                                cx={center}
                                cy={center}
                                fill="transparent"
                                stroke={colors[index % colors.length]}
                                strokeWidth={isHovered ? hoverStrokeWidth : strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round" 
                                className="transition-all duration-200 ease-out cursor-pointer"
                                style={{ 
                                    opacity: hoveredSlice ? (isHovered ? 1 : 0.3) : 1,
                                }}
                                onMouseEnter={() => setHoveredSlice(item)}
                                onMouseLeave={() => setHoveredSlice(null)}
                                onClick={() => onClickSlice && onClickSlice(item.label)}
                            />
                        );
                    })}
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-slate-800 tracking-tight tabular-nums transition-all duration-200">
                        {hoveredSlice ? activeItem.value.toLocaleString() : <CountUp value={activeItem.value} />}
                    </span>
                    <span className="text-[0.55rem] uppercase font-bold text-slate-400 tracking-widest text-center line-clamp-1 max-w-[90px]">
                        {activeItem.label}
                    </span>
                </div>
            </div>
            
            <div className="flex flex-col gap-1 min-w-[100px]">
                {data.map((item: any, index: number) => (
                    <div 
                        key={index} 
                        className={`flex items-center justify-between text-[0.65rem] cursor-pointer p-1.5 rounded-lg transition-all border border-transparent ${hoveredSlice?.label === item.label ? 'bg-white border-slate-100 shadow-sm' : 'hover:bg-white/50'}`} 
                        onMouseEnter={() => setHoveredSlice(item)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() => onClickSlice && onClickSlice(item.label)}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></span>
                            <span className={`font-bold transition-colors truncate ${hoveredSlice?.label === item.label ? 'text-slate-900' : 'text-slate-500'}`}>{item.label}</span>
                        </div>
                        <span className="font-bold text-slate-700 ml-1 tabular-nums">{((item.value / total) * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TrendChart = ({ data, label, color = BRAND.PRIMARY }: any) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-wide">Chưa có dữ liệu</div>;

    const maxVal = Math.max(...data.map((d: any) => d.count), 5) * 1.1;
    const height = 200;
    const width = 600;
    const paddingX = 20;
    const paddingY = 15;
    const chartHeight = height - paddingY * 2;

    const getX = (i: number) => paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const getY = (v: number) => {
        const safeMax = maxVal === 0 ? 1 : maxVal;
        return height - paddingY - (v / safeMax) * chartHeight;
    };

    const points = data.map((d: any, i: number) => ({ x: getX(i), y: getY(d.count) }));
    const dPath = getSmoothPath(points);
    const areaPath = `${dPath} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

    return (
        <div className="w-full h-full relative flex flex-col group/chart">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" onMouseLeave={() => setHoverIndex(null)}>
                <defs>
                    <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                
                {[0, 0.5, 1].map(t => {
                    const y = paddingY + chartHeight * t;
                    return <line key={t} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />;
                })}

                <path d={areaPath} fill={`url(#grad-${label.replace(/\s/g, '')})`} className="transition-all duration-500" />
                <path d={dPath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {data.map((d: any, i: number) => {
                    const { x, y } = points[i];
                    const isHover = hoverIndex === i;
                    
                    return (
                        <g key={i}>
                            <rect 
                                x={x - (width/data.length)/2} y={0} width={width/data.length} height={height} 
                                fill="transparent" 
                                onMouseEnter={() => setHoverIndex(i)}
                                style={{cursor: 'crosshair'}}
                            />
                            {isHover && (
                                <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke={color} strokeWidth="1" strokeDasharray="3 3" className="opacity-50" />
                            )}
                            <circle 
                                cx={x} cy={y} r={isHover ? 4 : 0} 
                                fill="white" stroke={color} strokeWidth={2} 
                                className="transition-all duration-200 shadow-sm"
                            />
                        </g>
                    )
                })}
            </svg>
            
            {hoverIndex !== null && data[hoverIndex] && (
                <div 
                    className={`absolute top-0 pointer-events-none transition-all duration-200 z-20 flex flex-col
                        ${hoverIndex === 0 ? 'translate-x-2 items-start' : 
                          hoverIndex === data.length - 1 ? '-translate-x-[105%] items-end' : 
                          '-translate-x-1/2 items-center'}
                    `}
                    style={{ left: `${(getX(hoverIndex) / width) * 100}%` }}
                >
                    <div className="bg-white/95 backdrop-blur-md border border-slate-100 text-slate-800 p-2 rounded-lg shadow-lg flex flex-col min-w-[70px] ring-1 ring-black/5 transform -translate-y-2">
                        <span className="font-bold text-[0.55rem] text-slate-400 uppercase tracking-widest mb-0.5">T{data[hoverIndex].month}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-base font-bold leading-none tracking-tight" style={{ color: color }}>
                                {data[hoverIndex].count.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                            </span>
                            <span className="text-[0.55rem] font-bold text-slate-500">{label}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between px-2 mt-1 border-t border-slate-50 pt-1">
                {data.map((d: any, i: number) => (
                    <div key={i} className={`text-[0.55rem] font-bold uppercase text-center flex-1 transition-colors duration-200 ${hoverIndex === i ? 'text-slate-800 scale-110' : 'text-slate-300'}`}>
                        {d.month}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ParetoChart = ({ data, onSelect }: { data: any[], onSelect: (code: string) => void }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-wide">Chưa có dữ liệu</div>;

    const width = 600;
    const height = 250;
    const padding = { top: 20, right: 30, bottom: 30, left: 30 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxDefect = Math.max(...data.map(d => d.defect)) || 1;
    const barWidth = (chartWidth / data.length) * 0.6;
    
    const linePoints = data.map((d, i) => {
        const x = padding.left + (i * (chartWidth / data.length)) + (chartWidth / data.length) / 2;
        const y = padding.top + chartHeight - (d.cumPercent / 100) * chartHeight;
        return {x, y};
    });
    
    const linePath = getSmoothPath(linePoints);

    return (
        <div className="w-full h-full relative group/pareto animate-fade-in">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" onMouseLeave={() => setHoverIndex(null)}>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={BRAND.DANGER_LIGHT} />
                        <stop offset="100%" stopColor={BRAND.DANGER} />
                    </linearGradient>
                </defs>

                {[0, 0.5, 1].map(t => (
                    <line key={t} x1={padding.left} y1={padding.top + chartHeight * t} x2={width - padding.right} y2={padding.top + chartHeight * t} stroke="#f1f5f9" strokeWidth="1" />
                ))}

                {data.map((d, i) => {
                    const barHeight = (d.defect / maxDefect) * chartHeight;
                    const x = padding.left + (i * (chartWidth / data.length)) + (chartWidth / data.length - barWidth) / 2;
                    const y = padding.top + chartHeight - barHeight;
                    const isHover = hoverIndex === i;

                    return (
                        <g key={`bar-${i}`} onClick={() => onSelect(d.code)} className="cursor-pointer">
                            <rect 
                                x={x} y={y} width={barWidth} height={barHeight} 
                                fill="url(#barGradient)" rx="2"
                                opacity={hoverIndex !== null && !isHover ? 0.4 : 1}
                                className="transition-all duration-200"
                            />
                            <rect 
                                x={padding.left + (i * (chartWidth / data.length))} y={padding.top} 
                                width={chartWidth / data.length} height={chartHeight} 
                                fill="transparent" onMouseEnter={() => setHoverIndex(i)}
                            />
                        </g>
                    );
                })}

                <path d={linePath} fill="none" stroke={BRAND.WARNING} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 drop-shadow-sm" />
                
                {linePoints.map((p, i) => (
                    <circle 
                        key={`dot-${i}`} cx={p.x} cy={p.y} r={hoverIndex === i ? 5 : 3} 
                        fill="white" stroke={BRAND.WARNING} strokeWidth="2" 
                        className="transition-all duration-200 pointer-events-none"
                    />
                ))}

                {data.map((d, i) => {
                    const x = padding.left + (i * (chartWidth / data.length)) + (chartWidth / data.length) / 2;
                    const isHover = hoverIndex === i;
                    return (
                        <text 
                            key={`label-${i}`} x={x} y={height - 10} textAnchor="middle" 
                            fill={isHover ? BRAND.PRIMARY : BRAND.SLATE} 
                            fontWeight={isHover ? "800" : "600"} fontSize="9"
                            className="uppercase transition-colors select-none"
                        >
                            {d.code}
                        </text>
                    )
                })}
            </svg>

            {hoverIndex !== null && data[hoverIndex] && (
                <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md border border-white/60 text-slate-800 p-3 rounded-xl shadow-xl z-30 pointer-events-none min-w-[160px] animate-fade-in-up"
                >
                    <div className="font-bold text-slate-800 mb-2 text-[0.65rem] border-b border-slate-100 pb-1 truncate">{data[hoverIndex].name}</div>
                    <div className="space-y-1.5 text-[0.6rem]">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-bold">Lỗi</span>
                            <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">{data[hoverIndex].defect}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-bold">Tích lũy</span>
                            <span className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">{data[hoverIndex].cumPercent.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const RecentActivityList = ({ reports, onSelect }: { reports: DefectReport[], onSelect: (r: DefectReport) => void }) => {
    const recent = reports.slice(0, 5);
    if (recent.length === 0) return <div className="text-center text-slate-400 text-[0.65rem] py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">Chưa có hoạt động nào.</div>;

    return (
        <div className="space-y-2" style={{ fontFamily: 'var(--list-font, inherit)' }}>
            {recent.map((r, i) => {
                const isResolved = r.trangThai === 'Hoàn thành';
                return (
                    <div key={r.id} onClick={() => onSelect(r)} className="flex items-center gap-3 p-2 hover:bg-slate-50 cursor-pointer group transition-all rounded-xl border border-transparent hover:border-slate-100 hover:shadow-sm active:scale-95 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-black/5 transition-colors ${isResolved ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            {isResolved ? <CheckCircleIcon className="w-3.5 h-3.5"/> : <WrenchIcon className="w-3.5 h-3.5"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="font-bold text-slate-700 truncate group-hover:text-[#003DA5] transition-colors text-[0.65rem]">{r.maSanPham}</span>
                                <span className="text-[0.55rem] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{new Date(r.ngayPhanAnh).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="text-[0.6rem] text-slate-500 font-medium truncate group-hover:text-slate-700 transition-colors">
                                {r.tenThuongMai}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- MODAL COMPONENT ---
const DashboardDetailModal = ({ title, onClose, children, onSearch, searchValue }: { title: string, onClose: () => void, children?: React.ReactNode, onSearch: (val: string) => void, searchValue: string }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-pop ring-1 ring-white/20">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-white gap-4 flex-shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <TableCellsIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide whitespace-nowrap hidden sm:block">{title}</h3>
                    <div className="relative flex-1 max-w-xs group ml-2">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                        </div>
                        <input 
                            type="text" 
                            value={searchValue}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder="Tìm kiếm..." 
                            className="pl-8 pr-3 py-1.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 shadow-inner outline-none transition-all font-medium"
                            autoFocus
                        />
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all active:scale-90">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-0 custom-scrollbar bg-white">
                {children}
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-[0.6rem] text-slate-400 font-medium">
                Chọn một dòng để xem chi tiết danh sách
            </div>
        </div>
    </div>
);

const DashboardReport: React.FC<Props> = ({ reports, onFilterSelect, onSelectReport, onOpenAiAnalysis, isLoading }) => {
  const [viewMode, setViewMode] = useState<'service' | 'production'>('service');
  const [prodMetric, setProdMetric] = useState<'defect' | 'exchange' | 'ratio'>('defect');
  const [activeModal, setActiveModal] = useState<'none' | 'distributor' | 'product'>('none');
  const [modalSearch, setModalSearch] = useState('');

  const stats = useMemo(() => {
      let totalTickets = 0, totalDefectQty = 0, totalExchangeQty = 0;
      const distMap = new Map<string, { total: number, completed: number, skus: Set<string> }>();
      const prodMap = new Map();
      const statusCounts = { 'Mới': 0, 'Đang tiếp nhận': 0, 'Đang xác minh': 0, 'Đang xử lý': 0, 'Chưa tìm ra nguyên nhân': 0, 'Hoàn thành': 0 };
      const sourceCounts = { 'Sản xuất': 0, 'NCC': 0, 'Hỗn hợp': 0, 'Khác': 0 };
      let completedWithExchange = 0;
      let completedNoExchange = 0;
      const brandCounts = { 'HTM': { t: 0, q: 0, e: 0, skus: new Set<string>() }, 'VMA': { t: 0, q: 0, e: 0, skus: new Set<string>() } };
      const uniqueSKUs = new Set<string>();
      const monthlyTicket = Array(12).fill(0);
      const monthlyDefect = Array(12).fill(0);
      const monthlyExchange = Array(12).fill(0);
      const today = new Date();
      const currentYear = today.getFullYear();

      const getSparklineData = (mode: 'ticket' | 'qty' | 'exchange', monthsBack: number = 6) => {
        const data = [];
        const currentM = today.getMonth();
        const currentY = today.getFullYear();
        for (let i = monthsBack - 1; i >= 0; i--) {
            let tm = currentM - i;
            let ty = currentY;
            while (tm < 0) { tm += 12; ty -= 1; }
            let val = 0;
            if (reports) {
                reports.forEach(r => {
                    if (!r.ngayPhanAnh) return;
                    const d = parseDate(r.ngayPhanAnh);
                    if (!d) return;
                    if (d.month === tm && d.year === ty) {
                        if (mode === 'ticket') val += 1;
                        else if (mode === 'qty') val += (r.soLuongLoi || 0);
                        else if (mode === 'exchange') val += (r.soLuongDoi || 0);
                    }
                });
            }
            data.push(val);
        }
        return data;
      };

      const calculateTrend = (mode: 'qty' | 'ticket' | 'exchange') => {
        const cm = today.getMonth();
        const cy = today.getFullYear();
        const lm = cm === 0 ? 11 : cm - 1;
        const ly = cm === 0 ? cy - 1 : cy;
        let cVal = 0, lVal = 0;
        
        if (reports) {
            reports.forEach(r => {
                if (!r.ngayPhanAnh) return;
                const d = parseDate(r.ngayPhanAnh);
                if (!d) return;
                let val = mode === 'qty' ? (r.soLuongLoi||0) : mode === 'exchange' ? (r.soLuongDoi||0) : 1;
                if (d.month === cm && d.year === cy) cVal += val;
                if (d.month === lm && d.year === ly) lVal += val;
            });
        }
        
        const diff = cVal - lVal;
        let percent = lVal > 0 ? Number(((diff / lVal) * 100).toFixed(1)) : (cVal > 0 ? 100 : 0);
        return {
            value: cVal, diff, percent,
            trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
            sparkline: getSparklineData(mode)
        };
      };

      if (reports) {
        reports.forEach(r => {
            totalTickets++;
            const dQty = r.soLuongLoi || 0;
            const eQty = r.soLuongDoi || 0;
            totalDefectQty += dQty;
            totalExchangeQty += eQty;
            if (statusCounts[r.trangThai] !== undefined) statusCounts[r.trangThai]++;
            if (r.trangThai === 'Hoàn thành') {
                if (eQty > 0) completedWithExchange++; else completedNoExchange++;
            }
            let src = 'Khác';
            if (r.loaiLoi?.includes('Sản xuất')) src = 'Sản xuất';
            else if (r.loaiLoi?.includes('Nhà cung cấp')) src = 'NCC';
            else if (r.loaiLoi?.includes('Hỗn hợp')) src = 'Hỗn hợp';
            sourceCounts[src as keyof typeof sourceCounts]++;
            
            const brand = r.nhanHang === 'HTM' || r.nhanHang === 'VMA' ? r.nhanHang : 'HTM'; 
            if (brandCounts[brand]) {
                brandCounts[brand].t++; brandCounts[brand].q += dQty; brandCounts[brand].e += eQty;
                if (r.maSanPham) brandCounts[brand].skus.add(r.maSanPham);
            }
            
            if (r.maSanPham) {
                uniqueSKUs.add(r.maSanPham);
                let p = prodMap.get(r.maSanPham);
                if (!p) {
                    const normalizedBrand = (r.nhanHang === 'HTM' || r.nhanHang === 'VMA') ? r.nhanHang : 'HTM';
                    p = { 
                        code: r.maSanPham, 
                        name: r.tenThuongMai, 
                        ticket: 0, 
                        defect: 0, 
                        exchange: 0,
                        brand: normalizedBrand 
                    };
                    prodMap.set(r.maSanPham, p);
                }
                p.ticket++; 
                p.defect += dQty; 
                p.exchange += eQty;
            }
            
            const createdDate = parseDate(r.ngayPhanAnh);
            
            if (r.nhaPhanPhoi) {
                const dName = r.nhaPhanPhoi.trim();
                if (!distMap.has(dName)) {
                    distMap.set(dName, { total: 0, completed: 0, skus: new Set() });
                }
                const dStats = distMap.get(dName)!;
                dStats.total++;
                if (r.trangThai === 'Hoàn thành') dStats.completed++;
                if (r.maSanPham) dStats.skus.add(r.maSanPham);
            }

            if (createdDate && createdDate.year === currentYear) {
                const m = createdDate.month;
                if (m >= 0 && m < 12) {
                    monthlyTicket[m]++; 
                    monthlyDefect[m] += dQty; 
                    monthlyExchange[m] += eQty;
                }
            }
        });
      }

      const distributorStats = Array.from(distMap.entries()).map(([name, val]) => ({
          name,
          totalTickets: val.total,
          uniqueSKUs: val.skus.size,
          completionRate: val.total > 0 ? (val.completed / val.total) * 100 : 0
      })).sort((a, b) => b.totalTickets - a.totalTickets);

      const productStats = Array.from(prodMap.values()).map((p: any) => ({
          code: p.code,
          name: p.name,
          totalTickets: p.ticket,
          brand: p.brand
      })).sort((a: any, b: any) => b.totalTickets - a.totalTickets);

      const trendTicket = calculateTrend('ticket');
      const trendDefect = calculateTrend('qty');
      const trendExchange = calculateTrend('exchange');
      
      const topProducts = Array.from(prodMap.values());
      const topProductsByTicket = [...topProducts].sort((a,b) => b.ticket - a.ticket).slice(0, 5);
      const topProductsByDefect = [...topProducts].sort((a,b) => b.defect - a.defect).slice(0, 10);
      
      let cumDefect = 0;
      const safeTotalDefect = totalDefectQty > 0 ? totalDefectQty : 1;
      
      const paretoData = topProductsByDefect.map(p => {
          cumDefect += p.defect;
          return { ...p, cumPercent: (cumDefect / safeTotalDefect) * 100 };
      });

      const donutStatusData = [
          { label: 'Mới', value: statusCounts['Mới'] },
          { label: 'Đang tiếp nhận', value: statusCounts['Đang tiếp nhận'] },
          { label: 'Đang xác minh', value: statusCounts['Đang xác minh'] },
          { label: 'Đang xử lý', value: statusCounts['Đang xử lý'] },
          { label: 'Chưa rõ NN', value: statusCounts['Chưa tìm ra nguyên nhân'] },
          { label: 'HT (Đổi)', value: completedWithExchange },
          { label: 'HT (Không đổi)', value: completedNoExchange },
      ].filter(d => d.value > 0);
      const donutStatusColors = [BRAND.INFO, BRAND.INDIGO, BRAND.CYAN, BRAND.WARNING, BRAND.VIOLET, BRAND.DANGER, BRAND.SUCCESS];

      const donutSourceData = [
          { label: 'Sản xuất', value: sourceCounts['Sản xuất'] },
          { label: 'NCC', value: sourceCounts['NCC'] },
          { label: 'Hỗn hợp', value: sourceCounts['Hỗn hợp'] },
          { label: 'Khác', value: sourceCounts['Khác'] },
      ].filter(d => d.value > 0);
      
      const chartRatio = monthlyDefect.map((d, i) => ({ 
          month: i + 1, 
          count: d > 0 ? (monthlyExchange[i] / d) * 100 : 0 
      }));

      return {
          totalTickets, totalDefectQty, totalExchangeQty, totalUniqueSKUs: uniqueSKUs.size,
          trendTicket, trendDefect, trendExchange,
          statusCounts, sourceCounts, brandCounts,
          topProductsByTicket, paretoData,
          chartTicket: monthlyTicket.map((v, i) => ({ month: i + 1, count: v })),
          chartDefect: monthlyDefect.map((v, i) => ({ month: i + 1, count: v })),
          chartExchange: monthlyExchange.map((v, i) => ({ month: i + 1, count: v })),
          chartRatio,
          uniqueDistributors: distMap.size,
          exchangeRate: totalDefectQty > 0 ? ((totalExchangeQty/totalDefectQty)*100).toFixed(1) : "0",
          donutStatusData, donutStatusColors, donutSourceData,
          distributorStats,
          productStats
      };
  }, [reports]);

  const openModal = (type: 'distributor' | 'product') => {
      setModalSearch('');
      setActiveModal(type);
  };

  const filteredDistributors = useMemo(() => {
      return stats.distributorStats.filter(d => d.name.toLowerCase().includes(modalSearch.toLowerCase()));
  }, [stats.distributorStats, modalSearch]);

  const filteredProducts = useMemo(() => {
      return stats.productStats.filter(p => p.code.toLowerCase().includes(modalSearch.toLowerCase()) || p.name.toLowerCase().includes(modalSearch.toLowerCase()));
  }, [stats.productStats, modalSearch]);

  const handleModalItemClick = (type: 'distributor' | 'product', value: string) => {
        onFilterSelect('search', value);
        setActiveModal('none');
  };

  if (isLoading) return (
      <div className="p-6 space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 w-1/4 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>)}
          </div>
      </div>
  );

  return (
    <div 
        className="flex flex-col h-full bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 font-sans relative"
        style={{
            fontFamily: 'var(--dashboard-font, inherit)',
            fontSize: 'var(--dashboard-size, inherit)'
        }}
    >
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar pb-24">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight animate-fade-in-up">
                        {viewMode === 'service' ? 'Tổng quan Dịch vụ' : 'Chất lượng Sản xuất'}
                    </h2>
                    <p className="text-[0.65rem] text-slate-500 font-bold mt-0.5 flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        Cập nhật theo thời gian thực
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <button 
                        onClick={onOpenAiAnalysis}
                        className="flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                    >
                        <SparklesIcon className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                        Phân tích AI
                    </button>

                    <div className="bg-white/60 backdrop-blur-md p-1 rounded-lg shadow-sm border border-slate-200 inline-flex">
                        <button 
                            onClick={() => setViewMode('service')}
                            className={`flex items-center px-3 py-1.5 rounded-md text-[0.65rem] font-bold transition-all duration-300 ${viewMode === 'service' ? 'bg-[#003DA5] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
                        >
                            <UserGroupIcon className="w-3.5 h-3.5 mr-1.5" /> Dịch vụ
                        </button>
                        <button 
                            onClick={() => setViewMode('production')}
                            className={`flex items-center px-3 py-1.5 rounded-md text-[0.65rem] font-bold transition-all duration-300 ${viewMode === 'production' ? 'bg-[#C5003E] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
                        >
                            <CubeIcon className="w-3.5 h-3.5 mr-1.5" /> Sản xuất
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {viewMode === 'service' ? (
                    <>
                        <KpiCard title="TỔNG PHIẾU" value={stats.totalTickets} trend={stats.trendTicket} icon={<InboxIcon/>} colorHex={BRAND.PRIMARY} onClick={() => onFilterSelect('all')} delayIndex={0} />
                        <KpiCard 
                            title="NHÀ PHÂN PHỐI" 
                            value={stats.uniqueDistributors} 
                            subValue="Đã khiếu nại" 
                            trend={stats.trendTicket} 
                            icon={<TruckIcon/>} 
                            colorHex={BRAND.INDIGO} 
                            onClick={() => openModal('distributor')} 
                            delayIndex={1}
                        />
                        <KpiCard 
                            title="SẢN PHẨM LỖI" 
                            value={stats.totalUniqueSKUs} 
                            subValue="Số mã sản phẩm" 
                            trend={stats.trendTicket} 
                            icon={<TagIcon/>} 
                            colorHex={BRAND.VIOLET} 
                            trendInverse={true} 
                            onClick={() => openModal('product')} 
                            delayIndex={2}
                        />
                        <KpiCard title="TỶ LỆ HOÀN THÀNH" value={`${stats.totalTickets > 0 ? ((stats.statusCounts['Hoàn thành']/stats.totalTickets)*100).toFixed(0) : 0}%`} trend={stats.trendTicket} icon={<CheckCircleIcon/>} colorHex={BRAND.SUCCESS} onClick={() => onFilterSelect('status', 'Hoàn thành')} delayIndex={3} />
                    </>
                ) : (
                    <>
                        <KpiCard title="SL LỖI" value={stats.totalDefectQty} trend={stats.trendDefect} icon={<CubeIcon/>} colorHex={BRAND.DANGER} trendInverse={true} onClick={() => onFilterSelect('all')} delayIndex={0} />
                        <KpiCard title="SL ĐỔI" value={stats.totalExchangeQty} trend={stats.trendExchange} icon={<ShoppingBagIcon/>} colorHex={BRAND.INFO} trendInverse={true} onClick={() => onFilterSelect('all')} delayIndex={1} />
                        <KpiCard title="TỶ LỆ ĐỔI/LỖI" value={`${stats.exchangeRate}%`} subValue="Mức độ nghiêm trọng" trend={{trend: 'neutral', percent: 0, sparkline: []}} icon={<ChartPieIcon/>} colorHex={BRAND.WARNING} onClick={() => onFilterSelect('all')} delayIndex={2} />
                        <KpiCard title="ĐÃ KHẮC PHỤC" value={stats.totalDefectQty - stats.totalExchangeQty} subValue="Sửa chữa thành công" trend={{trend: 'up', percent: 0, sparkline: []}} icon={<WrenchIcon/>} colorHex={BRAND.SUCCESS} onClick={() => onFilterSelect('status', 'Hoàn thành')} delayIndex={3} />
                    </>
                )}
            </div>

            {viewMode === 'service' ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 animate-fade-in-up hover:shadow-md" style={{ animationDelay: '400ms' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><TagIcon className="w-3.5 h-3.5"/></div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Thống kê Nhãn hàng</h3>
                            </div>
                            <div className="space-y-3">
                                {['HTM', 'VMA'].map(brand => {
                                    const bStats = stats.brandCounts[brand as 'HTM'|'VMA'];
                                    const pct = stats.totalTickets ? (bStats.t / stats.totalTickets) * 100 : 0;
                                    const color = brand === 'HTM' ? BRAND.PRIMARY : BRAND.SUCCESS;
                                    return (
                                        <div key={brand} onClick={() => onFilterSelect('brand', brand)} className="relative p-3 border border-slate-100 rounded-xl hover:shadow-sm transition-all cursor-pointer group overflow-hidden bg-slate-50/30 hover:bg-white hover:-translate-y-0.5">
                                            <div className="flex justify-between items-center mb-2 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: color }}></span>
                                                    <span className="font-bold text-sm text-slate-800">{brand}</span>
                                                </div>
                                                <span className="text-[0.6rem] font-bold bg-white px-1.5 py-0.5 rounded-md text-slate-600 shadow-sm border border-slate-100">{pct.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white rounded-full mb-3 overflow-hidden relative z-10 ring-1 ring-slate-100">
                                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 relative z-10">
                                                <div className="text-center">
                                                    <span className="block text-[0.55rem] text-slate-400 font-bold uppercase tracking-wide">Phiếu</span>
                                                    <span className="block text-sm font-bold text-slate-700"><CountUp value={bStats.t} /></span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-[0.55rem] text-slate-400 font-bold uppercase tracking-wide">SKU Lỗi</span>
                                                    <span className="block text-sm font-bold text-slate-700"><CountUp value={bStats.skus.size} /></span>
                                                </div>
                                            </div>
                                            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-[0.04] blur-xl group-hover:scale-125 transition-transform duration-700" style={{ backgroundColor: color }}></div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 animate-fade-in-up hover:shadow-md flex flex-col" style={{ animationDelay: '500ms' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><FunnelIcon className="w-3.5 h-3.5"/></div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Tiến độ xử lý</h3>
                            </div>
                            <div className="flex-1 flex items-center justify-center min-h-[180px]">
                                <DonutChart 
                                    data={stats.donutStatusData} 
                                    colors={stats.donutStatusColors} 
                                    centerLabel="Tổng"
                                    onClickSlice={(label: string) => onFilterSelect('status', label === 'Chưa rõ NN' ? 'Chưa tìm ra nguyên nhân' : label.replace(/ \(.*\)/, ''))}
                                />
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 animate-fade-in-up hover:shadow-md" style={{ animationDelay: '600ms' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><ShieldCheckIcon className="w-3.5 h-3.5"/></div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Top Sự cố (Tần suất)</h3>
                            </div>
                            <div className="space-y-2">
                                {stats.topProductsByTicket.map((p, idx) => (
                                    <div key={idx} onClick={() => onFilterSelect('search', p.code)} className="flex items-center gap-2.5 cursor-pointer group p-1.5 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-100 hover:shadow-sm">
                                        <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md text-[0.6rem] font-bold shadow-sm transition-transform group-hover:scale-110 ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {idx+1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className="text-[0.7rem] font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors" title={p.name}>{p.name}</span>
                                                <span className="text-[0.6rem] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{p.ticket}</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${idx === 0 ? 'bg-amber-500' : 'bg-slate-400'}`} style={{width: `${(p.ticket / stats.topProductsByTicket[0].ticket)*100}%`}}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-[320px]">
                        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 animate-fade-in-up flex flex-col hover:shadow-md" style={{ animationDelay: '700ms' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><ClockIcon className="w-3.5 h-3.5"/></div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Xu hướng khiếu nại</h3>
                                    <p className="text-[0.6rem] font-bold text-slate-400">Số lượng phiếu theo tháng</p>
                                </div>
                            </div>
                            <div className="flex-1 min-h-[200px]"><TrendChart data={stats.chartTicket} label="Phiếu" color={BRAND.PRIMARY} /></div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 animate-fade-in-up flex flex-col hover:shadow-md" style={{ animationDelay: '800ms' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><SparklesIcon className="w-3.5 h-3.5"/></div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Hoạt động mới</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1"><RecentActivityList reports={reports} onSelect={onSelectReport} /></div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-[340px]">
                        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 animate-fade-in-up flex flex-col hover:shadow-md" style={{ animationDelay: '400ms' }}>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><ClockIcon className="w-3.5 h-3.5"/></div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Xu hướng Số lượng</h3>
                                        <p className="text-[0.6rem] font-bold text-slate-400">Biến động sản phẩm lỗi/đổi</p>
                                    </div>
                                </div>
                                <div className="flex bg-slate-50 p-0.5 rounded-lg">
                                    {['defect', 'exchange', 'ratio'].map(m => (
                                        <button 
                                            key={m} onClick={() => setProdMetric(m as any)}
                                            className={`px-3 py-1 text-[0.6rem] font-bold rounded-md transition-all ${prodMetric === m ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {m === 'defect' ? 'Lỗi' : m === 'exchange' ? 'Đổi' : '% Đổi'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 min-h-[220px]">
                                <TrendChart 
                                    data={prodMetric === 'defect' ? stats.chartDefect : prodMetric === 'exchange' ? stats.chartExchange : stats.chartRatio}
                                    label={prodMetric === 'defect' ? 'SP Lỗi' : prodMetric === 'exchange' ? 'SP Đổi' : '% Đổi'}
                                    color={prodMetric === 'defect' ? BRAND.DANGER : prodMetric === 'exchange' ? BRAND.INFO : BRAND.WARNING}
                                />
                            </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 animate-fade-in-up flex flex-col hover:shadow-md" style={{ animationDelay: '500ms' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><TableCellsIcon className="w-3.5 h-3.5"/></div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Phân loại Nguyên nhân</h3>
                            </div>
                            <div className="flex-1 flex items-center justify-center min-h-[220px]">
                                <DonutChart 
                                    data={stats.donutSourceData}
                                    colors={[BRAND.DANGER, BRAND.WARNING, BRAND.INDIGO, BRAND.SLATE]} 
                                    centerLabel="Tổng"
                                    onClickSlice={(label: string) => onFilterSelect('defectType', label === 'NCC' ? 'Lỗi Nhà cung cấp' : label === 'Sản xuất' ? 'Lỗi Sản xuất' : label === 'Hỗn hợp' ? 'Lỗi Hỗn hợp' : 'Lỗi Khác')}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 animate-fade-in-up hover:shadow-md" style={{ animationDelay: '600ms' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg"><ChartPieIcon className="w-3.5 h-3.5"/></div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Biểu đồ Pareto (80/20)</h3>
                                    <p className="text-[0.6rem] font-bold text-slate-400">Top sản phẩm đóng góp nhiều nhất vào tổng lỗi</p>
                                </div>
                            </div>
                            <div className="h-64 w-full px-2">
                                <ParetoChart data={stats.paretoData} onSelect={(code) => onFilterSelect('search', code)} />
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 animate-fade-in-up hover:shadow-md" style={{ animationDelay: '700ms' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><TagIcon className="w-3.5 h-3.5"/></div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Thống kê Nhãn hàng</h3>
                            </div>
                            <div className="space-y-3">
                                {['HTM', 'VMA'].map(brand => {
                                    const bStats = stats.brandCounts[brand as 'HTM'|'VMA'];
                                    const totalQ = stats.totalDefectQty || 1;
                                    const pct = (bStats.q / totalQ) * 100;
                                    const color = brand === 'HTM' ? BRAND.PRIMARY : BRAND.SUCCESS;
                                    return (
                                        <div key={brand} onClick={() => onFilterSelect('brand', brand)} className="relative p-3 border border-slate-100 rounded-xl hover:shadow-sm transition-all cursor-pointer group overflow-hidden bg-slate-50/30 hover:bg-white hover:-translate-y-0.5">
                                            <div className="flex justify-between items-center mb-2 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: color }}></span>
                                                    <span className="font-bold text-sm text-slate-800">{brand}</span>
                                                </div>
                                                <span className="text-[0.6rem] font-bold bg-white px-1.5 py-0.5 rounded text-slate-600 shadow-sm border border-slate-100">{pct.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white rounded-full mb-3 overflow-hidden relative z-10 ring-1 ring-slate-100">
                                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 relative z-10">
                                                <div className="text-center">
                                                    <span className="block text-[0.55rem] text-slate-400 font-bold uppercase tracking-wide">Lỗi</span>
                                                    <span className="block text-sm font-bold text-slate-700"><CountUp value={bStats.q} /></span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-[0.55rem] text-slate-400 font-bold uppercase tracking-wide">Đổi</span>
                                                    <span className="block text-sm font-bold text-slate-700"><CountUp value={bStats.e} /></span>
                                                </div>
                                            </div>
                                            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-[0.04] blur-xl group-hover:scale-125 transition-transform duration-700" style={{ backgroundColor: color }}></div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* MODALS */}
            {activeModal === 'distributor' && (
                <DashboardDetailModal 
                    title="Chi tiết Nhà Phân Phối" 
                    onClose={() => setActiveModal('none')}
                    onSearch={setModalSearch}
                    searchValue={modalSearch}
                >
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[0.6rem] sticky top-0 shadow-sm tracking-wider z-10">
                            <tr>
                                <th className="px-4 py-3 border-b border-slate-100">Nhà phân phối</th>
                                <th className="px-4 py-3 text-center border-b border-slate-100">Tổng phiếu</th>
                                <th className="px-4 py-3 text-center border-b border-slate-100">SKU Lỗi</th>
                                <th className="px-4 py-3 text-right border-b border-slate-100">Tỷ lệ HT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredDistributors.map((d, i) => (
                                <tr 
                                    key={i} 
                                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                    onClick={() => handleModalItemClick('distributor', d.name)}
                                >
                                    <td className="px-4 py-2.5 font-bold text-slate-700 text-xs group-hover:text-blue-700 transition-colors">{d.name}</td>
                                    <td className="px-4 py-2.5 text-center font-bold text-xs text-slate-600">{d.totalTickets}</td>
                                    <td className="px-4 py-2.5 text-center text-xs text-slate-500 tabular-nums">{d.uniqueSKUs}</td>
                                    <td className="px-4 py-2.5 text-right">
                                        <span className={`px-2 py-0.5 rounded-md text-[0.6rem] font-bold inline-block border ${d.completionRate === 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                            {d.completionRate.toFixed(0)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredDistributors.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-xs italic">Không tìm thấy kết quả</td></tr>
                            )}
                        </tbody>
                    </table>
                </DashboardDetailModal>
            )}

            {activeModal === 'product' && (
                <DashboardDetailModal 
                    title="Chi tiết Sản Phẩm Lỗi" 
                    onClose={() => setActiveModal('none')}
                    onSearch={setModalSearch}
                    searchValue={modalSearch}
                >
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[0.6rem] sticky top-0 shadow-sm tracking-wider z-10">
                            <tr>
                                <th className="px-4 py-3 border-b border-slate-100">Mã SP</th>
                                <th className="px-4 py-3 border-b border-slate-100">Tên sản phẩm</th>
                                <th className="px-4 py-3 text-center border-b border-slate-100">Nhãn hàng</th>
                                <th className="px-4 py-3 text-center border-b border-slate-100">Tổng phiếu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map((p, i) => (
                                <tr 
                                    key={i} 
                                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group" 
                                    onClick={() => handleModalItemClick('product', p.code)}
                                >
                                    <td className="px-4 py-2.5 font-bold text-[#003DA5] text-xs whitespace-nowrap">{p.code}</td>
                                    <td className="px-4 py-2.5 font-medium text-slate-700 text-xs leading-tight group-hover:text-blue-700 transition-colors">{p.name}</td>
                                    <td className="px-4 py-2.5 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[0.55rem] font-bold uppercase border ${p.brand === 'HTM' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
                                            {p.brand}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-center font-bold text-xs text-slate-600 tabular-nums">{p.totalTickets}</td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-xs italic">Không tìm thấy kết quả</td></tr>
                            )}
                        </tbody>
                    </table>
                </DashboardDetailModal>
            )}
        </div>
    </div>
  );
}

export default React.memo(DashboardReport);
