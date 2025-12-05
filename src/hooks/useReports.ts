
import { useState, useEffect } from 'react';
import { DefectReport, ToastType, ActivityLog } from '../types';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, deleteDoc, writeBatch, arrayUnion } from 'firebase/firestore';

const LS_REPORTS = 'app_reports_data';

const MOCK_REPORTS: DefectReport[] = [
    {
        id: 'mock-1',
        ngayTao: new Date().toISOString(),
        ngayPhanAnh: new Date().toISOString().split('T')[0],
        maSanPham: 'SP001',
        tenThuongMai: 'Kim lấy máu chân không',
        dongSanPham: 'Vật tư tiêu hao',
        tenThietBi: 'Kim lấy máu',
        nhaPhanPhoi: 'MediGroup',
        donViSuDung: 'BV Chợ Rẫy',
        noiDungPhanAnh: 'Kim bị cong, không lấy được máu',
        soLo: 'LOT202401',
        maNgaySanXuat: '0124',
        soLuongLoi: 10,
        soLuongDaNhap: 1000,
        soLuongDoi: 10,
        trangThai: 'Hoàn thành',
        loaiLoi: 'Lỗi Sản xuất',
        nguyenNhan: 'Lỗi máy dập',
        huongKhacPhuc: 'Đã đổi hàng và kiểm tra lô',
        ngayHoanThanh: new Date().toISOString().split('T')[0],
        nhanHang: 'HTM',
        activityLog: [],
        donViTinh: 'Hộp',
        images: []
    },
    {
        id: 'mock-2',
        ngayTao: new Date(Date.now() - 86400000).toISOString(),
        ngayPhanAnh: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        maSanPham: 'SP002',
        tenThuongMai: 'Ống nghiệm Serum',
        dongSanPham: 'Ống nghiệm',
        tenThietBi: 'Ống nghiệm',
        nhaPhanPhoi: 'Thành An',
        donViSuDung: 'PK Đa Khoa',
        noiDungPhanAnh: 'Nắp lỏng, rò rỉ mẫu',
        soLo: 'LOT202402',
        maNgaySanXuat: '0224',
        soLuongLoi: 50,
        soLuongDaNhap: 5000,
        soLuongDoi: 0,
        trangThai: 'Đang xác minh',
        loaiLoi: 'Lỗi Hỗn hợp',
        nguyenNhan: '',
        huongKhacPhuc: '',
        nhanHang: 'HTM',
        activityLog: [],
        donViTinh: 'Khay',
        images: []
    }
];

// Helper to clean data for Firestore
const cleanData = (data: any): any => {
    if (data instanceof Date) return data;
    if (Array.isArray(data)) return data.map(cleanData);
    else if (data !== null && typeof data === 'object') {
        return Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = cleanData(value);
            return acc;
        }, {} as any);
    }
    return data;
};

