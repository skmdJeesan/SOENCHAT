// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "chaatgpt-46287.firebaseapp.com",
  projectId: "chaatgpt-46287",
  storageBucket: "chaatgpt-46287.firebasestorage.app",
  messagingSenderId: "403428992694",
  appId: "1:403428992694:web:66f6d658723c30cf136817"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()