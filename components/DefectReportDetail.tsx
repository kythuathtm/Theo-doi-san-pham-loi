
import React from 'react';
import { DefectReport, UserRole } from '../types';
import { PencilIcon, TrashIcon, XIcon } from './Icons';

interface Props {
  report: DefectReport;
  onEdit: (report: DefectReport) => void;
  onDelete: (id: string) => void;
  permissions: { canEdit: boolean; canDelete: boolean };
  onClose: () => void;
  currentUserRole: UserRole;
}

interface DetailItemProps {
  label: string;
  value?: string | number | null;
  className?: string;
  fullWidth?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className, fullWidth }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className={fullWidth ? 'sm:col-span-2' : ''}>
            <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">{label}</dt>
            <dd className={`text-sm text-slate-800 break-words leading-relaxed ${className}`}>{value}</dd>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center">
            <span className="bg-blue-500 w-1.5 h-4 rounded-full mr-3"></span>
            {title}
        </h4>
        {children}
    </div>
);


const DefectReportDetail: React.FC<Props> = ({ report, onEdit, onDelete, permissions, onClose, currentUserRole }) => {
  
  // Check if current user role is allowed to see "Loại lỗi"
  const canSeeLoaiLoi = [
    UserRole.Admin,
    UserRole.TongGiamDoc,
    UserRole.CungUng,
    UserRole.KyThuat
  ].includes(currentUserRole);

  const getLoaiLoiClass = (loaiLoi: string) => {
    switch (loaiLoi) {
      case 'Lỗi bộ phận sản xuất':
      case 'Lỗi vừa sản xuất vừa NCC':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Lỗi Nhà cung cấp':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'Lỗi khác':
        return 'bg-slate-50 text-slate-600 border border-slate-200';
      default:
        return 'text-slate-700';
    }
  };

  return (
    <>
      <div className="p-6 border-b border-slate-200 bg-white/90 backdrop-blur-md flex justify-between items-start sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
                <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider">{report.maSanPham}</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-medium text-slate-500">{new Date(report.ngayPhanAnh).toLocaleDateString('en-GB')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">{report.tenThuongMai}</h3>
          </div>
          <div className="flex-shrink-0 flex items-center space-x-2 ml-4">
            {permissions.canEdit && (
              <button 
                onClick={() => onEdit(report)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                title="Chỉnh sửa"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
            {permissions.canDelete && (
                <button 
                  onClick={() => onDelete(report.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  title="Xóa"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
            )}
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
              title="Đóng"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
      </div>
      
      <div className="px-6 py-6 flex-1 overflow-y-auto bg-slate-50/50 space-y-6">
        <Section title="Thông tin Khách hàng & Phản ánh">
           <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
              <DetailItem 
                label="Ngày tạo phiếu" 
                value={report.ngayTao ? new Date(report.ngayTao).toLocaleDateString('en-GB') + ' ' + new Date(report.ngayTao).toLocaleTimeString('en-GB') : '-'} 
                className="text-slate-500 text-xs"
              />
              <DetailItem label="Nhà phân phối" value={report.nhaPhanPhoi} />
              <DetailItem label="Đơn vị sử dụng" value={report.donViSuDung} />
              <DetailItem label="Nội dung phản ánh" value={report.noiDungPhanAnh} fullWidth />
           </dl>
        </Section>

        <Section title="Thông tin Sản phẩm Lỗi">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            <DetailItem label="Dòng sản phẩm" value={report.dongSanPham} />
            <DetailItem label="Mã sản phẩm" value={report.maSanPham} className="font-mono text-slate-600"/>
            <DetailItem label="Nhãn hàng" value={report.nhanHang} className="font-semibold text-slate-700"/>
            <DetailItem label="Số lô" value={report.soLo} className="font-mono text-slate-600"/>
            <DetailItem label="Mã ngày sản xuất" value={report.maNgaySanXuat} className="font-mono text-slate-600"/>
          </dl>
          
          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-3 gap-4">
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã nhập</p>
                  <p className="font-bold text-2xl text-slate-700 mt-1">{report.soLuongDaNhap.toLocaleString('vi-VN')}</p>
             </div>
             <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center shadow-sm">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Lỗi</p>
                  <p className="font-bold text-2xl text-red-600 mt-1">{report.soLuongLoi.toLocaleString('vi-VN')}</p>
             </div>
             <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center shadow-sm">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Đổi</p>
                  <p className="font-bold text-2xl text-green-600 mt-1">{report.soLuongDoi.toLocaleString('vi-VN')}</p>
             </div>
          </div>
        </Section>

        <Section title="Thông tin Giải quyết">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 items-start">
            <DetailItem label="Trạng thái" value={report.trangThai} className="font-medium"/>
            
            {/* Completion Date */}
            {report.trangThai === 'Hoàn thành' && (
                <DetailItem 
                    label="Ngày hoàn thành" 
                    value={report.ngayHoanThanh ? new Date(report.ngayHoanThanh).toLocaleDateString('en-GB') : '---'} 
                    className="text-green-700 font-medium"
                />
            )}
            
            {canSeeLoaiLoi && report.loaiLoi && (
                <div className="sm:col-span-1 overflow-visible">
                    <div className="relative group inline-flex items-center cursor-help">
                        <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 border-b border-dashed border-slate-300">Loại lỗi</dt>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none transform translate-y-1 group-hover:translate-y-0">
                            <div className="font-bold mb-2 border-b border-slate-600 pb-2 text-slate-200">Định nghĩa phân loại</div>
                            <ul className="space-y-2">
                                <li><span className="text-blue-300 font-semibold block mb-0.5">Lỗi bộ phận sản xuất:</span> Lỗi phát sinh do quy trình, máy móc hoặc nhân sự sản xuất nội bộ.</li>
                                <li><span className="text-yellow-300 font-semibold block mb-0.5">Lỗi Nhà cung cấp:</span> Lỗi do nguyên vật liệu, bao bì đầu vào từ NCC.</li>
                                <li><span className="text-purple-300 font-semibold block mb-0.5">Lỗi SX & NCC:</span> Lỗi kết hợp do cả nguyên liệu đầu vào và quá trình sản xuất.</li>
                                <li><span className="text-slate-300 font-semibold block mb-0.5">Lỗi khác:</span> Lỗi do vận chuyển, bảo quản hoặc chưa xác định nguyên nhân.</li>
                            </ul>
                             {/* Arrow */}
                            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                    </div>
                    <dd className={`block w-fit px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getLoaiLoiClass(report.loaiLoi)}`}>
                        {report.loaiLoi}
                    </dd>
                </div>
            )}
            
            <DetailItem label="Nguyên nhân" value={report.nguyenNhan} fullWidth />
            <DetailItem label="Hướng khắc phục" value={report.huongKhacPhuc} fullWidth />
          </dl>
        </Section>
      </div>
    </>
  );
};

export default React.memo(DefectReportDetail);
