import React, { useState, useEffect } from 'react';
import './TradeCard.css'; // Assuming you have a CSS file for styling the cards
import { db } from '../Firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../Auth/AuthContext.jsx';
import Heart from "react-heart";
import defaultPic from '../assets/defaultProfilePic.png';
import ItemDetailsModal from '../Card/ItemDetailsModal.jsx';

 /* just the design Card, smaller than the rest. dosetn need much functionality */
const TradeCard = ({ itemId, showSelectionButton = false, currentUserId, ownerId}) => {
    const [item, setItem] = useState(null);
    const [isClicked, setIsClicked] = useState(false);
    const [ownerName, setOwnerName] = useState("");
    const [ownerEmail, setOwnerEmail] = useState("");
    const [ownerPic, setOwnerPic] = useState(defaultPic);
    const [showItemModal, setShowItemModal] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
    
        const fetchItem = async () => {
            try {
                const itemRef = doc(db, 'card_items', itemId);
                const itemSnap = await getDoc(itemRef);
    
                if (itemSnap.exists()) {
                    const itemData = itemSnap.data();
                    setItem(itemData);
                    if (currentUser) {
                        checkWishlistStatus(itemData);
                        if (itemData.owner_id) {
                            fetchOwnerInfo(itemData.owner_id);
                        }
                    }
                } 
            } catch (error) {
                console.error("Error fetching item: ", error);
            }
        };
        fetchItem();
    }, [itemId, currentUser]); // Ensure dependencies are correct    

    const checkWishlistStatus = async (item) => {
        const userRef = doc(db, 'user_info', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const wishlist = docSnap.data().wishlist || [];
            setIsClicked(wishlist.includes(item.id));
        } else {
            console.log("No such document!");
        }
    };

    const fetchOwnerInfo = async (ownerId) => {
        const userRef = doc(db, 'user_info', ownerId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            setOwnerName(docSnap.data().name);
            setOwnerEmail(docSnap.data().email);
            setOwnerPic(docSnap.data().profile_pic || ownerPic);
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
            const updatedWishlist = wishlist.filter(wishlistItemId => wishlistItemId !== item.id);
            await updateDoc(userRef, { wishlist: updatedWishlist });
            setIsClicked(false);
        } else {
            const updatedWishlist = [...wishlist, item.id];
            await updateDoc(userRef, { wishlist: updatedWishlist });
            setIsClicked(true);
        }
    };

    const handleShowMoreClick = (e) => {
        setShowItemModal(true);
        e.stopPropagation();
        e.preventDefault();
    };

    const handleClose = (e) => {
        setShowItemModal(false);
    };

    return (
        <div className={`main-card-div card-wrapper`} data-id={itemId}>
            <div>
                <div className="card-owner pt-1 pb-1">
                    <img src={ownerPic} alt="Profile" className="rounded-circle me-3" width="40px" height="40px" />
                    <div>
                        <h6 className="owner-name owner-name-trade-card">{ownerName !== "" ? ownerName : ownerEmail}</h6>
                    </div>
                    {showSelectionButton && (
                        <TickBox item={item}></TickBox>
                    )}
                </div>

                <div className="card-image-container-chat">
                    {item?.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="card-image" />
                    ) : (
                    <div className="empty-image">No Image</div>
                    )}
                </div>
            </div> 

            <div className="card-title">
                <div style={{ width: '2rem' }}>
                    <Heart 
                        isActive={isClicked} 
                        onClick={handleWishlistClick}
                    />
                </div>
                <span className='item-name-container w-75 ms-3'>{item?.name}</span>
            </div>

            <div className="card-description">
                <div className="d-flex justify-content-between">
                    <p>{item?.condition}</p>
                    <a onClick={handleShowMoreClick} className="pe-3" style={{ cursor: 'pointer' }}>Show more</a>
                </div>
                <div className="d-flex flex-column">
                    <p className="truncate-text">{item?.pickupLocation}</p>
                    <p className="truncate-text limit-div-len">Description: {item?.description}</p>
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

export default TradeCard;
