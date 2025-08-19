import React, { useState, useEffect } from 'react';
import { db } from '../Firebase.js'; // Ensure this path points to your Firebase config
import { doc, onSnapshot } from 'firebase/firestore';
import TradeCard from './TradeCard.jsx'; // Ensure this path points to your TradeCard component
import { useChat } from '../Auth/UserChatContext.jsx';

const ItemList = ({ userId, ownerId, currentUser }) => {
  const [itemIds, setItemIds] = useState([]);
  const { data } = useChat();

  useEffect(() => {
    if (!userId) return;

    // Reference to the Firestore document
    const combinedId = currentUser.uid > ownerId ? currentUser.uid + ownerId : ownerId + currentUser.uid;
    const docRef = doc(db, 'user_chat_messages', combinedId);

    // Set up the snapshot listener
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const userItemsId = `${userId}_items`;
            const selectedItems = docSnapshot.data()[userItemsId] || [];
            if (Array.isArray(selectedItems)) {
                setItemIds(selectedItems);
            } else {
                setItemIds([]);
            }
        } else {
            setItemIds([]);
        }
    });

    return () => unsubscribe();
    }, [data.chatId]);

  return (
    <div className="d-flex flex-row overflow-auto" style={{ whiteSpace: 'nowrap' }}>
        {itemIds.length > 0 ? (
            itemIds.map((itemId) => (
                <div className="me-3" key={itemId} style={{ display: 'inline-block' }}>
                    <TradeCard itemId={itemId} showSelectionButton={false} currentUserId={currentUser.uid} ownerID={ownerId} />
                </div>
            ))
            ) : (
            <div>No items available.</div>
        )}
    </div>
  );
};

export default ItemList;
