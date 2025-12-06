// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // <-- Thêm dòng này để import Firestore

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeqjEcX4eEvl-2FBhY4mCTx7zmMVl55vE",
  authDomain: "ykkhclsp.firebaseapp.com",
  projectId: "ykkhclsp",
  storageBucket: "ykkhclsp.firebasestorage.app",
  messagingSenderId: "123816810828",
  appId: "1:123816810828:web:7d7b52ebe943cbf17e17e9",
  measurementId: "G-PP20K8JT03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app); // <-- Thêm dòng này để kết nối với Firestore

// Bây giờ bạn có thể sử dụng biến 'db' để tương tác với cơ sở dữ liệu Firestore của mình
console.log("Firebase Analytics và Firestore đã được kết nối thành công!", app, analytics, db);

// Ví dụ nhỏ: Kiểm tra xem Firestore có sẵn sàng để sử dụng không
// console.log("Firestore instance:", db);
