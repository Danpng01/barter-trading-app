import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeCardBlock.css'; // Assuming you have a CSS file for styling the cards
import { db } from '../Firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../Auth/AuthContext.jsx';
import Heart from "react-heart";
import defaultPic from '../assets/defaultProfilePic.png';
import ItemDetailsModal from '../Card/ItemDetailsModal.jsx';

const HomeCardBlock = ({ item }) => {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPic, setOwnerPic] = useState(defaultPic);
  const [showItemModal, setshowItemModal] = useState(false);
  const { currentUser } = useAuth();

  const checkWishlistStatus = async () => {
    const userRef = doc(db, 'user_info', currentUser.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const wishlist = docSnap.data().wishlist || [];
      setIsClicked(wishlist.includes(item.id));
    } else {
      console.log("No such document!");
    }
  };

  const fetchOwnerInfo = async () => {
    const userRef = doc(db, 'user_info', item.owner_id);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      setOwnerName(docSnap.data().name);
      setOwnerEmail(docSnap.data().email);
      setOwnerPic(docSnap.data().profile_pic || defaultPic);
    } else {
      console.log("No such user!");
    }
  };

  const handleWishlistClick = async () => {
    const userRef = doc(db, 'user_info', currentUser.uid);
    const docSnap = await getDoc(userRef);
    let wishlist = [];

    if (docSnap.exists()) {
      wishlist = docSnap.data().wishlist || [];
    }

    if (wishlist.includes(item.id)) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(wishlistItemId => wishlistItemId !== item.id);
      await updateDoc(userRef, { wishlist: updatedWishlist });
      setIsClicked(false);
    } else {
      // Add to wishlist
      const updatedWishlist = [...wishlist, item.id];
      await updateDoc(userRef, { wishlist: updatedWishlist });
      setIsClicked(true);
    }
  };

  // Check the wishlist status and fetch owner info initially
  useEffect(() => {
    checkWishlistStatus();
    fetchOwnerInfo();
  }, [item.id, currentUser?.uid, item.owner_id]);

  const handleShowMoreClick = (e) => {
    setshowItemModal(true);
    e.stopPropagation();
    e.preventDefault();
  };

  const handleClose = () => {
    setshowItemModal(false);
  }

  const handleProfileClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${item.owner_id}`);
  }

  return (
    <div onClick={() => !showItemModal && navigate(`/chats/${item.owner_id}/${item.id}`)} className='card-wrapper' style={{ cursor: 'crosshair' }}>

      <div className="card-owner">
        <img 
        src={ownerPic} 
        alt="Profile"
        className="rounded-circle me-2"
        width="40"
        height="40"
        onClick={handleProfileClick}
        style={{ cursor: 'pointer' }}
        />
        <div>
          <h6 className="owner-name" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>{ownerName !== "" ? ownerName : ownerEmail}</h6>
        </div>
      </div>

      <div className="card-image-container">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="card-image" />
        ) : (
          <div className="empty-image">No Image</div>
        )}
      </div>

      <div className="card-title">
        <div style={{ width: '2rem' }} className="">
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
          <p className="truncate-text">Description: {item.description}</p>
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

export default HomeCardBlock;
