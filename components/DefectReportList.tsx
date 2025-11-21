
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DefectReport, UserRole } from '../types';
import Pagination from './Pagination';
import { 
    MagnifyingGlassIcon, InboxIcon, ClockIcon, CheckCircleIcon, 
    DocumentDuplicateIcon, SparklesIcon, Cog6ToothIcon, EyeIcon, 
    EyeSlashIcon, ArrowUpIcon, ArrowDownIcon, QuestionMarkCircleIcon
} from './Icons';

interface SummaryStats {
    total: number;
    moi: number;
    dangXuLy: number;
    chuaTimRaNguyenNhan: number;
    hoanThanh: number;
}

interface Props {
  reports: DefectReport[];
  totalReports: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  selectedReport: DefectReport | null;
  onSelectReport: (report: DefectReport) => void;
  currentUserRole: UserRole;
  filters: {
    searchTerm: string;
    statusFilter: string;
    defectTypeFilter: string;
    yearFilter: string;
    dateFilter: { start: string; end: string };
  };
  onSearchTermChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onDefectTypeFilterChange: (type: string) => void;
  onYearFilterChange: (year: string) => void;
  onDateFilterChange: (dates: { start: string; end: string }) => void;
  summaryStats: SummaryStats;
}

const statusColorMap: { [key in DefectReport['trangThai']]: string } = {
  'Mới': 'bg-blue-100 text-blue-800 border border-blue-200',
  'Đang xử lý': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  'Chưa tìm ra nguyên nhân': 'bg-purple-100 text-purple-800 border border-purple-200',
  'Hoàn thành': 'bg-green-100 text-green-800 border border-green-200',
};

// Column Configuration Type
type ColumnId = 'stt' | 'ngayTao' | 'ngayPhanAnh' | 'maSanPham' | 'tenThuongMai' | 'noiDungPhanAnh' | 'soLo' | 'maNgaySanXuat' | 'trangThai' | 'ngayHoanThanh';

interface ColumnConfig {
  id: ColumnId;
  label: string;
  visible: boolean;
  span: number; // Represents relative width weight
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
    { id: 'stt', label: 'STT', visible: true, span: 1 },
    { id: 'ngayTao', label: 'Ngày tạo', visible: true, span: 2 },
    { id: 'ngayPhanAnh', label: 'Ngày P.Ánh', visible: true, span: 2 },
    { id: 'maSanPham', label: 'Mã SP', visible: true, span: 1 },
    { id: 'tenThuongMai', label: 'Tên thương mại', visible: true, span: 4 },
    { id: 'noiDungPhanAnh', label: 'Nội dung P.Ánh', visible: true, span: 4 },
    { id: 'soLo', label: 'Số lô', visible: true, span: 2 },
    { id: 'maNgaySanXuat', label: 'Mã NSX', visible: true, span: 2 },
    { id: 'trangThai', label: 'Trạng thái', visible: true, span: 2 },
    { id: 'ngayHoanThanh', label: 'Ngày hoàn thành', visible: false, span: 2 }, // Hidden by default
];

// Memoize StatCard to prevent re-renders if values haven't changed
const StatCard: React.FC<{ title: string; value: number; colorClass: string; icon: React.ReactNode }> = React.memo(({ title, value, colorClass, icon }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group flex items-center justify-between">
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
            <p className={`text-2xl font-extrabold mt-1 ${colorClass}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-slate-50 group-hover:bg-white transition-colors shadow-inner`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: `h-6 w-6 ${colorClass.replace('text-', 'text-opacity-80 text-')}` }) : icon}
        </div>
    </div>
));

