import React, { useState, useEffect, useMemo } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ModalCard from './ModalCard.jsx';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../Firebase.js';

function SelectionModal({ show, handleClose, handleItemSelect, modalUserId, currentUserId, ownerId, ownerSelectedItems, currUserSelectedItems }) {
  const [itemIds, setItemIds] = useState([]);
  const [combinedItems, setCombinedItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Fetch user info to get the list of item IDs
        const userInfoDoc = await getDoc(doc(db, 'user_info', modalUserId));
        if (userInfoDoc.exists()) {
          const userItems = userInfoDoc.data().owned_list;
          setItemIds(userItems);
        } else {
          console.error('No such document in user_info!');
        }
      } catch (error) {
        console.error('Error fetching items: ', error);
      }
    };

    fetchItems();
  }, [modalUserId]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const combinedId = currentUserId > ownerId ? currentUserId + ownerId : ownerId + currentUserId;
        const ownerDoc = await getDoc(doc(db, "user_chat_messages", combinedId));

        if (ownerDoc.exists()) {
          const itemOwner = ownerDoc.data()[`${ownerId}_items`] || [];
          const itemCurrUser = ownerDoc.data()[`${currentUserId}_items`] || [];
          const combinedArray = [...itemOwner, ...itemCurrUser];
          setCombinedItems(combinedArray);
        }
      } catch (error) {
        console.log("Error fetching items: ", error);
      }
    };
  
    fetchItems();
  }, [currentUserId, ownerId]);

  const handleCloseAndRefresh = () => {
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCloseAndRefresh}>
      <Modal.Header closeButton>
        <Modal.Title>Select an Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-row overflow-auto">
          {itemIds.map((id) => (
            <div key={id}>
              <ModalCard
                itemId={id}
                showSelectionButton={true}
                handleSelect={handleItemSelect}
                currentUserId={currentUserId}
                ownerId={ownerId}
                isCardSelected={combinedItems.includes(id)}
                modalUserId={modalUserId}
              />
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseAndRefresh}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SelectionModal;
