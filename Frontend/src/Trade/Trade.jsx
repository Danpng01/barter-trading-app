import React, { useState, useEffect } from 'react';
import { db } from '../Firebase.js';
import { doc, getDoc, collection, updateDoc, arrayRemove, writeBatch, addDoc, arrayUnion, Timestamp, serverTimestamp } from 'firebase/firestore';
import TradeCard from './TradeCard.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Trade.css';
import SelectionModal from './SelectionModal.jsx';
import { useChat } from '../Auth/UserChatContext.jsx';
import { v4 as uuid } from "uuid";
import emailjs from '@emailjs/browser';
import ItemList from './ItemList.jsx';

emailjs.init('xAm24KSJQGlL0MU9b'); // Initialize emailjs

function Trade({ ownerId, currentUser, ownerItems, currentUserItems, ownerName, currentUserName}) {
  const [showModal, setShowModal] = useState(false);
  const [modalUserId, setModalUserId] = useState(null);
  const [ownerEmail, setOwnerEmail]  = useState('');
  const { data } = useChat();

  useEffect(() => {
    async function fetchData() {
      try {
        const userRef = doc(db, 'user_info', ownerId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setOwnerEmail(docSnap.data().email);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching owner email: ", error);
      }
    }

    fetchData();
  }, [ownerId]);

  const handleAddItemClick = async (userId) => {
    setShowModal(true);
    setModalUserId(userId);
  };
  
  const handleModalClose = () => {
    setShowModal(false);
  }

  const handleItemSelect = (item) => {
    addItem(modalUserId, item);
    if (modalUserId === currentUser.uid) {
      addSelectedItem({ item, setFunction: setStaySelectItems });
    } else {
      addSelectedItem({ item, setFunction: setStayOwnerSelectItems });
    }
  };

  const proposeAnOffer = async () => {
    const chatId = data.chatId;
    const text = "An offer has been proposed";
    const senderId = currentUser.uid;

    try {
      await updateDoc(doc(db, "user_chat_messages", chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId,
          date: Timestamp.now(),
        }),
      });

      await updateDoc(doc(db, "user_chats", currentUser.uid), {
        [chatId + ".lastMessage"]: {
          text,
        },
        [chatId + ".date"]: serverTimestamp(),
      });

      await updateDoc(doc(db, "user_chats", ownerId), {
        [chatId + ".lastMessage"]: {
          text,
        },
        [chatId + ".date"]: serverTimestamp(),
      });

    } catch (error) {
      console.error('Error sending offer message: ', error);
    }
  };

  const finalizeTradeClick = async (e) => {
    e.preventDefault();
    try {
      await addToCompletedTransactions();
      await removeItemsFromCardDb(); /* also reloads page */
      await updateUsersInfo();
      await updateChatMessageList(ownerId);
      await sendEmailNotifications();
      alert("Deal has been completed");
    } catch (error) {
      alert('Error during trade finalization: ' + error.message);
    }
  };

  const addToCompletedTransactions = async () => {
    try {
      const ownerIdItemDetails = await getItemsDetails(ownerItems);
      const myItemDetails = await getItemsDetails(currentUserItems);
      const docRef = await addDoc(collection(db, 'completed_transactions'), {
        User1ID: ownerId,
        user1_itemlist: ownerIdItemDetails,
        User2ID: currentUser.uid,
        User2_itemlist: myItemDetails,
      });
    } catch (error) {
      throw new Error('Error updating completed_transactions: ' + error.message);
    }
  };

  const getItemsDetails = async (items) => {
    const itemDetails = [];
    for (const itemId of items) {
      const itemDoc = await getDoc(doc(db, 'card_items', itemId));
      if (itemDoc.exists()) {
        itemDetails.push(itemDoc.data());
      } else {
        console.warn(`Item with ID ${itemId} does not exist`);
      }
    }
    return itemDetails;
  };

  const removeItemsFromCardDb = async () => {
    try {
      const batch = writeBatch(db);
      for (const itemId of ownerItems) {
        const itemRef = doc(db, 'card_items', itemId);
        batch.delete(itemRef);
      }
      for (const itemId of currentUserItems) {
        const itemRef = doc(db, 'card_items', itemId);
        batch.delete(itemRef);
      }
      await batch.commit();
    } catch (error) {
      throw new Error('Error updating card_items: ' + error.message);
    }
  };

  /* double check the sequence for owner items etc */

  const updateUsersInfo = async () => {
    try {
      console.log("Fetching user info documents...");
      const myUserInfoDoc = await getDoc(doc(db, 'user_info', currentUser.uid));
      const otherUserInfoDoc = await getDoc(doc(db, 'user_info', ownerId));
  
      if (!myUserInfoDoc.exists() || !otherUserInfoDoc.exists()) {
        throw new Error('One or both user info documents do not exist.');
      }
  
      const myUserInfo = myUserInfoDoc.data();
      const otherUserInfo = otherUserInfoDoc.data();
  
      // Assuming currentUserItems is an array of item identifiers
      const keysToRemove = currentUserItems;  // Use the array directly
      const updatedOwnedList = myUserInfo.owned_list.filter(item => {return !keysToRemove.includes(item);});
      const updatedWishList = myUserInfo.wishlist.filter(item => {return !keysToRemove.includes(item);});

      await updateDoc(doc(db, 'user_info', currentUser.uid), {
        numberOfCompletedTransactions: myUserInfo.numberOfCompletedTransactions + 1,
        owned_list: updatedOwnedList,
        wishlist: updatedWishList
      });

      const otherKeysToRemove = ownerItems;  // Use the array directly
      const otherUpdatedOwnedList = otherUserInfo.owned_list.filter(item => {return !otherKeysToRemove.includes(item);});
      const otherUpdatedWishList = otherUserInfo.wishlist.filter(item => {return !keysToRemove.includes(item);});

      await updateDoc(doc(db, 'user_info', ownerId), {
        numberOfCompletedTransactions: otherUserInfo.numberOfCompletedTransactions + 1 ,
        owned_list: otherUpdatedOwnedList,
        wishlist: otherUpdatedWishList
      });

    } catch (error) {
      console.error('Error updating user info:', error);
      throw new Error('Error updating user info: ' + error.message);
    }
  };  

  const updateChatMessageList = async (ownerId) => {
    try {
      const combinedId = currentUser.uid > ownerId ? currentUser.uid + ownerId : ownerId + currentUser.uid;
      await updateDoc(doc(db, 'user_chat_messages', combinedId), {
        [`${currentUser.uid}_items`]: [],
        [`${ownerId}_items`]: [],
      });
    } catch (error) {
      throw new Error('Error updating updateChatMessageList: ' + error.message);
    }
  };  

  const sendEmailNotifications = async () => {
    const templateParams = {
      owner_name: ownerName,
      current_user_name: currentUserName,
      owner_email: ownerEmail,
      current_user_email: currentUser.email,
      message: 'The trade has been successfully completed.',
    };

    try {
      await emailjs.send(
        'service_eas9lyc',
        'template_rqt99xv',
        templateParams,
        'xAm24KSJQGlL0MU9b',
      );
    } catch (error) {
      console.error('Error sending emails: ', error);
    }
  };

  return (
    <div className="trade-container my-5">
      <strong className="text-center mb-4">Trade Details</strong>

      <div className="row"> {/* makes them side by side */}
        <div className="col-md-6 mb-4 pe-0 ps-4 left-side-trades">
          <p className="text-center mb-2">
            Items from <span style={{ color: '#007bff', fontWeight: 'bold' }}>{ownerName}</span>
          </p>
          <div className="d-flex align-items-center justify-content-between horizontal-container">
            <div className="div-wrap-left-trade">
              <ItemList userId={ownerId} ownerId={ownerId} currentUser={currentUser} />
            </div>
            <button className="add-card-button owner-button me-1 ms-1" onClick={() => handleAddItemClick(ownerId)}>+</button>
          </div>
        </div>
        <div className="col-md-6 right-side-trades">
          <p className="text-center mb-2">
            Items from <span style={{ color: '#5f9079', fontWeight: 'bold' }}>{currentUserName}</span>
          </p>
          <div className="d-flex align-items-center justify-content-between horizontal-container">
            <div className="div-wrap-right-trade">
              <ItemList userId={currentUser.uid} ownerId={ownerId} currentUser={currentUser} />
            </div>
            <button className="add-card-button curruser-button me-1 ms-1" onClick={() => handleAddItemClick(currentUser.uid)}>+</button>
          </div>
        </div>
      </div>

      <div className="trade-button-container mt-0 d-flex justify-content-center">
        <button className="trade-button" onClick={proposeAnOffer}>Propose Offer</button>
        <button className="trade-button" onClick={finalizeTradeClick}>Complete Deal</button>
      </div>

      {showModal && (
        <SelectionModal
          show={showModal}
          handleClose={handleModalClose}
          handleItemSelect={(item) => handleItemSelect(item)}
          modalUserId={modalUserId}
          currentUserId = {currentUser.uid}
          ownerId={ownerId}
          ownerSelectedItems={ownerItems}
          CurrUserSelectedItems={currentUserItems}
        />
      )}
    </div>

    
  );
}

export default Trade;