const DefectReportList: React.FC<Props> = ({ 
  reports, totalReports, currentPage, itemsPerPage, onPageChange,
  selectedReport, onSelectReport, currentUserRole,
  filters, onSearchTermChange, onStatusFilterChange, onDefectTypeFilterChange, onYearFilterChange, onDateFilterChange,
  summaryStats
}) => {
  
  const isTGD = currentUserRole === UserRole.TongGiamDoc;
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Load columns from local storage or set defaults based on role
  useEffect(() => {
      const savedColumns = localStorage.getItem('tableColumnConfig');
      if (savedColumns) {
          try {
              setColumns(JSON.parse(savedColumns));
          } catch (e) {
              console.error("Error parsing column config", e);
          }
      } else if (isTGD) {
          // Apply TGD defaults if no saved config found
          const tgdDefaults = DEFAULT_COLUMNS.map(col => {
              if (['maSanPham', 'soLo', 'maNgaySanXuat'].includes(col.id)) {
                  return { ...col, visible: false };
              }
              if (col.id === 'ngayPhanAnh') return { ...col, span: 2 };
              return col;
          });
          setColumns(tgdDefaults);
      }
  }, [isTGD]);

  // Save columns to local storage whenever they change
  useEffect(() => {
      localStorage.setItem('tableColumnConfig', JSON.stringify(columns));
  }, [columns]);

  // Handle clicks outside settings menu to close it
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
              setShowSettings(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumnVisibility = (id: ColumnId) => {
      setColumns(prev => prev.map(col => col.id === id ? { ...col, visible: !col.visible } : col));
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
      const newColumns = [...columns];
      if (direction === 'up' && index > 0) {
          [newColumns[index], newColumns[index - 1]] = [newColumns[index - 1], newColumns[index]];
      } else if (direction === 'down' && index < newColumns.length - 1) {
          [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
      }
      setColumns(newColumns);
  };

  const resetFilters = () => {
    onSearchTermChange('');
    onStatusFilterChange('All');
    onDefectTypeFilterChange('All');
    onYearFilterChange('All'); // Resetting year filter will affect global state via parent
    onDateFilterChange({ start: '', end: '' });
  };
  
  const areFiltersActive = filters.searchTerm || filters.statusFilter !== 'All' || filters.defectTypeFilter !== 'All' || filters.yearFilter !== 'All' || filters.dateFilter.start || filters.dateFilter.end;

  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  // Helper to render cell content
  const renderCell = (report: DefectReport, columnId: ColumnId, index: number) => {
      switch (columnId) {
          case 'stt':
              return <span className="text-slate-500 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</span>;
          case 'ngayTao':
              return <span className="text-slate-500 text-xs">{report.ngayTao ? new Date(report.ngayTao).toLocaleDateString('en-GB') : '-'}</span>;
          case 'ngayPhanAnh':
              return <span className="text-slate-600">{new Date(report.ngayPhanAnh).toLocaleDateString('en-GB')}</span>;
          case 'maSanPham':
              return <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-xs">{report.maSanPham}</span>;
          case 'tenThuongMai':
              return (
                <div>
                    <div className="font-semibold text-slate-800">{report.tenThuongMai}</div>
                    <div className="text-xs text-slate-500">{report.dongSanPham}</div>
                </div>
              );
          case 'noiDungPhanAnh':
              return <span className="text-slate-700 line-clamp-2" title={report.noiDungPhanAnh}>{report.noiDungPhanAnh}</span>;
          case 'soLo':
              return <span className="font-mono text-slate-600 text-xs">{report.soLo}</span>;
          case 'maNgaySanXuat':
              return <span className="font-mono text-slate-600 text-xs">{report.maNgaySanXuat}</span>;
          case 'ngayHoanThanh':
              return report.ngayHoanThanh ? <span className="text-slate-600">{new Date(report.ngayHoanThanh).toLocaleDateString('en-GB')}</span> : <span className="text-slate-300">-</span>;
          case 'trangThai':
              return (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColorMap[report.trangThai]}`}>
                      {report.trangThai === 'Mới' && <SparklesIcon className="mr-1.5 h-3 w-3" />}
                      {report.trangThai === 'Đang xử lý' && <ClockIcon className="mr-1.5 h-3 w-3" />}
                      {report.trangThai === 'Chưa tìm ra nguyên nhân' && <QuestionMarkCircleIcon className="mr-1.5 h-3 w-3" />}
                      {report.trangThai === 'Hoàn thành' && <CheckCircleIcon className="mr-1.5 h-3 w-3" />}
                      {report.trangThai}
                  </span>
              );
          default:
              return null;
      }
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto w-full space-y-6">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Tổng Báo cáo" value={summaryStats.total} colorClass="text-slate-800" icon={<DocumentDuplicateIcon />} />
          <StatCard title="Mới" value={summaryStats.moi} colorClass="text-blue-600" icon={<SparklesIcon />} />
          <StatCard title="Đang xử lý" value={summaryStats.dangXuLy} colorClass="text-yellow-600" icon={<ClockIcon />} />
          <StatCard title="Chưa tìm ra nguyên nhân" value={summaryStats.chuaTimRaNguyenNhan} colorClass="text-purple-600" icon={<QuestionMarkCircleIcon />} />
          <StatCard title="Hoàn thành" value={summaryStats.hoanThanh} colorClass="text-green-600" icon={<CheckCircleIcon />} />
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search & Filters Group */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
                    placeholder="Tìm kiếm mã, tên, nhãn hàng, NCC..."
                    value={filters.searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                />
            </div>

            {/* Status Filter */}
            <select
                className="block w-full sm:w-36 pl-3 pr-8 py-2 text-base border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm rounded-xl bg-slate-50 focus:bg-white transition-all"
                value={filters.statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
            >
                <option value="All">Tất cả trạng thái</option>
                <option value="Mới">Mới</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Chưa tìm ra nguyên nhân">Chưa rõ</option>
                <option value="Hoàn thành">Hoàn thành</option>
            </select>

            {/* Defect Type Filter */}
            <select
                className="block w-full sm:w-40 pl-3 pr-8 py-2 text-base border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm rounded-xl bg-slate-50 focus:bg-white transition-all"
                value={filters.defectTypeFilter}
                onChange={(e) => onDefectTypeFilterChange(e.target.value)}
            >
                <option value="All">Tất cả loại lỗi</option>
                <option value="Lỗi bộ phận sản xuất">Lỗi sản xuất</option>
                <option value="Lỗi Nhà cung cấp">Lỗi Nhà cung cấp</option>
                <option value="Lỗi vừa sản xuất vừa NCC">Lỗi SX & NCC</option>
                <option value="Lỗi khác">Lỗi khác</option>
            </select>
            
            {/* Date Range */}
            <div className="flex items-center gap-2">
                <input
                    type="date"
                    className="block w-full sm:w-auto pl-3 pr-2 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                    value={filters.dateFilter.start}
                    onChange={(e) => onDateFilterChange({ ...filters.dateFilter, start: e.target.value })}
                />
                <span className="text-slate-400">-</span>
                <input
                    type="date"
                    className="block w-full sm:w-auto pl-3 pr-2 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                    value={filters.dateFilter.end}
                    onChange={(e) => onDateFilterChange({ ...filters.dateFilter, end: e.target.value })}
                />
            </div>
            
            {areFiltersActive && (
                <button 
                    onClick={resetFilters}
                    className="px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium whitespace-nowrap"
                >
                    Xóa lọc
                </button>
            )}
        </div>

        {/* Column Settings */}
        <div className="relative" ref={settingsRef}>
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 bg-white"
                title="Cấu hình cột"
            >
                <Cog6ToothIcon className="h-5 w-5" />
            </button>
            
            {showSettings && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-20 p-3 animate-fade-in-up">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Hiển thị cột</h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                        {columns.map((col, index) => (
                            <div key={col.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleColumnVisibility(col.id)} className="text-slate-500 hover:text-blue-600">
                                        {col.visible ? <EyeIcon className="h-4 w-4 text-blue-600" /> : <EyeSlashIcon className="h-4 w-4" />}
                                    </button>
                                    <span className={`text-sm ${col.visible ? 'text-slate-700' : 'text-slate-400'}`}>{col.label}</span>
                                </div>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => moveColumn(index, 'up')} 
                                        disabled={index === 0}
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                        <ArrowUpIcon className="h-3 w-3" />
                                    </button>
                                    <button 
                                        onClick={() => moveColumn(index, 'down')} 
                                        disabled={index === columns.length - 1}
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                        <ArrowDownIcon className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {reports.length > 0 ? (
            <div className="flex-1 overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    <div className="border-b border-slate-100">
                        {/* Table Header */}
                        <div className="flex bg-slate-50/80 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                            {visibleColumns.map((col) => (
                                <div key={col.id} className="py-3 px-4 first:pl-6 last:pr-6" style={{ flex: col.span }}>
                                    {col.label}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Table Rows */}
                    <div className="divide-y divide-slate-100">
                        {reports.map((report, index) => (
                            <div 
                                key={report.id}
                                onClick={() => onSelectReport(report)}
                                className={`group flex items-center hover:bg-blue-50/50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                            >
                                {visibleColumns.map((col) => (
                                    <div key={col.id} className="py-3 px-4 first:pl-6 last:pr-6 text-sm" style={{ flex: col.span }}>
                                        {renderCell(report, col.id, index)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <InboxIcon className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Không tìm thấy báo cáo</h3>
                <p className="text-slate-500 mt-1 max-w-sm">
                    {areFiltersActive 
                        ? "Không có kết quả nào phù hợp với bộ lọc hiện tại. Thử thay đổi từ khóa hoặc bộ lọc." 
                        : "Chưa có dữ liệu báo cáo nào trong hệ thống."}
                </p>
                {areFiltersActive && (
                    <button 
                        onClick={resetFilters}
                        className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
                    >
                        Xóa bộ lọc
                    </button>
                )}
            </div>
        )}
        
        {/* Pagination Footer */}
        {totalReports > 0 && (
            <div className="p-4 border-t border-slate-200 bg-white">
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalReports}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(DefectReportList);
