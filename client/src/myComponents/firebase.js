import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVcXtCSWHxEaA9_raDrVGBfDN9uIRE6f0",
  authDomain: "expensetracker-4495e.firebaseapp.com",
  projectId: "expensetracker-4495e",
  storageBucket: "expensetracker-4495e.firebasestorage.app",
  messagingSenderId: "507527995411",
  appId: "1:507527995411:web:913f52b752f21276969fe6",
  measurementId: "G-CFHTFQ57JF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
export const auth=getAuth();
export const db=getFirestore(app)



