import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjBkK20C1wY5AfFw21QNeCXOGvNpfS2gs",
  authDomain: "cctv-pro.web.app",
  projectId: "cctv-pro",
  storageBucket: "cctv-pro.appspot.com",
  messagingSenderId: "591185484149",
  appId: "1:591185484149:web:63977efd834411c19cdb3c",
  measurementId: "G-Q9P0DB24KR"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

export { app, db, firebaseConfig };
