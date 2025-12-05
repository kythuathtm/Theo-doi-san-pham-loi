
// @ts-ignore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// QUAN TRỌNG: Thay thế thông tin bên dưới bằng thông tin từ Firebase Console của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDeqjEcX4eEvl-2FBhY4mCTx7zmMVl55vE",
  authDomain: "ykkhclsp.firebaseapp.com",
  projectId: "ykkhclsp",
  storageBucket: "ykkhclsp.firebasestorage.app",
  messagingSenderId: "123816810828",
  appId: "1:123816810828:web:7d7b52ebe943cbf17e17e9",
  measurementId: "G-PP20K8JT03"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
