import React, { useState, useEffect } from 'react';
import { ChatInputpanel } from './ChatInputpanel.jsx';
import './ChatMessages.css';
import MessageBlock from './MessageBlock.jsx';
import Trade from '../Trade/Trade.jsx';
import { useChat } from '../Auth/UserChatContext.jsx';
import { db } from '../Firebase.js';
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import defaultPic from '../assets/defaultProfilePic.png';

/* This code accesses the Firebase to pull the messages and the card information */

const ChatMessages = ({ ownerId, itemId, currentUser }) => {
  const { data } = useChat();
  const [messages, setMessages] = useState([]);
  const [ownerItems, setOwnerItems] = useState({});
  const [currentUserItems, setCurrentUserItems] = useState({});
  const [ownerName, setOwnerName] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "user_chat_messages", data.chatId), async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const messagesData = docSnapshot.data().messages;
        setMessages(messagesData);

        // Update unread messages to be read
        const updatedMessages = messagesData.map(message => {
          if (message.read === false && message.senderId !== currentUser.uid) {
            return { ...message, read: true };
          }
          return message;
        });

        // Only update Firestore if there are changes
        if (JSON.stringify(messagesData) !== JSON.stringify(updatedMessages)) {
          const docRef = doc(db, 'user_chat_messages', data.chatId);
          await updateDoc(docRef, { messages: updatedMessages });
        }
      }
    });

    return () => unSub();
  }, [data.chatId, currentUser.uid]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const ownerDoc = await getDoc(doc(db, "user_chat_messages", data.chatId));

        if (ownerDoc.exists()) {
          let itemOwner = ownerDoc.data()[`${ownerId}_items`] || [];
          let itemCurrUser = ownerDoc.data()[`${currentUser.uid}_items`] || [];

          // Function to check if an item exists in card_info
          const checkItemExists = async (itemId) => {
            const itemDoc = await getDoc(doc(db, "card_info", itemId));
            return itemDoc.exists();
          };

          itemOwner = await Promise.all(
            itemOwner.filter(async (item) => await checkItemExists(item))
          );
          itemCurrUser = await Promise.all(
            itemCurrUser.filter(async (item) => await checkItemExists(item))
          );


          setOwnerItems(itemOwner);
          setCurrentUserItems(itemCurrUser);
        }
      } catch (error) {
        console.log("Error fetching items: ", error);
      }
    };
  
    fetchItems();
  }, [currentUser.uid, ownerId]);

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const ownerInfoDoc = await getDoc(doc(db, "user_info", ownerId));
        const currentUserInfoDoc = await getDoc(doc(db, "user_info", currentUser.uid));

        if (ownerInfoDoc.exists()) {
          setOwnerName(ownerInfoDoc.data().name || ownerInfoDoc.data().email);
        }

        if (currentUserInfoDoc.exists()) {
          setCurrentUserName(currentUserInfoDoc.data().name || currentUserInfoDoc.data().email);
        }
      } catch (error) {
        console.log("Error fetching user names: ", error);
      }
    };

    fetchUserNames();
  }, [ownerId, currentUser.uid]);

  return (
    <div className="p-0 chat-messages-container">

      <div className="header-panel d-flex align-items-center">
        <img
          src={data.user?.profile_pic || defaultPic}
          className="rounded-circle p-0 m-2"
          style={{ width: '60px', height: '60px' }}
        />
        <div className="center-text">
          {data.user.name !== "" ? data.user.name : data.user.email}
        </div>
      </div>

      {/* The trade component with item lists and user names passed as props */}
      <Trade 
        className="trade-panel" 
        ownerId={ownerId} 
        currentUser={currentUser} 
        ownerItems={ownerItems} 
        currentUserItems={currentUserItems} 
        ownerName={ownerName}
        currentUserName={currentUserName}
      />

      {/* The messages component */}
      <div className="messages">
        {messages.map((message) => (
          <MessageBlock message={message} key={message.id} />
        ))}
      </div>
      
      <ChatInputpanel className="chat-inputpanel" />

    </div>
  );
};

export default ChatMessages;