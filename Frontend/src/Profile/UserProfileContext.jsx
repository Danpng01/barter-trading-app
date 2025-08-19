import React, { useContext, useState, useEffect } from "react";
import { auth } from "../Firebase";

const UserProfileContext = React.createContext();

export function useUserProfile() {
    return useContext(UserProfileContext);
}

export function UserProfileProvider({ children }) {
    const [userProfile, setUserProfile] = useState({
        username: '',
        email: '',
        profilePic: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                getUserProfile(user.uid).then(profile => {
                    setUserProfile(profile);
                    setLoading(false);
                });
            } else {
                setUserProfile({
                    username: '',
                    email: '',
                    profilePic: ''
                });
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        userProfile,
        setUserProfile,
    };

    return (
        <UserProfileContext.Provider value={value}>
            {!loading && children}
        </UserProfileContext.Provider>
    );
}
