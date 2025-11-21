
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- HƯỚNG DẪN: ---
// 1. Vào https://console.firebase.google.com/
// 2. Project Settings > General > Your apps > SDK Setup and Configuration
// 3. Copy phần firebaseConfig và dán vào bên dưới

const firebaseConfig = {
  // DÁN MÃ CẤU HÌNH CỦA BẠN VÀO ĐÂY (Thay thế toàn bộ các dòng này)
  apiKey: "AIzaSy...", 
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
