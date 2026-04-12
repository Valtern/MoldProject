// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAqTvLjbLeiFKWU039mMYR9ucJVCqkkC9A",
    authDomain: "moldymoldbase.firebaseapp.com",
    projectId: "moldymoldbase",
    storageBucket: "moldymoldbase.firebasestorage.app",
    messagingSenderId: "54731132506",
    appId: "1:54731132506:web:7ba3446e7be899edcbd263",
    measurementId: "G-0YZBDJSZDM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };