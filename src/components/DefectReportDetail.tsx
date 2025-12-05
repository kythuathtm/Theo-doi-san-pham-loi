import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { DefectReport, UserRole, ActivityLog } from '../types';
import { 
  PencilIcon, TrashIcon, XIcon, WrenchIcon, ClipboardDocumentListIcon, 
  TagIcon, ChatBubbleLeftIcon, ClockIcon, CheckCircleIcon, ArrowDownTrayIcon, 
  BuildingStoreIcon, CalendarIcon, PaperAirplaneIcon, MapPinIcon, UserGroupIcon,
  ArchiveBoxIcon, ExclamationTriangleIcon, CubeIcon, PrinterIcon
} from './Icons';

interface Props {
  report: DefectReport;
  onEdit: (report: DefectReport) => void;
  onUpdate: (id: string, updates: Partial<DefectReport>, msg?: string, user?: { username: string, role: string }) => Promise<boolean>;
  onDelete: (id: string) => void;
  permissions: { canEdit: boolean; canDelete: boolean };
  onClose: () => void;
  currentUserRole: UserRole;
  currentUsername: string;
  onAddComment: (reportId: string, content: string, user: { username: string, role: string }) => Promise<boolean>;
}

// --- Helper Components ---

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  wrapperClass?: string;
  icon?: React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, className = "text-slate-800", wrapperClass = "col-span-1", icon }) => {
    const hasValue = value !== null && value !== undefined && value !== '';
    const displayValue = hasValue ? value : <span className="text-slate-300 italic font-normal text-xs">---</span>;

    return (
        <div className={`flex flex-col ${wrapperClass}`}>
            <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 truncate">
                {icon && <span className="opacity-70">{icon}</span>}
                {label}
            </dt>
            <dd className={`text-sm font-medium break-words bg-slate-50/50 px-3 py-2.5 rounded-lg border border-slate-100 min-h-[40px] flex items-center shadow-sm ${hasValue ? className : ''}`}>
                {displayValue}
            </dd>
        </div>
    );
};

interface SectionCardProps {
    title: string;
    icon: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    headerAction?: React.ReactNode;
    gradient?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children, className = "", headerAction, gradient }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md group ${className}`}>
        {gradient && <div className={`h-1 w-full bg-gradient-to-r rounded-t-2xl ${gradient}`}></div>}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl">
            <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 shadow-sm group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                    {icon}
                </div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h4>
            </div>
            {headerAction}
        </div>
        <div className="p-5 flex-1 relative">
            {children}
        </div>
    </div>
);

const TimelineItem: React.FC<{ log: ActivityLog }> = ({ log }) => {
  const isComment = log.type === 'comment';
  return (
    <div className="flex gap-4 pb-8 last:pb-2 relative animate-fade-in group">
      {/* Line connector */}
      <div className="absolute top-4 left-[15px] bottom-0 w-px bg-slate-200 group-last:hidden"></div>
      
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white shadow-sm border transition-colors ${
        isComment ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-400'
      }`}>
        {isComment ? <ChatBubbleLeftIcon className="w-4 h-4"/> : <ClockIcon className="w-4 h-4"/>}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              {log.user}
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${isComment ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {log.role || 'System'}
              </span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium tabular-nums">{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
        </div>
        <div className={`text-sm leading-relaxed p-3.5 rounded-2xl rounded-tl-none border shadow-sm relative group-hover:shadow-md transition-shadow ${
            isComment 
            ? 'bg-blue-50/30 border-blue-100/60 text-slate-700' 
            : 'bg-white border-slate-200 text-slate-600 italic'
        }`}>
            {log.content}
            {/* Triangle for bubble effect */}
            <div className={`absolute -left-[6px] top-0 w-0 h-0 border-t-[8px] border-r-[8px] border-l-0 border-b-0 border-transparent ${isComment ? 'border-t-blue-100/60' : 'border-t-slate-200'}`}></div>
            <div className={`absolute -left-[4px] top-[1px] w-0 h-0 border-t-[6px] border-r-[6px] border-l-0 border-b-0 border-transparent ${isComment ? 'border-t-[#f8faff]' : 'border-t-white'}`}></div>
        </div>
      </div>
    </div>
  );
};

