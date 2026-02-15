import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
   apiKey: "AIzaSyDShkPPYl34U2X2eK1HZBGbOIe4-qEPROk",
  authDomain: "hackathon-final-dashboard.firebaseapp.com",
  projectId: "hackathon-final-dashboard",
  storageBucket: "hackathon-final-dashboard.firebasestorage.app",
  messagingSenderId: "34664018580",
  appId: "1:34664018580:web:ea4c872c73c7cd59c17a81",
  measurementId: "G-H3LET2Q6L2"
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;