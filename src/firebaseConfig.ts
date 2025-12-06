// Import the functions you need from the SDKs you need
import * as firebaseApp from "firebase/app";
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
// Fix: Use namespace import and cast to any to resolve "no exported member" error in some environments
export const app = (firebaseApp as any).initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app); // <-- Thêm dòng này để kết nối với Firestore

// Bây giờ bạn có thể sử dụng biến 'db' để tương tác với cơ sở dữ liệu Firestore của mình
console.log("Firebase Analytics và Firestore đã được kết nối thành công!", app, analytics, db);