// Visual Progress Stepper for Report Status
const StatusStepper = ({ currentStatus }: { currentStatus: string }) => {
    const steps = ['Mới', 'Đang tiếp nhận', 'Đang xác minh', 'Đang xử lý', 'Hoàn thành'];
    const currentIndex = steps.indexOf(currentStatus);
    const isErrorState = currentStatus === 'Chưa tìm ra nguyên nhân';

    return (
        <div className="w-full py-6 px-4 mb-4 bg-white border-b border-slate-100 overflow-x-auto print:hidden">
            <div className="flex items-center justify-between min-w-[600px] relative mx-auto max-w-4xl">
                {/* Background Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full -z-10"></div>
                
                {/* Active Line */}
                <div 
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full -z-10 transition-all duration-700 ease-in-out ${isErrorState ? 'bg-purple-200' : 'bg-blue-500'}`}
                    style={{ width: isErrorState ? '100%' : `${(currentIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    let status = 'pending'; // pending, active, completed
                    if (isErrorState) {
                         // Keep visually distinct but generally "active" for steps passed
                         if (index < 4) status = 'completed'; // Assuming error happens before completion
                    } else {
                        if (index < currentIndex) status = 'completed';
                        else if (index === currentIndex) status = 'active';
                    }
                    
                    return (
                        <div key={step} className="flex flex-col items-center gap-3 relative group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 z-10 ${
                                status === 'completed' ? 'border-blue-500 bg-blue-500 text-white scale-100' :
                                status === 'active' ? 'border-blue-500 bg-white text-blue-600 shadow-[0_0_0_4px_rgba(59,130,246,0.15)] scale-110' :
                                'border-slate-200 bg-white text-slate-300'
                            }`}>
                                {status === 'completed' ? (
                                    <CheckCircleIcon className="w-6 h-6" />
                                ) : (
                                    <span className="text-sm font-bold">{index + 1}</span>
                                )}
                            </div>
                            <span className={`text-[11px] font-bold uppercase tracking-wider absolute -bottom-8 w-32 text-center transition-colors duration-300 ${
                                status === 'active' ? 'text-blue-700' : 
                                status === 'completed' ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
            
            {isErrorState && (
                <div className="mt-8 flex justify-center animate-pulse">
                    <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-2 shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                        Đang ở trạng thái: Chưa tìm ra nguyên nhân
                    </span>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

const DefectReportDetail: React.FC<Props> = ({ report, onEdit, onUpdate, onDelete, permissions, onClose, currentUserRole, currentUsername, onAddComment }) => {
  // Tabs: 'info' (Information + Resolution), 'log' (Log + Chat)
  const [activeTab, setActiveTab] = useState<'info' | 'log'>('info');

  const [quickUpdateData, setQuickUpdateData] = useState({
      nguyenNhan: report.nguyenNhan || '',
      huongKhacPhuc: report.huongKhacPhuc || '',
      soLuongDoi: report.soLuongDoi || 0,
      ngayDoiHang: report.ngayDoiHang || '',
      trangThai: report.trangThai
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const commentEndRef = useRef<HTMLDivElement>(null);
  
  // Printing Logic
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
      contentRef: componentRef,
      documentTitle: `Phieu_Khieu_Nai_${report.id}`,
  });
  
  // Granular edit state
  const [editingSections, setEditingSections] = useState({
      nguyenNhan: false,
      huongKhacPhuc: false,
      soLuong: false
  });

  // Sync state when report prop updates
  useEffect(() => {
      setQuickUpdateData({
          nguyenNhan: report.nguyenNhan || '',
          huongKhacPhuc: report.huongKhacPhuc || '',
          soLuongDoi: report.soLuongDoi || 0,
          ngayDoiHang: report.ngayDoiHang || '',
          trangThai: report.trangThai
      });
  }, [report]);

  // Scroll to bottom of comments when opened or new comment added
  useEffect(() => {
    if (activeTab === 'log' && commentEndRef.current) {
        commentEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [report.activityLog?.length, activeTab]);

  const handleQuickUpdate = async () => {
      setIsUpdating(true);
      const updates: any = {};
      
      if (editingSections.nguyenNhan) updates.nguyenNhan = quickUpdateData.nguyenNhan;
      if (editingSections.huongKhacPhuc) updates.huongKhacPhuc = quickUpdateData.huongKhacPhuc;
      if (editingSections.soLuong) {
          updates.soLuongDoi = Number(quickUpdateData.soLuongDoi);
          updates.ngayDoiHang = quickUpdateData.ngayDoiHang;
      }
      updates.trangThai = quickUpdateData.trangThai;

      if (updates.trangThai === 'Hoàn thành' && !report.ngayHoanThanh) {
          const d = new Date();
          const y = d.getFullYear();
          const m = (`0${d.getMonth() + 1}`).slice(-2);
          const day = (`0${d.getDate()}`).slice(-2);
          updates.ngayHoanThanh = `${y}-${m}-${day}`;
      }

      const user = { username: currentUsername, role: currentUserRole };
      const success = await onUpdate(report.id, updates, 'Đã cập nhật thông tin xử lý.', user);
      if (success) {
          setEditingSections({ nguyenNhan: false, huongKhacPhuc: false, soLuong: false });
      }
      setIsUpdating(false);
  };

  const handleSendComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      setIsSendingComment(true);
      const success = await onAddComment(report.id, newComment, { username: currentUsername, role: currentUserRole });
      if (success) {
          setNewComment('');
      }
      setIsSendingComment(false);
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'Mới': return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10';
          case 'Đang tiếp nhận': return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10';
          case 'Đang xác minh': return 'bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-500/10';
          case 'Đang xử lý': return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10';
          case 'Chưa tìm ra nguyên nhân': return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10';
          case 'Hoàn thành': return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10';
          default: return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/10';
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-sans">
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; }
        `}
      </style>
      
      {/* 1. Sticky Header */}
      <div className="flex flex-col border-b border-slate-200 bg-white shadow-sm z-30 sticky top-0 print:hidden">
          <div className="flex justify-between items-center px-4 py-3 sm:px-6">
            <div className="flex items-center gap-4 min-w-0">
                <div className={`hidden sm:flex px-3 py-1.5 rounded-lg text-[11px] font-extrabold border uppercase tracking-wider ring-4 ${getStatusColor(report.trangThai)}`}>
                        {report.trangThai}
                </div>
                <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">#{report.id.substring(0,8)}</span>
                            <span className="sm:hidden text-[10px] font-extrabold uppercase text-slate-500">{report.trangThai}</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-800 leading-tight truncate" title={report.tenThuongMai}>
                            {report.tenThuongMai}
                        </h2>
                </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
                <button 
                    onClick={handlePrint}
                    className="p-2 sm:px-3 sm:py-2 bg-white text-slate-600 border border-slate-300 font-bold rounded-xl text-xs sm:text-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm active:scale-95 flex items-center gap-2 group"
                >
                    <PrinterIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">In phiếu</span>
                </button>

                {permissions.canEdit && (
                    <button 
                        onClick={() => onEdit(report)}
                        className="p-2 sm:px-3 sm:py-2 bg-white text-slate-600 border border-slate-300 font-bold rounded-xl text-xs sm:text-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm active:scale-95 flex items-center gap-2 group"
                    >
                        <PencilIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span className="hidden sm:inline">Sửa</span>
                    </button>
                )}
                
                {permissions.canDelete && (
                    <button 
                        onClick={() => { if(window.confirm('Xóa phiếu này?')) onDelete(report.id); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-red-100"
                        title="Xóa phiếu"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
                
                <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
                
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-all active:scale-95 transform hover:rotate-90 duration-300">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
          </div>

          {/* 2 Tabs */}
          <div className="px-4 sm:px-6 flex gap-6">
              <button 
                  onClick={() => setActiveTab('info')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'info' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
              >
                  <ClipboardDocumentListIcon className="w-4 h-4 inline-block mr-2 mb-0.5" />
                  Thông tin & Phân tích
              </button>
              <button 
                  onClick={() => setActiveTab('log')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'log' 
                      ? 'border-purple-600 text-purple-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
              >
                  <ChatBubbleLeftIcon className="w-4 h-4 inline-block mr-2 mb-0.5" />
                  Nhật ký & Trao đổi
              </button>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth pb-32 print:overflow-visible print:h-auto" ref={componentRef}>
        
        {/* Status Stepper - Only visible in Info Tab */}
        {activeTab === 'info' && <StatusStepper currentStatus={report.trangThai} />}

        <div className="p-4 sm:p-6">
        {/* TAB 1: INFORMATION & RESOLUTION */}
        {activeTab === 'info' && (
            <div className="max-w-full mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-fade-in">
                
                {/* LEFT COLUMN (65% width on XL) */}
                <div className="xl:col-span-8 space-y-6">
                    {/* Card 1: Product & Customer */}
                    <SectionCard title="Thông tin Chung" icon={<ArchiveBoxIcon className="w-4 h-4"/>} gradient="from-blue-400 to-indigo-400">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Product Info */}
                            <div>
                                <h5 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-blue-50 pb-2">
                                    <TagIcon className="w-4 h-4"/> Sản phẩm
                                </h5>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailRow label="Mã sản phẩm" value={report.maSanPham} className="font-mono text-[#003DA5] font-bold" />
                                        <DetailRow label="Nhãn hàng" value={report.nhanHang} />
                                    </div>
                                    <DetailRow label="Tên thương mại" value={report.tenThuongMai} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailRow label="Dòng sản phẩm" value={report.dongSanPham} />
                                        <DetailRow label="Tên thiết bị" value={report.tenThietBi} />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <DetailRow label="Số lô" value={report.soLo} className="font-mono" />
                                        <DetailRow label="Mã NSX" value={report.maNgaySanXuat} className="font-mono" />
                                        <DetailRow label="Hạn dùng" value={report.hanDung ? new Date(report.hanDung).toLocaleDateString('en-GB') : ''} />
                                        <DetailRow label="ĐVT" value={report.donViTinh} />
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h5 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-orange-50 pb-2">
                                    <UserGroupIcon className="w-4 h-4"/> Khách hàng
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <DetailRow 
                                        label="Nhà phân phối" 
                                        value={report.nhaPhanPhoi} 
                                        className="font-semibold text-slate-700" 
                                        icon={<BuildingStoreIcon className="w-3 h-3"/>} 
                                    />
                                    <DetailRow 
                                        label="Đơn vị sử dụng" 
                                        value={report.donViSuDung} 
                                        className="font-semibold text-slate-700" 
                                        icon={<MapPinIcon className="w-3 h-3"/>} 
                                    />
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Card 2: Defect Content */}
                    <SectionCard title="Nội dung khiếu nại" icon={<ExclamationTriangleIcon className="w-4 h-4"/>} gradient="from-rose-400 to-orange-400">
                         <div className="flex flex-wrap gap-6 mb-6">
                            <div className="flex-1 min-w-[200px]">
                                <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Ngày phản ánh</dt>
                                <dd className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2 w-fit">
                                    <CalendarIcon className="w-4 h-4 text-slate-400"/>
                                    {new Date(report.ngayPhanAnh).toLocaleDateString('en-GB')}
                                </dd>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nguồn gốc lỗi</dt>
                                <dd className="text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm w-fit">
                                    <span className="relative flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                    </span>
                                    {report.loaiLoi}
                                </dd>
                            </div>
                         </div>
                         
                         <div className="mb-6">
                            <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                Mô tả chi tiết
                            </dt>
                            <dd className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-sm whitespace-pre-wrap min-h-[80px]">
                                {report.noiDungPhanAnh}
                            </dd>
                         </div>
                         
                         {report.images && report.images.length > 0 && (
                             <div>
                                <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    Hình ảnh minh chứng <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold border border-slate-200">{report.images.length}</span>
                                </dt>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 print:grid-cols-3">
                                    {report.images.map((img, idx) => (
                                        <a 
                                            href={img} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            key={idx} 
                                            className="aspect-square rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group relative cursor-zoom-in ring-1 ring-black/5 bg-slate-100 print:break-inside-avoid"
                                        >
                                            <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 print:hidden">
                                                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 text-slate-800 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                             </div>
                         )}
                    </SectionCard>
                </div>

                {/* RIGHT COLUMN (35% width on XL - Sticky removed to allow full scroll) */}
                <div className="xl:col-span-4 space-y-6">
                    {/* Card 3: Processing Info */}
                    <SectionCard 
                        title="Phân tích & Xử lý" 
                        icon={<WrenchIcon className="w-4 h-4"/>} 
                        gradient="from-emerald-400 to-teal-400"
                        className="ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/5 relative"
                    >
                        <div className="space-y-6 relative z-10">
                            
                            {/* QUANTITY STATS */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center h-full min-h-[90px]">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Đã nhập</span>
                                    <span className="text-xl font-black text-slate-700">{report.soLuongDaNhap}</span>
                                </div>
                                <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center h-full min-h-[90px]">
                                    <span className="text-[10px] font-bold text-red-400 uppercase mb-1">Lỗi</span>
                                    <span className="text-xl font-black text-red-600">{report.soLuongLoi}</span>
                                </div>
                                
                                {/* Editable Exchange Qty */}
                                <div className="relative group perspective h-full min-h-[90px]">
                                    {editingSections.soLuong ? (
                                        <div className="absolute inset-0 z-20 bg-white rounded-xl shadow-xl border border-emerald-100 p-2 animate-zoom-in flex flex-col justify-center">
                                            <input 
                                                type="number"
                                                className="w-full text-center text-lg font-black text-emerald-600 border-b border-emerald-100 focus:border-emerald-500 focus:outline-none bg-transparent mb-1"
                                                autoFocus
                                                value={quickUpdateData.soLuongDoi}
                                                onChange={(e) => setQuickUpdateData({...quickUpdateData, soLuongDoi: parseInt(e.target.value) || 0})}
                                            />
                                            <input 
                                                type="date"
                                                className="w-full text-[10px] p-1 border rounded bg-slate-50"
                                                value={quickUpdateData.ngayDoiHang || ''}
                                                onChange={(e) => setQuickUpdateData({...quickUpdateData, ngayDoiHang: e.target.value})}
                                            />
                                            <div className="flex gap-1 mt-1">
                                                <button onClick={handleQuickUpdate} className="flex-1 bg-emerald-500 text-white text-[9px] rounded py-1">OK</button>
                                                <button onClick={() => setEditingSections({...editingSections, soLuong: false})} className="flex-1 bg-slate-200 text-slate-600 text-[9px] rounded py-1">X</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-all h-full"
                                            onClick={() => permissions.canEdit && setEditingSections({...editingSections, soLuong: true})}
                                        >
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="text-[10px] font-bold text-emerald-500 uppercase">Đổi</span>
                                                {permissions.canEdit && <PencilIcon className="w-3 h-3 text-emerald-300 print:hidden"/>}
                                            </div>
                                            <span className="text-xl font-black text-emerald-600">{report.soLuongDoi}</span>
                                            {report.ngayDoiHang && (
                                                <span className="text-[9px] text-emerald-600/70 font-medium mt-1 border-t border-emerald-200/50 pt-1 w-full">
                                                    {new Date(report.ngayDoiHang).toLocaleDateString('en-GB')}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* STATUS */}
                            <div className="print:hidden">
                                <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Trạng thái xử lý</dt>
                                {permissions.canEdit ? (
                                    <div className="relative group">
                                        <select 
                                            value={quickUpdateData.trangThai}
                                            onChange={(e) => setQuickUpdateData({...quickUpdateData, trangThai: e.target.value as any})}
                                            className="w-full pl-4 pr-10 py-3.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white hover:bg-slate-50 transition-colors appearance-none cursor-pointer shadow-sm"
                                        >
                                            <option value="Mới">Mới</option>
                                            <option value="Đang tiếp nhận">Đang tiếp nhận</option>
                                            <option value="Đang xác minh">Đang xác minh</option>
                                            <option value="Đang xử lý">Đang xử lý</option>
                                            <option value="Chưa tìm ra nguyên nhân">Chưa tìm ra nguyên nhân</option>
                                            <option value="Hoàn thành">Hoàn thành</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`px-4 py-3 rounded-xl text-sm font-bold border text-center shadow-sm ${getStatusColor(report.trangThai)}`}>{report.trangThai}</div>
                                )}
                            </div>

                            {/* CAUSE EDIT */}
                            <div className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phân tích Nguyên nhân</dt>
                                    {permissions.canEdit && !editingSections.nguyenNhan && (
                                        <button onClick={() => setEditingSections({...editingSections, nguyenNhan: true})} className="text-blue-600 hover:text-blue-700 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 hover:shadow-sm print:hidden">
                                            <PencilIcon className="w-3 h-3 inline mr-1"/>Sửa
                                        </button>
                                    )}
                                </div>
                                {editingSections.nguyenNhan ? (
                                    <div className="animate-fade-in-up bg-white p-3 rounded-xl border border-blue-200 shadow-sm ring-4 ring-blue-500/5">
                                        <textarea 
                                            className="w-full p-2 text-sm focus:outline-none text-slate-700 font-medium bg-transparent"
                                            rows={4}
                                            value={quickUpdateData.nguyenNhan}
                                            onChange={(e) => setQuickUpdateData({...quickUpdateData, nguyenNhan: e.target.value})}
                                            autoFocus
                                            placeholder="Nhập nguyên nhân..."
                                        />
                                        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-50">
                                            <button onClick={() => setEditingSections({...editingSections, nguyenNhan: false})} className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold">Hủy</button>
                                            <button onClick={handleQuickUpdate} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm shadow-blue-200">Lưu</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="text-sm text-slate-700 font-medium leading-relaxed min-h-[80px] bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer group/item break-words shadow-inner print:bg-white print:border-none print:p-0"
                                        onClick={() => permissions.canEdit && setEditingSections({...editingSections, nguyenNhan: true})}
                                    >
                                        {report.nguyenNhan || <span className="text-slate-400 italic font-normal">Chưa xác định nguyên nhân...</span>}
                                    </div>
                                )}
                            </div>

                            {/* SOLUTION EDIT */}
                            <div className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Biện pháp Khắc phục</dt>
                                    {permissions.canEdit && !editingSections.huongKhacPhuc && (
                                        <button onClick={() => setEditingSections({...editingSections, huongKhacPhuc: true})} className="text-blue-600 hover:text-blue-700 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 hover:shadow-sm print:hidden">
                                            <PencilIcon className="w-3 h-3 inline mr-1"/>Sửa
                                        </button>
                                    )}
                                </div>
                                {editingSections.huongKhacPhuc ? (
                                    <div className="animate-fade-in-up bg-white p-3 rounded-xl border border-blue-200 shadow-sm ring-4 ring-blue-500/5">
                                        <textarea 
                                            className="w-full p-2 text-sm focus:outline-none text-slate-700 font-medium bg-transparent"
                                            rows={4}
                                            value={quickUpdateData.huongKhacPhuc}
                                            onChange={(e) => setQuickUpdateData({...quickUpdateData, huongKhacPhuc: e.target.value})}
                                            autoFocus
                                            placeholder="Nhập hướng xử lý..."
                                        />
                                        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-50">
                                            <button onClick={() => setEditingSections({...editingSections, huongKhacPhuc: false})} className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold">Hủy</button>
                                            <button onClick={handleQuickUpdate} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm shadow-blue-200">Lưu</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="text-sm text-slate-700 font-medium leading-relaxed min-h-[80px] bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer group/item break-words shadow-inner print:bg-white print:border-none print:p-0"
                                        onClick={() => permissions.canEdit && setEditingSections({...editingSections, huongKhacPhuc: true})}
                                    >
                                        {report.huongKhacPhuc || <span className="text-slate-400 italic font-normal">Chưa có hướng khắc phục...</span>}
                                    </div>
                                )}
                            </div>
                            
                            {/* Save Status Button */}
                            {permissions.canEdit && quickUpdateData.trangThai !== report.trangThai && (
                                <button 
                                    onClick={handleQuickUpdate}
                                    disabled={isUpdating}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 animate-fade-in-up print:hidden"
                                >
                                    {isUpdating ? 'Đang lưu...' : (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Cập nhật thay đổi
                                        </>
                                    )}
                                </button>
                            )}
                            
                            {report.ngayHoanThanh && (
                                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3 animate-fade-in-up">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0"><CheckCircleIcon className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Đã hoàn thành</p>
                                        <p className="text-sm font-bold text-slate-800">{new Date(report.ngayHoanThanh).toLocaleDateString('en-GB')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </SectionCard>
                </div>
            </div>
        )}

        {/* TAB 2: LOG & CHAT */}
        {activeTab === 'log' && (
            <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in">
                <SectionCard title="Dòng thời gian hoạt động" icon={<ChatBubbleLeftIcon className="w-4 h-4"/>} className="flex flex-col flex-1 h-full" gradient="from-purple-400 to-pink-400">
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 mb-4">
                        <div className="relative pt-2">
                            {report.activityLog && report.activityLog.length > 0 ? (
                                [...report.activityLog]
                                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                .map((log) => (
                                    <TimelineItem key={log.id} log={log} />
                                ))
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center text-slate-400 opacity-60">
                                    <ChatBubbleLeftIcon className="w-12 h-12 mb-2 stroke-1 text-slate-300"/>
                                    <span className="text-sm font-medium">Chưa có hoạt động nào</span>
                                </div>
                            )}
                            <div ref={commentEndRef} />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 bg-white relative z-20 mt-auto print:hidden">
                        <form onSubmit={handleSendComment} className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-200">
                                    {currentUsername.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <input 
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Viết bình luận..."
                                className="w-full pl-14 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner placeholder:text-slate-400 text-slate-700 font-medium"
                            />
                            <button 
                                type="submit"
                                disabled={!newComment.trim() || isSendingComment}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md active:scale-95 flex items-center justify-center"
                            >
                                {isSendingComment ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <PaperAirplaneIcon className="w-4 h-4" />}
                            </button>
                        </form>
                    </div>
                </SectionCard>
            </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default DefectReportDetail;]]></content>
  </change>
</changes>