// contexts/BarteringItemsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../Firebase.js';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../Auth/AuthContext.jsx';

const BarteringItemsContext = createContext();

export const useBarteringItems = () => useContext(BarteringItemsContext);

export const BarteringItemsProvider = ({ children }) => {
    const [barteringItems, setBarteringItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currUserItems, setCurrUserItems] = useState([]);
    const { currentUser } = useAuth(); 

    useEffect(() => {
        const fetchBarteringItems = async () => {
            try {
                const barteringItemsCollection = collection(db, 'card_items');
                const barteringItemsSnapshot = await getDocs(barteringItemsCollection);
                const barteringItemsData = barteringItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                if (currentUser) {
                    const filteredItems = barteringItemsData.filter(item => item.owner_id !== currentUser.uid);
                    const userItems = barteringItemsData.filter(item => item.owner_id === currentUser.uid);
                    setBarteringItems(filteredItems);
                    setCurrUserItems(userItems); // Assuming you have state for user items
                } else {
                    setBarteringItems(barteringItemsData);
                }
            } catch (error) {
                console.error("Error fetching bartering items: ", error);
            }
        };
    
        fetchBarteringItems(); // Call fetchBarteringItems immediately
    
        // No need to return a cleanup function here since you want to fetch items initially
    }, [currentUser]); // Dependency array includes currentUser
    
    const handleSearch = (query) => {
        const cleanQuery = query.replace(/\s+/g, '').toLowerCase();
        setBarteringItems(
            barteringItems.filter(item =>
                (item.name && item.name.toLowerCase().includes(cleanQuery)) ||
                (item.description && item.description.toLowerCase().includes(cleanQuery))  ||
                (item.category && item.category.toLowerCase().includes(cleanQuery))
            )
        );
    };

    const handleWishlistSearch = async () => {
        const userRef = doc(db, 'user_info', currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (currentUser && docSnap.exists()) {
            const wishlist = (docSnap.data().wishlist || []);

            setBarteringItems(
                barteringItems.filter(item => {
                    return wishlist.includes(item.id);
                })
            );
        } else {
        console.log("No wishlist found for the current user.");
        }
    };

    /* error lies here for wishlist */
    const generateWishlist = async ({ setFunction }) => {
        /* get the databse using uid from db */
        const userRef = doc(db, 'user_info', currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (currentUser && docSnap.exists()) {
            const wishlist = (docSnap.data().wishlist || []);

            setFunction(
                barteringItems.filter(item => {
                    return wishlist.includes(item.id);
                })
            );
        } else {
        console.log("No wishlist found for the current user."); // Debugging log
        }
    };

    const value = {
        barteringItems,
        handleSearch,
        searchQuery,
        setSearchQuery,
        handleWishlistSearch,
        generateWishlist,
        currUserItems,
    }

    return (
        <BarteringItemsContext.Provider value={value}>
            {children}
        </BarteringItemsContext.Provider>
    );
};
