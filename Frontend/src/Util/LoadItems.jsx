import React, { useEffect, useContext } from 'react'

const ItemContext = React.createContext();

export function useAuth() {
    return useContext(ItemContext);
}

export default function LoadItems() {

    const [wishlistItems, setWishlistItems] = useState([]);
    const [barteringItems, setBarteringItems] = useState([]);
  
    useEffect(() => {
      const fetchWishlistItems = async () => {
        try {
          const wishlistItemsCollection = collection(db, 'card_items'); // Adjust collection name for wishlist
          const wishlistItemsSnapshot = await getDocs(wishlistItemsCollection);
          const wishlistItemsData = wishlistItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setWishlistItems(wishlistItemsData);
        } catch (error) {
          console.error("Error fetching wishlist items: ", error);
        }
      };
  
      const fetchBarteringItems = async () => {
        try {
          const barteringItemsCollection = collection(db, 'card_items'); // Adjust collection name for bartering
          const barteringItemsSnapshot = await getDocs(barteringItemsCollection);
          const barteringItemsData = barteringItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBarteringItems(barteringItemsData);
        } catch (error) {
          console.error("Error fetching bartering items: ", error);
        }
      };
  
      fetchWishlistItems();
      fetchBarteringItems();
    }, []);
}