export const useReports = (showToast: (msg: string, type: ToastType) => void) => {
  const [reports, setReports] = useState<DefectReport[]>(() => {
      try {
          const saved = localStorage.getItem(LS_REPORTS);
          return saved ? JSON.parse(saved) : MOCK_REPORTS;
      } catch { return MOCK_REPORTS; }
  });
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Update Local Storage Helper
  const updateLocal = (newReports: DefectReport[]) => {
      setReports(newReports);
      localStorage.setItem(LS_REPORTS, JSON.stringify(newReports));
  };

  useEffect(() => {
    let unsubscribe = () => {};
    try {
        const q = query(collection(db, "reports"), orderBy("ngayTao", "desc"));
        unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const reportsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as DefectReport[];
                
                updateLocal(reportsData);
                setIsLoadingReports(false);
            }, 
            (error: any) => {
                if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
                    console.warn("Reports: Firestore permission denied. Using local data (Offline Mode).");
                } else {
                    console.error("Error fetching reports:", error);
                }
                setIsLoadingReports(false);
            }
        );
    } catch (error) {
        console.warn("Reports: Init failed or offline, using local data.");
        setIsLoadingReports(false);
    }
    return () => unsubscribe();
  }, []);

  const saveReport = async (report: DefectReport, isEditing: boolean) => {
    // Optimistic UI Update
    let newReports = [...reports];
    let firestorePromise;

    if (isEditing && report.id && !report.id.startsWith('new_') && !report.id.startsWith('local_')) {
        const idx = newReports.findIndex(r => r.id === report.id);
        if (idx >= 0) newReports[idx] = report;
        
        const reportRef = doc(db, "reports", report.id);
        const { id, ...data } = report;
        firestorePromise = updateDoc(reportRef, cleanData(data));
    } else {
        const newId = report.id?.startsWith('new_') ? `local_${Date.now()}` : report.id;
        const newReport = { ...report, id: newId, ngayTao: new Date().toISOString(), activityLog: [] };
        newReports = [newReport, ...newReports];
        
        const { id, ...data } = newReport;
        firestorePromise = addDoc(collection(db, "reports"), cleanData(data));
    }
    updateLocal(newReports);

    try {
        await firestorePromise;
        showToast(isEditing ? 'Cập nhật thành công!' : 'Tạo mới thành công!', 'success');
        return true;
    } catch (error: any) {
        console.warn("Offline save: report", error.code);
        showToast('Đã lưu (Offline mode)', 'success');
        return true;
    }
  };

  const updateReport = async (id: string, updates: Partial<DefectReport>, successMessage: string = 'Cập nhật thành công!', user?: { username: string, role: string }) => {
      // Optimistic
      const updatedReports = reports.map(r => {
          if (r.id === id) {
              const updatedR = { ...r, ...updates };
              if (user) {
                  const log: ActivityLog = {
                      id: `log_${Date.now()}`,
                      type: 'log',
                      content: updates.trangThai ? `Trạng thái: ${updates.trangThai}` : 'Cập nhật thông tin',
                      timestamp: new Date().toISOString(),
                      user: user.username,
                      role: user.role
                  };
                  updatedR.activityLog = [...(updatedR.activityLog || []), log];
              }
              return updatedR;
          }
          return r;
      });
      updateLocal(updatedReports);

      try {
          const reportRef = doc(db, "reports", id);
          const payload: any = { ...updates };
          if (user) {
               const log: ActivityLog = {
                  id: `log_${Date.now()}`,
                  type: 'log',
                  content: updates.trangThai ? `Trạng thái: ${updates.trangThai}` : 'Cập nhật thông tin',
                  timestamp: new Date().toISOString(),
                  user: user.username,
                  role: user.role
              };
              payload.activityLog = arrayUnion(log);
          }
          await updateDoc(reportRef, cleanData(payload));
          showToast(successMessage, 'success');
          return true;
      } catch (error: any) {
          console.warn("Offline update: report", error.code);
          showToast(successMessage + ' (Offline)', 'success');
          return true;
      }
  };

  const addComment = async (reportId: string, content: string, user: { username: string, role: string }) => {
      // Optimistic
      const newComment: ActivityLog = {
          id: `cmt_${Date.now()}`,
          type: 'comment',
          content: content,
          timestamp: new Date().toISOString(),
          user: user.username,
          role: user.role
      };

      const updatedReports = reports.map(r => {
          if (r.id === reportId) {
              return { ...r, activityLog: [...(r.activityLog || []), newComment] };
          }
          return r;
      });
      updateLocal(updatedReports);

      try {
          const reportRef = doc(db, "reports", reportId);
          await updateDoc(reportRef, { activityLog: arrayUnion(newComment) });
          return true;
      } catch (error) {
          console.warn("Offline comment");
          return true; 
      }
  };

  const deleteReport = async (id: string) => {
    // Optimistic
    const remaining = reports.filter(r => r.id !== id);
    updateLocal(remaining);
    
    try {
        await deleteDoc(doc(db, "reports", id));
        showToast('Đã xóa báo cáo.', 'info');
        return true;
    } catch (error: any) {
        console.warn("Offline delete", error.code);
        showToast('Đã xóa (Offline mode)', 'info');
        return true;
    }
  };

  const importReports = async (newReports: DefectReport[]) => {
      try {
          // Local Only import for now as batch writing all might fail partly or trigger permissions
          const combined = [...newReports.map(r => ({...r, id: `imp_${Date.now()}_${Math.random()}`})), ...reports];
          updateLocal(combined);
          showToast(`Đã import ${newReports.length} phiếu (Offline/Local).`, 'success');
          return true;
      } catch (e) { return false; }
  };

  return {
    reports,
    isLoadingReports,
    saveReport,
    updateReport,
    addComment,
    deleteReport,
    importReports
  };
};
