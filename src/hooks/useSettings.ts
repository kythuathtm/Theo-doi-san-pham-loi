
import { useState, useEffect } from 'react';
import { RoleSettings, SystemSettings, UserRole, ToastType } from '../types';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';

const DEFAULT_ROLE_SETTINGS: RoleSettings = {
    [UserRole.Admin]: { canCreate: true, canViewDashboard: true, canDelete: true, viewableDefectTypes: ['All'], editableFields: ['general', 'soLuongDoi', 'loaiLoi', 'nguyenNhan', 'huongKhacPhuc', 'trangThai', 'ngayHoanThanh'] },
    [UserRole.KyThuat]: { canCreate: true, canViewDashboard: true, canDelete: true, viewableDefectTypes: ['All'], editableFields: ['general', 'soLuongDoi', 'loaiLoi', 'nguyenNhan', 'huongKhacPhuc', 'trangThai', 'ngayHoanThanh'] },
    [UserRole.CungUng]: { canCreate: false, canViewDashboard: true, canDelete: false, viewableDefectTypes: ['All'], editableFields: ['general', 'loaiLoi', 'trangThai'] },
    [UserRole.TongGiamDoc]: { canCreate: false, canViewDashboard: true, canDelete: false, viewableDefectTypes: ['All'], editableFields: [] },
    [UserRole.SanXuat]: { canCreate: false, canViewDashboard: false, canDelete: false, viewableDefectTypes: ['Lỗi Sản xuất', 'Lỗi Hỗn hợp'], editableFields: ['nguyenNhan', 'huongKhacPhuc'] },
    [UserRole.Kho]: { canCreate: false, canViewDashboard: false, canDelete: false, viewableDefectTypes: ['All'], editableFields: [] },
};

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  appName: 'THEO DÕI XỬ LÝ KHIẾU NẠI CHẤT LƯỢNG SẢN PHẨM',
  companyName: 'CÔNG TY CỔ PHẦN VẬT TƯ Y TẾ HỒNG THIỆN MỸ',
  logoUrl: '',
  backgroundType: 'default',
  backgroundValue: '',
  fontFamily: "'Inter', sans-serif",
  baseFontSize: '15px',
  headerBackgroundColor: 'rgba(255, 255, 255, 0.9)',
  headerTextColor: '#0f172a'
};

const LS_ROLE_SETTINGS = 'app_role_settings';
const LS_SYSTEM_SETTINGS = 'app_system_settings';

export const useSettings = (showToast: (msg: string, type: ToastType) => void) => {
  const [roleSettings, setRoleSettings] = useState<RoleSettings>(() => {
      try {
          const saved = localStorage.getItem(LS_ROLE_SETTINGS);
          return saved ? JSON.parse(saved) : DEFAULT_ROLE_SETTINGS;
      } catch { return DEFAULT_ROLE_SETTINGS; }
  });
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
      try {
          const saved = localStorage.getItem(LS_SYSTEM_SETTINGS);
          return saved ? { ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SYSTEM_SETTINGS;
      } catch { return DEFAULT_SYSTEM_SETTINGS; }
  });

  // Listen to SETTINGS
  useEffect(() => {
    let unsubscribe = () => {};
    try {
        unsubscribe = onSnapshot(collection(db, "settings"), 
            (snapshot) => {
                if (!snapshot.empty) {
                    const roleDoc = snapshot.docs.find(d => d.id === 'roleSettings');
                    if (roleDoc) {
                        const data = roleDoc.data() as RoleSettings;
                        setRoleSettings(data);
                        localStorage.setItem(LS_ROLE_SETTINGS, JSON.stringify(data));
                    }
                    const systemDoc = snapshot.docs.find(d => d.id === 'systemSettings');
                    if (systemDoc) {
                        const data = { ...DEFAULT_SYSTEM_SETTINGS, ...systemDoc.data() as SystemSettings };
                        setSystemSettings(data);
                        localStorage.setItem(LS_SYSTEM_SETTINGS, JSON.stringify(data));
                    }
                }
            },
            (error) => {
                console.warn("Settings: Firestore unavailable (permissions/network). Using local storage.");
            }
        );
    } catch (e) {
        console.warn("Settings: Firebase Error:", e);
    }
    return () => unsubscribe();
  }, []);

  const saveRoleSettings = async (newSettings: RoleSettings) => {
      try {
          setRoleSettings(newSettings);
          localStorage.setItem(LS_ROLE_SETTINGS, JSON.stringify(newSettings));
          
          await setDoc(doc(db, "settings", "roleSettings"), newSettings);
          showToast('Cập nhật phân quyền thành công.', 'success');
      } catch (error) {
          console.warn("Offline save: roleSettings");
          showToast('Đã lưu cài đặt (Chế độ Offline).', 'info');
      }
  };

  const saveSystemSettings = async (newSettings: SystemSettings) => {
      try {
          setSystemSettings(newSettings);
          localStorage.setItem(LS_SYSTEM_SETTINGS, JSON.stringify(newSettings));

          await setDoc(doc(db, "settings", "systemSettings"), newSettings);
          showToast('Cập nhật cấu hình hệ thống thành công.', 'success');
      } catch (error) {
          console.warn("Offline save: systemSettings");
          showToast('Đã lưu cấu hình (Chế độ Offline).', 'info');
      }
  };

  const renameRole = async (oldName: string, newName: string) => {
      // Local update mainly, Firebase update best effort
      try {
          const q = query(collection(db, "users"), where("role", "==", oldName));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
              const batch = writeBatch(db);
              snapshot.docs.forEach(doc => {
                  batch.update(doc.ref, { role: newName });
              });
              await batch.commit();
              showToast(`Đã đồng bộ vai trò mới cho ${snapshot.size} tài khoản.`, 'success');
          }
      } catch (error) {
          console.warn("Rename Role: Firestore unavailable. Update manually in user management.");
          // We don't show error toast to avoid blocking user flow
      }
  };

  return {
    roleSettings,
    systemSettings,
    saveRoleSettings,
    saveSystemSettings,
    renameRole
  };
};
