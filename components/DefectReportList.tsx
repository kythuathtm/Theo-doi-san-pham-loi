import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { DefectReport, UserRole } from '../types';
import Pagination from './Pagination';
import { 
    MagnifyingGlassIcon, InboxIcon, ClockIcon, CheckCircleIcon, 
    SparklesIcon, Cog6ToothIcon, TrashIcon, ArrowDownTrayIcon,
    CalendarIcon, FunnelIcon, XIcon, DocumentDuplicateIcon,
    ArrowUpIcon, ArrowDownIcon, AdjustmentsIcon
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
  currentUsername: string;
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
  onItemsPerPageChange: (items: number) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  isLoading?: boolean;
  onExport: () => void;
  onDuplicate?: (report: DefectReport) => void;
  baseFontSize?: string; 
}

const statusColorMap: { [key in DefectReport['trangThai']]: string } = {
  'Mới': 'bg-blue-50 text-blue-700 border-blue-200',
  'Đang xử lý': 'bg-amber-50 text-amber-700 border-amber-200',
  'Chưa tìm ra nguyên nhân': 'bg-purple-50 text-purple-700 border-purple-200',
  'Hoàn thành': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusBorderMap: { [key in DefectReport['trangThai']]: string } = {
    'Mới': 'border-blue-500',
    'Đang xử lý': 'border-amber-500',
    'Chưa tìm ra nguyên nhân': 'border-purple-500',
    'Hoàn thành': 'border-emerald-500',
};

type ColumnId = 'stt' | 'ngayPhanAnh' | 'maSanPham' | 'tenThuongMai' | 'noiDungPhanAnh' | 'soLo' | 'maNgaySanXuat' | 'trangThai' | 'actions';

interface ColumnConfig {
  id: ColumnId;
  label: string;
  visible: boolean;
  width: number;
  align?: 'left' | 'center' | 'right';
  fixed?: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
    { id: 'stt', label: 'STT', visible: true, width: 60, align: 'center' },
    { id: 'ngayPhanAnh', label: 'Ngày phản ánh', visible: true, width: 130, align: 'left' },
    { id: 'maSanPham', label: 'Mã sản phẩm', visible: true, width: 120, align: 'left' },
    { id: 'tenThuongMai', label: 'Tên thương mại', visible: true, width: 250, align: 'left' }, 
    { id: 'noiDungPhanAnh', label: 'Nội dung phản ánh', visible: true, width: 300, align: 'left' }, 
    { id: 'soLo', label: 'Số lô', visible: true, width: 100, align: 'left' },
    { id: 'maNgaySanXuat', label: 'Mã NSX', visible: true, width: 100, align: 'left' },
    { id: 'trangThai', label: 'Trạng thái', visible: true, width: 150, align: 'left' },
    { id: 'actions', label: '', visible: true, width: 100, align: 'center', fixed: true },
];

const HighlightText = React.memo(({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim() || !text) return <>{text}</>;
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) => 
                regex.test(part) ? (
                    <span key={i} className="bg-yellow-200 text-slate-900 rounded-[2px] px-0.5 shadow-sm">{part}</span>
                ) : (
                    part
                )
            )}
        </span>
    );
});

