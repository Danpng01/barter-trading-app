import React, { useState, useEffect } from 'react';
import './ModalCard.css';
import { db } from '../Firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../Auth/AuthContext.jsx';
import Heart from "react-heart";
import defaultPic from '../assets/defaultProfilePic.png';
import ItemDetailsModal from '../Card/ItemDetailsModal.jsx';

const ModalCard = ({ itemId, showSelectionButton = true, currentUserId, ownerId, isCardSelected, modalUserId }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [item, setItem] = useState(null);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPic, setOwnerPic] = useState(defaultPic);
  const [showItemModal, setShowItemModal] = useState(false);
  const [toggleCard, setToggleCard] = useState(isCardSelected);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!itemId || !currentUser) return;

    const fetchItem = async () => {
      try {
        const itemRef = doc(db, 'card_items', itemId);
        const itemSnap = await getDoc(itemRef);

        if (itemSnap.exists()) {
          const itemData = itemSnap.data();
          setItem(itemData);
          checkWishlistStatus(itemData.id);
          fetchOwnerInfo(itemData.owner_id);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error("Error fetching item: ", error);
      }
    };

    fetchItem();
  }, [itemId, currentUser]);

  const checkWishlistStatus = async (itemId) => {
    try {
      const userRef = doc(db, 'user_info', currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const wishlist = docSnap.data().wishlist || [];
        setIsClicked(wishlist.includes(itemId));
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error checking wishlist status: ", error);
    }
  };

  const fetchOwnerInfo = async (ownerId) => {
    try {
      const userRef = doc(db, 'user_info', ownerId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setOwnerName(userData.name);
        setOwnerPic(userData.profile_pic || ownerPic);
      } else {
        console.log("No such user!");
      }
    } catch (error) {
      console.error("Error fetching owner info: ", error);
    }
  };

  const handleWishlistClick = async () => {
    try {
      const userRef = doc(db, 'user_info', currentUser.uid);
      const docSnap = await getDoc(userRef);
      let wishlist = docSnap.exists() ? docSnap.data().wishlist || [] : [];

      if (wishlist.includes(item.id)) {
        wishlist = wishlist.filter(wishlistItemId => wishlistItemId !== item.id);
        setIsClicked(false);
      } else {
        wishlist = [...wishlist, item.id];
        setIsClicked(true);
      }

      await updateDoc(userRef, { wishlist });
    } catch (error) {
      console.error("Error updating wishlist: ", error);
    }
  };

  const handleSelect = async () => {
    setToggleCard(!toggleCard);
    try {
      const currentUserIdStr = String(currentUserId);
      const ownerIdStr = String(ownerId);
      const itemIdStr = String(itemId);
      const oppositeUserId = currentUserId === modalUserId ? String(item.owner_id) : ownerIdStr;
      const combinedId = currentUserIdStr > ownerId ? currentUserIdStr + ownerId : ownerId + currentUserIdStr;

      const userRef = doc(db, 'user_chat_messages', combinedId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const helperIdKey = `${oppositeUserId}_items`;
        const selectedItems = docSnap.data()[helperIdKey] || [];
        const updatedSelectedItems = selectedItems.includes(itemIdStr) 
          ? selectedItems.filter(id => id !== itemIdStr) 
          : [...selectedItems, itemIdStr];

        await updateDoc(userRef, { [helperIdKey]: updatedSelectedItems });
      } else {
        console.log("No such user chat messages document!");
      }
    } catch (error) {
      console.error("Error selecting item: ", error);
    }
  };

  const handleShowMoreClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowItemModal(true);
  };

  const handleClose = () => {
    setShowItemModal(false);
  };

  if (!item) {
    return null;
  }

  return (
    <div className={`card-wrapper me-3 ${showSelectionButton && toggleCard ? 'selected' : ''}`}>
      <div className="card-owner">
        <img src={ownerPic} alt="Profile" className="rounded-circle me-3" width="40" height="40" />
        <div>
          <h6 className="owner-name pe-2">{ownerName}</h6>
        </div>
        {showSelectionButton && (
          <div className={`tick-box ${toggleCard ? 'selected' : ''}`} onClick={handleSelect}>
            {toggleCard && <span className="tick">&#10003;</span>}
          </div>
        )}
      </div>

      <div className="card-image-container">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="card-image" />
        ) : (
          <div className="empty-image">No Image</div>
        )}
      </div>

      <div className="card-title">
        <div style={{ width: '2rem' }}>
          <Heart 
            isActive={isClicked} 
            onClick={handleWishlistClick}
          />
        </div>
        <span className='item-name-container w-75 ms-3'>{item.name}</span>
      </div>

      <div className="card-description">
        <div className="d-flex justify-content-between">
          <p>{item.condition}</p>
          <a onClick={handleShowMoreClick} className="pe-3">Show more</a>
        </div>
        <div className="d-flex flex-column">
          <p className="truncate-text">{item.pickupLocation}</p>
          <p className="truncate-text limit-div-len">Description: {item.description}</p>
        </div>
      </div>

      <ItemDetailsModal
        show={showItemModal}
        handleClose={handleClose}
        item={item}
      />
    </div>
  );
};

export default ModalCard;
