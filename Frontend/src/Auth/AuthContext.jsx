// AuthContext.jsx
import React, { useContext, useState, useEffect } from "react";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendPasswordResetEmail, 
    onAuthStateChanged, 
    updateEmail as firebaseUpdateEmail, 
    updatePassword as firebaseUpdatePassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification
} from "firebase/auth";
import { auth, db } from '../Firebase.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import defaultPic from '../assets/defaultProfilePic.png';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);
    const [IsAuthenticated, setIsAuthenticated] = useState(false);

    const googleProvider = new GoogleAuthProvider();

    async function addUserInfo(uid, email) {
        try {
            await setDoc(doc(db, 'user_info', uid), {
                uid: uid,
                name: '',
                email: email,
                phone: '',
                profile_picture: defaultPic,
                owned_list: [],
                wishlist: [],
                numberOfCompletedTransactions: 0,
            });
        } catch (error) {
            console.error('Error adding user info: ', error);
        }
    }

    async function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                sendEmailVerification(auth.currentUser).then(() => {
                    // alert("Email verification sent");
                });
                return auth.currentUser;
            });
    }

    async function login(email, password) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        /* if (userCred.user.emailVerified) {
            const userDoc = await getDoc(doc(db, 'user_info', userCred.user.uid));
            if (!userDoc.exists()) {
                await addUserInfo(userCred.user.uid, userCred.user.email);  // Add user info if it doesn't exist
            }
            return userCred;
        } else {
            throw new Error('Email not verified');
        } */

        const userDoc = await getDoc(doc(db, 'user_info', userCred.user.uid));
        if (!userDoc.exists()) {
            await addUserInfo(userCred.user.uid, userCred.user.email);  // Add user info if it doesn't exist
        }
        return userCred;
    }

    function logout() {
        return signOut(auth);
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    function updateEmail(email) {
        return firebaseUpdateEmail(currentUser, email);
    }

    function updatePassword(password) {
        return firebaseUpdatePassword(currentUser, password);
    }

    function loginWithGoogle() {
        return signInWithPopup(auth, googleProvider);
    }

    async function getUserName(user) {
        try {
            const user_doc = await getDoc(doc(db, 'user_info', user.uid));
            const user_info = user_doc.data();
            return user_info;
        } catch (error) {
            console.error("cant fetch user name");
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
            setIsAuthenticated(true);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const value = {
        currentUser,
        IsAuthenticated,
        login,
        signup,
        logout,
        resetPassword,
        updateEmail,
        updatePassword,
        loginWithGoogle,
        addUserInfo,
        getUserName,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
