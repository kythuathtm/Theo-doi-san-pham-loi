
import { useState, useEffect } from 'react';
import { User, UserRole, ToastType } from '../types';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';

const INITIAL_USERS: User[] = [
  { username: 'admin', fullName: 'Quản Trị Viên', role: UserRole.Admin, password: '123' },
  { username: 'kythuat', fullName: 'Nguyễn Văn Kỹ', role: UserRole.KyThuat, password: '123' },
  { username: 'sanxuat', fullName: 'Trần Văn Sản', role: UserRole.SanXuat, password: '123' },
  { username: 'cungung', fullName: 'Lê Thị Cung', role: UserRole.CungUng, password: '123' },
  { username: 'kho', fullName: 'Phạm Văn Kho', role: UserRole.Kho, password: '123' },
  { username: 'tgd', fullName: 'Nguyễn Tổng', role: UserRole.TongGiamDoc, password: '123' },
];

const LS_USERS = 'app_users_data';

export const useAuth = (showToast: (msg: string, type: ToastType) => void) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
      try {
          const saved = localStorage.getItem(LS_USERS);
          return saved ? JSON.parse(saved) : INITIAL_USERS;
      } catch { return INITIAL_USERS; }
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Listen to USERS
  useEffect(() => {
    let unsubscribe = () => {};
    try {
        const usersRef = collection(db, "users");
        unsubscribe = onSnapshot(usersRef, 
            (snapshot) => {
                const usersData = snapshot.docs.map(doc => doc.data()) as User[];
                if (usersData.length > 0) {
                    setUsers(usersData);
                    localStorage.setItem(LS_USERS, JSON.stringify(usersData));
                }
                setIsLoadingUsers(false);
            },
            (error: any) => {
                // Handle Permission Denied gracefully by logging info instead of warning
                if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
                    console.info("Auth: Firestore permission denied. Functioning in offline mode with local users.");
                } else {
                    console.warn("Auth Listener Error (Offline Mode):", error);
                }
                setIsLoadingUsers(false);
            }
        );
    } catch (e) {
        console.warn("Auth: Init failed or offline, using local data.");
        setIsLoadingUsers(false);
    }
    return () => unsubscribe();
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const saveUser = async (user: User, isEdit: boolean) => {
    // Optimistic
    let newUsers = [...users];
    if (isEdit) {
        newUsers = newUsers.map(u => u.username === user.username ? user : u);
    } else {
        if (newUsers.some(u => u.username === user.username)) {
            showToast("Tên đăng nhập đã tồn tại", "error");
            return false;
        }
        newUsers.push(user);
    }
    setUsers(newUsers);
    localStorage.setItem(LS_USERS, JSON.stringify(newUsers));

    try {
        await setDoc(doc(db, "users", user.username), user);
        showToast(isEdit ? 'Cập nhật tài khoản thành công.' : 'Thêm tài khoản mới thành công.', 'success');
        return true;
    } catch (error: any) {
        // Suppress specific offline/permission errors in console
        console.info("Offline save: user (local only)");
        showToast("Đã lưu tài khoản (Offline mode)", "info");
        return true;
    }
  };

  const deleteUser = async (username: string) => {
    // Optimistic
    const newUsers = users.filter(u => u.username !== username);
    setUsers(newUsers);
    localStorage.setItem(LS_USERS, JSON.stringify(newUsers));

    try {
        await deleteDoc(doc(db, "users", username));
        showToast('Đã xóa tài khoản.', 'info');
        return true;
    } catch (error: any) {
        console.info("Offline delete: user (local only)");
        showToast("Đã xóa (Offline mode)", "info");
        return true;
    }
  };

  return {
    currentUser,
    users,
    isLoadingUsers,
    login,
    logout,
    saveUser,
    deleteUser
  };
};