// Mobile Card Component with Fixed Height for Virtualization
const MobileReportCard = React.memo(({ 
    report, onSelect, onDuplicate, onDelete, canDelete, highlight, style 
}: { 
    report: DefectReport, onSelect: () => void, 
    onDuplicate: ((r: DefectReport) => void) | undefined, 
    onDelete: (id: string) => void, canDelete: boolean, highlight: string, style?: React.CSSProperties 
}) => {
    return (
        <div 
            style={style}
            onClick={onSelect}
            className="absolute left-0 right-0 w-full px-3 py-2 touch-manipulation"
        >
            <div className={`bg-white rounded-xl shadow-sm border border-slate-100 border-l-4 ${statusBorderMap[report.trangThai]} active:scale-[0.98] transition-transform duration-200 h-full flex flex-col justify-between overflow-hidden`}>
                <div className="p-3 pb-0 flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col flex-1 mr-2">
                            <h4 className="font-bold text-slate-900 text-base leading-tight mb-1.5 line-clamp-1">
                                <HighlightText text={report.tenThuongMai} highlight={highlight} />
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                                    <HighlightText text={report.maSanPham} highlight={highlight} />
                                </span>
                                <span className="text-xs text-slate-400 font-medium flex items-center">
                                    {new Date(report.ngayPhanAnh).toLocaleDateString('en-GB')}
                                </span>
                            </div>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg border bg-white shadow-sm flex-shrink-0 ${statusColorMap[report.trangThai]}`}>
                            {report.trangThai}
                        </span>
                    </div>
                    
                    {/* Content Preview */}
                    <div className="text-sm font-normal text-slate-500 bg-slate-50/80 p-2 rounded-lg italic line-clamp-2 border border-slate-50 leading-relaxed mb-2">
                        <HighlightText text={report.noiDungPhanAnh || 'Không có nội dung'} highlight={highlight} />
                    </div>
                </div>
                
                {/* Footer Action Strip */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 bg-slate-50/30">
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">Lô: {report.soLo}</span>
                     </div>
                     
                     <div className="flex items-center gap-2">
                          {onDuplicate && (
                              <button 
                                 onClick={(e) => { e.stopPropagation(); onDuplicate(report); }}
                                 className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg active:scale-95 transition-colors"
                                 title="Sao chép"
                              >
                                 <DocumentDuplicateIcon className="h-5 w-5" />
                              </button>
                          )}
                          {canDelete && (
                              <button 
                                 onClick={(e) => { e.stopPropagation(); onDelete(report.id); }}
                                 className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg active:scale-95 transition-colors"
                                 title="Xóa"
                              >
                                 <TrashIcon className="h-5 w-5" />
                              </button>
                          )}
                     </div>
                </div>
            </div>
        </div>
    );
});

const DefectReportList: React.FC<Props> = ({ 
  reports, totalReports, currentPage, itemsPerPage, onPageChange, 
  onSelectReport, currentUserRole, currentUsername,
  filters, onSearchTermChange, onStatusFilterChange, onDefectTypeFilterChange, onYearFilterChange, onDateFilterChange,
  summaryStats, onItemsPerPageChange, onDelete, isLoading, onExport, onDuplicate, baseFontSize = '15px'
}) => {
  // Columns State
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Interaction State
  const [reportToDelete, setReportToDelete] = useState<DefectReport | null>(null);
  const [hoveredReport, setHoveredReport] = useState<DefectReport | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // --- VIRTUALIZATION STATE ---
  const parentRef = useRef<HTMLDivElement>(null);       // Desktop Container
  const mobileListRef = useRef<HTMLDivElement>(null);   // Mobile Container
  
  const [scrollTop, setScrollTop] = useState(0);              // Desktop Scroll
  const [mobileScrollTop, setMobileScrollTop] = useState(0);  // Mobile Scroll
  
  const [containerHeight, setContainerHeight] = useState(600);
  const [mobileContainerHeight, setMobileContainerHeight] = useState(600);
  
  // Dynamic Row Height Calculation
  const fontSizePx = parseInt(baseFontSize, 10) || 15;
  const ROW_HEIGHT = Math.max(54, fontSizePx * 3.6);        // Scale row height with font
  const MOBILE_ROW_HEIGHT = Math.max(200, fontSizePx * 13.5); // Fixed height for new mobile card design

  // --- RESIZING LOGIC ---
  const resizingRef = useRef<{ startX: number; startWidth: number; colId: ColumnId } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  // --- DRAG AND DROP STATE ---
  const [draggedColId, setDraggedColId] = useState<ColumnId | null>(null);

  // Use dynamic storage key based on username
  const storageKey = `tableColumnConfigV17_${currentUsername}`;

  // Load Columns Config with Order Preservation
  useEffect(() => {
    if (!currentUsername) return; 
    
    const savedColumnsStr = localStorage.getItem(storageKey); 
    if (savedColumnsStr) {
        try {
            const parsedColumns = JSON.parse(savedColumnsStr) as ColumnConfig[];
            const defaultColMap = new Map(DEFAULT_COLUMNS.map(c => [c.id, c]));
            const newColumns: ColumnConfig[] = [];
            const processedIds = new Set<string>();

            parsedColumns.forEach(savedCol => {
                const defaultCol = defaultColMap.get(savedCol.id);
                if (defaultCol) {
                    newColumns.push({
                        ...defaultCol,
                        width: savedCol.width,
                        visible: savedCol.visible
                    });
                    processedIds.add(savedCol.id);
                }
            });

            DEFAULT_COLUMNS.forEach(defCol => {
                if (!processedIds.has(defCol.id)) {
                    newColumns.push(defCol);
                }
            });
            
            if (newColumns.length > 0) setColumns(newColumns);
            else setColumns(DEFAULT_COLUMNS);
        } catch (e) {
            console.error("Failed to load column config", e);
            setColumns(DEFAULT_COLUMNS);
        }
    } else {
        setColumns(DEFAULT_COLUMNS);
    }
  }, [currentUsername]);

  // Save Config on Change
  useEffect(() => { 
      if (currentUsername) {
          localStorage.setItem(storageKey, JSON.stringify(columns)); 
      }
  }, [columns, currentUsername]);

  // --- RESIZE HANDLERS ---
  const startResize = (e: React.MouseEvent, colId: ColumnId, currentWidth: number) => {
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);
      resizingRef.current = { startX: e.clientX, startWidth: currentWidth, colId };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);
  };

  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
      if (!resizingRef.current) return;
      const { startX, startWidth, colId } = resizingRef.current;
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + deltaX);

      setColumns(prev => prev.map(col => 
          col.id === colId ? { ...col, width: newWidth } : col
      ));
  }, []);

  const handleResizeMouseUp = useCallback(() => {
      setIsResizing(false);
      resizingRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
  }, [handleResizeMouseMove]);

  // --- VIRTUALIZATION HANDLERS ---
  
  useEffect(() => {
      const handleResize = () => {
          if (parentRef.current) {
              setContainerHeight(parentRef.current.clientHeight);
          }
          if (mobileListRef.current) {
              setMobileContainerHeight(mobileListRef.current.clientHeight);
          }
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      requestAnimationFrame(() => {
          setScrollTop(target.scrollTop);
      });
  }, []);

  const handleMobileScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      requestAnimationFrame(() => {
          setMobileScrollTop(target.scrollTop);
      });
  }, []);

  useEffect(() => {
      if (parentRef.current) {
          parentRef.current.scrollTop = 0;
          setScrollTop(0);
      }
      if (mobileListRef.current) {
          mobileListRef.current.scrollTop = 0;
          setMobileScrollTop(0);
      }
  }, [currentPage, filters]);

  // Calculate Visible Items
  const totalContentHeight = reports.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2); 
  const endIndex = Math.min(
      reports.length, 
      Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + 2 
  );
  const visibleReports = reports.slice(startIndex, endIndex);
  const offsetY = startIndex * ROW_HEIGHT;

  const totalMobileContentHeight = reports.length * MOBILE_ROW_HEIGHT;
  const mobileStartIndex = Math.max(0, Math.floor(mobileScrollTop / MOBILE_ROW_HEIGHT) - 2);
  const mobileEndIndex = Math.min(
      reports.length,
      Math.ceil((mobileScrollTop + mobileContainerHeight) / MOBILE_ROW_HEIGHT) + 2
  );
  const visibleMobileReports = reports.slice(mobileStartIndex, mobileEndIndex);
  const mobileOffsetY = mobileStartIndex * MOBILE_ROW_HEIGHT;

  // --- DRAG & DROP COLUMN ORDERING ---
  const handleHeaderDragStart = (e: React.DragEvent, colId: ColumnId) => {
    if (e.button !== 0) {
        e.preventDefault();
        return;
    }
    setDraggedColId(colId);
    e.dataTransfer.setData('colId', colId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleHeaderDragEnter = (e: React.DragEvent, targetColId: ColumnId) => {
      e.preventDefault();
  };
  
  const handleHeaderDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleHeaderDrop = (e: React.DragEvent, targetColId: ColumnId) => {
    e.preventDefault();
    const sourceColId = e.dataTransfer.getData('colId') as ColumnId;
    
    setDraggedColId(null); 

    if (!sourceColId || sourceColId === targetColId) return;

    const fromIndex = columns.findIndex(c => c.id === sourceColId);
    const toIndex = columns.findIndex(c => c.id === targetColId);

    if (fromIndex !== -1 && toIndex !== -1) {
        if (columns[fromIndex].fixed || columns[toIndex].fixed) return;

        const newCols = [...columns];
        const [movedCol] = newCols.splice(fromIndex, 1);
        newCols.splice(toIndex, 0, movedCol);
        setColumns(newCols);
    }
  };

  // --- MISC HANDLERS ---
  const handleRowMouseEnter = (report: DefectReport) => setHoveredReport(report);
  const handleRowMouseLeave = () => setHoveredReport(null);
  
  const handleRowMouseMove = (e: React.MouseEvent) => {
      if (tooltipRef.current) {
          const tooltip = tooltipRef.current;
          let x = e.clientX + 15;
          let y = e.clientY + 15;
          const rect = tooltip.getBoundingClientRect();
          if (x + rect.width > window.innerWidth - 20) x = e.clientX - rect.width - 15;
          if (y + rect.height > window.innerHeight - 20) y = e.clientY - rect.height - 15;
          tooltip.style.left = `${x}px`;
          tooltip.style.top = `${y}px`;
      }
  };

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
              setShowSettings(false);
          }
      };

      if (showSettings) {
          document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, [showSettings]);

  const toggleColumnVisibility = (id: ColumnId) => {
      setColumns(prev => prev.map(col => col.id === id ? { ...col, visible: !col.visible } : col));
  };

  const resetColumnsToDefault = () => {
      setColumns(DEFAULT_COLUMNS);
  };

  const moveColumn = (index: number, direction: -1 | 1) => {
    const newCols = [...columns];
    const targetIndex = index + direction;
    
    if (targetIndex < 0 || targetIndex >= newCols.length) return;
    if (newCols[targetIndex].fixed) return;

    [newCols[index], newCols[targetIndex]] = [newCols[targetIndex], newCols[index]];
    setColumns(newCols);
  };

  const resetFilters = () => {
    onSearchTermChange('');
    onStatusFilterChange('All');
    onDefectTypeFilterChange('All');
    onYearFilterChange('All');
    onDateFilterChange({ start: '', end: '' });
  };
  
  const areFiltersActive = filters.searchTerm || filters.statusFilter !== 'All' || filters.defectTypeFilter !== 'All' || filters.yearFilter !== 'All' || filters.dateFilter.start || filters.dateFilter.end;
  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  const getColumnStyle = (col: ColumnConfig) => {
      return {
          className: `${col.fixed ? 'sticky right-0 z-10 bg-white/95 backdrop-blur shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-none' : ''} ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'} flex items-center min-w-0`,
          style: { 
              flex: col.fixed ? 'none' : `${col.width} 1 ${col.width}px`,
              minWidth: `${col.width}px`,
              width: col.fixed ? `${col.width}px` : undefined
          }
      };
  };

  const renderCell = (report: DefectReport, columnId: ColumnId, index: number) => {
      switch (columnId) {
          case 'stt':
              return <span className="text-slate-500 font-medium text-base">{(currentPage - 1) * itemsPerPage + index + 1}</span>;
          case 'ngayPhanAnh':
              return <span className="text-slate-700 font-normal text-base whitespace-nowrap">{new Date(report.ngayPhanAnh).toLocaleDateString('en-GB')}</span>;
          case 'maSanPham':
              return (
                  <span className="text-blue-700 font-bold text-base whitespace-nowrap block truncate" title={report.maSanPham}>
                      <HighlightText text={report.maSanPham} highlight={filters.searchTerm} />
                  </span>
              );
          case 'tenThuongMai':
              return (
                <div className="w-full pr-2" title={report.tenThuongMai}>
                    <div className="font-semibold text-slate-800 text-base leading-snug line-clamp-2 whitespace-normal break-words">
                        <HighlightText text={report.tenThuongMai} highlight={filters.searchTerm} />
                    </div>
                </div>
              );
          case 'noiDungPhanAnh':
              return (
                <div className="w-full pr-2" title={report.noiDungPhanAnh}>
                    <div className="text-slate-600 text-base font-normal leading-snug line-clamp-2 whitespace-normal break-words">
                        <HighlightText text={report.noiDungPhanAnh} highlight={filters.searchTerm} />
                    </div>
                </div>
              );
          case 'soLo':
              return (
                  <div className="w-full pr-1" title={report.soLo}>
                      <div className="text-slate-700 text-base font-normal leading-snug line-clamp-2 whitespace-normal break-words">
                          <HighlightText text={report.soLo} highlight={filters.searchTerm} />
                      </div>
                  </div>
              );
          case 'maNgaySanXuat':
              return (
                  <div className="w-full pr-1" title={report.maNgaySanXuat}>
                      <div className="text-slate-600 text-base font-normal leading-snug line-clamp-2 whitespace-normal break-words">
                          {report.maNgaySanXuat}
                      </div>
                  </div>
              );
          case 'trangThai':
              return (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-base font-normal whitespace-nowrap border ${statusColorMap[report.trangThai]}`}>
                      {report.trangThai}
                  </span>
              );
          case 'actions':
              const canDelete = ([UserRole.Admin, UserRole.KyThuat] as string[]).includes(currentUserRole);
              return (
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onDuplicate && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate(report);
                            }}
                            className="p-2 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all shadow-sm active:scale-95"
                            title="Sao chép"
                        >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setReportToDelete(report);
                            }}
                            className="p-2 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all shadow-sm active:scale-95"
                            title="Xóa"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                  </div>
              );
          default:
              return null;
      }
  };

  const StatTab = ({ label, count, active, onClick, icon }: any) => (
      <button 
          onClick={onClick}
          className={`relative flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap z-10 flex-shrink-0 snap-start select-none ${
              active 
              ? 'text-blue-700 border-blue-600 bg-blue-50/60' 
              : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
          }`}
      >
          <span className={`${active ? 'text-blue-600' : 'text-slate-400'} transition-colors`}>{icon}</span>
          <span>{label}</span>
          <span className={`ml-1 py-0.5 px-2 rounded-full text-xs font-extrabold transition-colors ${
              active ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
          }`}>
              {count}
          </span>
      </button>
  );
  
  const canDeleteRole = ([UserRole.Admin, UserRole.KyThuat] as string[]).includes(currentUserRole);
  const showDefectTypeFilter = !([UserRole.SanXuat, UserRole.Kho] as string[]).includes(currentUserRole);

  return (
    <div className="flex flex-col h-full w-full relative px-0 sm:px-4 lg:px-8 py-0 sm:py-4">
      
      <div className="flex flex-col h-full bg-slate-50 sm:bg-white sm:rounded-2xl sm:shadow-soft sm:border sm:border-slate-200 overflow-hidden sm:ring-1 sm:ring-slate-100 relative">
          
          {/* TABS */}
          <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar bg-white/80 backdrop-blur-sm shadow-sm z-20 sticky top-0 h-12 w-full snap-x">
              <StatTab label="Tất cả" count={summaryStats.total} active={filters.statusFilter === 'All'} onClick={() => onStatusFilterChange('All')} icon={<InboxIcon className="h-4 w-4"/>} />
              <StatTab label="Mới" count={summaryStats.moi} active={filters.statusFilter === 'Mới'} onClick={() => onStatusFilterChange('Mới')} icon={<SparklesIcon className="h-4 w-4"/>} />
              <StatTab label="Đang xử lý" count={summaryStats.dangXuLy} active={filters.statusFilter === 'Đang xử lý'} onClick={() => onStatusFilterChange('Đang xử lý')} icon={<ClockIcon className="h-4 w-4"/>} />
              <StatTab label="Chưa rõ" count={summaryStats.chuaTimRaNguyenNhan} active={filters.statusFilter === 'Chưa tìm ra nguyên nhân'} onClick={() => onStatusFilterChange('Chưa tìm ra nguyên nhân')} icon={<MagnifyingGlassIcon className="h-4 w-4"/>} />
              <StatTab label="Hoàn thành" count={summaryStats.hoanThanh} active={filters.statusFilter === 'Hoàn thành'} onClick={() => onStatusFilterChange('Hoàn thành')} icon={<CheckCircleIcon className="h-4 w-4"/>} />
          </div>

          {/* FILTER BAR */}
          <div className="p-2 sm:p-3 flex flex-col lg:flex-row gap-2 sm:gap-3 items-stretch lg:items-center justify-between bg-white border-b border-slate-100">
             
             {/* Mobile Filter Toggle & Search */}
             <div className="flex gap-2 items-center w-full lg:w-auto">
                <div className="relative w-full lg:w-80 xl:w-96 group flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <MagnifyingGlassIcon className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm hover:border-slate-300"
                        placeholder="Tìm theo mã, tên, lô..."
                        value={filters.searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                    className={`lg:hidden p-2 rounded-xl border transition-all ${isMobileFiltersOpen ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                    <AdjustmentsIcon className="h-5 w-5" />
                </button>
             </div>

            {/* Collapsible Filter Area */}
            <div className={`
                flex flex-col lg:flex-row gap-2 w-full lg:w-auto overflow-hidden transition-all duration-300 ease-in-out lg:!h-auto lg:!opacity-100
                ${isMobileFiltersOpen ? 'max-h-[300px] opacity-100 pt-2 lg:pt-0 border-t border-slate-100 lg:border-none' : 'max-h-0 opacity-0 lg:overflow-visible'}
            `}>
                <div className="flex flex-col sm:flex-row gap-2 w-full items-center">
                    {showDefectTypeFilter && (
                        <div className="relative group w-full