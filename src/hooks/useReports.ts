
import { useState, useEffect } from 'react';
import { DefectReport, ToastType, ActivityLog } from '../types';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, deleteDoc, writeBatch, arrayUnion } from 'firebase/firestore';

// Helper function to remove undefined values before sending to Firestore
// Firestore crashes if a field is explicitly undefined
const cleanData = (data: any): any => {
    if (data instanceof Date) return data; // Preserve Date objects
    if (Array.isArray(data)) {
        return data.map(cleanData);
    } else if (data !== null && typeof data === 'object') {
        return Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = cleanData(value);
            }
            return acc;
        }, {} as any);
    }
    return data;
};

export const useReports = (showToast: (msg: string, type: ToastType) => void) => {
  const [reports, setReports] = useState<DefectReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Listen to REPORTS
  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("ngayTao", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DefectReport[];
      setReports(reportsData);
      setIsLoadingReports(false);
    }, (error) => {
      console.error("Error fetching reports:", error);
      showToast('Không thể tải dữ liệu báo cáo.', 'error');
      setIsLoadingReports(false);
    });
    return () => unsubscribe();
  }, []);

  const saveReport = async (report: DefectReport, isEditing: boolean) => {
    try {
        if (isEditing && report.id && !report.id.startsWith('new_')) {
            // Update existing
            const reportRef = doc(db, "reports", report.id);
            const { id, ...data } = report;
            const cleanedData = cleanData(data);
            await updateDoc(reportRef, cleanedData);
            showToast('Cập nhật báo cáo thành công!', 'success');
        } else {
            // Create new
            const { id, ...data } = report;
            const newReportData = {
                ...data,
                ngayTao: new Date().toISOString(),
                activityLog: [] // Initialize empty log
            };
            const cleanedData = cleanData(newReportData);
            await addDoc(collection(db, "reports"), cleanedData);
            showToast('Tạo báo cáo mới thành công!', 'success');
        }
        return true;
    } catch (error) {
        console.error("Error saving report:", error);
        showToast('Lỗi khi lưu báo cáo (Chi tiết trong Console)', 'error');
        return false;
    }
  };

  const updateReport = async (id: string, updates: Partial<DefectReport>, successMessage: string = 'Cập nhật báo cáo thành công!', user?: { username: string, role: string }) => {
      try {
          const reportRef = doc(db, "reports", id);
          
          const payload: any = { ...updates };

          // Auto-generate activity log if user info is provided
          if (user) {
              const logs: ActivityLog[] = [];
              const timestamp = new Date().toISOString();
              
              if (updates.trangThai) {
                  logs.push({
                      id: `log_${Date.now()}_status`,
                      type: 'log',
                      content: `Đã thay đổi trạng thái thành: ${updates.trangThai}`,
                      timestamp,
                      user: user.username,
                      role: user.role
                  });
              }
              if (updates.nguyenNhan || updates.huongKhacPhuc) {
                   logs.push({
                      id: `log_${Date.now()}_info`,
                      type: 'log',
                      content: `Đã cập nhật thông tin xử lý (Nguyên nhân/Khắc phục)`,
                      timestamp,
                      user: user.username,
                      role: user.role
                  });
              }
              
              if (logs.length > 0) {
                  payload.activityLog = arrayUnion(...logs);
              }
          }

          const cleanedPayload = cleanData(payload);
          await updateDoc(reportRef, cleanedPayload);
          showToast(successMessage, 'success');
          return true;
      } catch (error) {
          console.error("Error updating report:", error);
          showToast('Lỗi khi cập nhật báo cáo', 'error');
          return false;
      }
  };

  const updateMultipleReports = async (ids: string[], updates: Partial<DefectReport>, user?: { username: string, role: string }) => {
      try {
          const batch = writeBatch(db);
          
          // Prepare log if needed
          let logEntry: ActivityLog | null = null;
          if (user && updates.trangThai) {
              logEntry = {
                  id: `log_${Date.now()}_bulk`,
                  type: 'log',
                  content: `[Hàng loạt] Đã thay đổi trạng thái thành: ${updates.trangThai}`,
                  timestamp: new Date().toISOString(),
                  user: user.username,
                  role: user.role
              };
          }

          const payload: any = { ...updates };
          if (logEntry) {
              payload.activityLog = arrayUnion(logEntry);
          }
          const cleanedPayload = cleanData(payload);

          ids.forEach(id => {
              const ref = doc(db, "reports", id);
              batch.update(ref, cleanedPayload);
          });

          await batch.commit();
          showToast(`Đã cập nhật ${ids.length} báo cáo.`, 'success');
          return true;
      } catch (error) {
          console.error("Batch update error:", error);
          showToast("Lỗi khi cập nhật hàng loạt", "error");
          return false;
      }
  };

  const addComment = async (reportId: string, content: string, user: { username: string, role: string }) => {
      try {
          const reportRef = doc(db, "reports", reportId);
          const newComment: ActivityLog = {
              id: `cmt_${Date.now()}`,
              type: 'comment',
              content: content,
              timestamp: new Date().toISOString(),
              user: user.username,
              role: user.role
          };
          
          // No need to cleanData for arrayUnion usually, but safe to keep object pure
          await updateDoc(reportRef, {
              activityLog: arrayUnion(newComment)
          });
          return true;
      } catch (error) {
          console.error("Error adding comment:", error);
          showToast('Lỗi khi gửi bình luận', 'error');
          return false;
      }
  };

  const deleteReport = async (id: string) => {
    try {
        await deleteDoc(doc(db, "reports", id));
        showToast('Đã xóa báo cáo.', 'info');
        return true;
    } catch (error) {
        console.error("Error deleting:", error);
        showToast('Lỗi khi xóa', 'error');
        return false;
    }
  };

  const deleteMultipleReports = async (ids: string[]) => {
      try {
          const batch = writeBatch(db);
          ids.forEach(id => {
              const ref = doc(db, "reports", id);
              batch.delete(ref);
          });
          await batch.commit();
          showToast(`Đã xóa ${ids.length} báo cáo.`, 'success');
          return true;
      } catch (error) {
          console.error("Batch delete error:", error);
          showToast("Lỗi khi xóa hàng loạt", "error");
          return false;
      }
  }

  return {
    reports,
    isLoadingReports,
    saveReport,
    updateReport,
    updateMultipleReports,
    addComment,
    deleteReport,
    deleteMultipleReports
  };
};
