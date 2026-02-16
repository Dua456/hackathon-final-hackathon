import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, fullName, role = 'participant') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user profile to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      fullName: fullName,
      email: email,
      role: role,
      createdAt: new Date()
    });

    return userCredential;
  };

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);

    // Get user data from Firestore after login
    if (result.user) {
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUserData(userData);
      }
    }

    return result;
  };

  const logout = () => {
    return signOut(auth);
  };

  const googleLogin = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user exists in Firestore, if not create with default role
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        fullName: result.user.displayName,
        email: result.user.email,
        role: 'participant', // Default role
        createdAt: new Date()
      });
    } else {
      setCurrentUserData(userDoc.data());
    }
    
    return result;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUserData(userDoc.data());
        }
      } else {
        setCurrentUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const waitForUserData = () => {
    return new Promise((resolve) => {
      const checkUserData = () => {
        if (currentUserData) {
          resolve();
        } else {
          setTimeout(checkUserData, 50);
        }
      };
      checkUserData();
    });
  };

  const value = {
    currentUser,
    currentUserData,
    login,
    signup,
    logout,
    googleLogin,
    isAdmin: currentUserData?.role === 'admin' || currentUser?.email?.includes('admin'),
    waitForUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};