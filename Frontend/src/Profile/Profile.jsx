import React, { useEffect, useState } from 'react';
import './profile.css';
import { useAuth } from '../Auth/AuthContext.jsx';
import { Card, Button, Col } from 'react-bootstrap';
import { db } from '../Firebase.js';
import HomeCardBlock from '../Home/HomeCardBlock.jsx';
import { useNavigate, useParams } from 'react-router-dom'; 
import { getDoc, doc, updateDoc, FieldValue, deleteField } from "firebase/firestore";
import FeedbackModal from '../Util/FeedbackModal.jsx';
import ProfilePictureModal from './ProfilePictureModal.jsx';
import { useBarteringItems } from '../Context/BarteringItemsContext.jsx';
import defaultPic from '../assets/defaultProfilePic.png';


function Profile() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { userId } = useParams();
    const { generateWishlist, currUserItems } = useBarteringItems();

    const [wishlistItems, setWishlistItems] = useState([]);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    /* check which user's profile to display */
    const [userInFocus, setUserInFocus] = useState(null);
    /* constant to toggle between whether the profile visited by the current user is their own */
    const [isOwnProfile, setIsOwnProfile] = useState(currentUser.uid === userId);

    /* check to see if the user is following the other user */
    const [isFollowing, setIsFollowing] = useState(false);

    /* useEffect to set the userInFocus for that profile page */
    useEffect(() => {
        const fetchUserData = async () => {
            if (userId === currentUser.uid) {
                // Viewing own profile
                setIsOwnProfile(true);
                setUserInFocus(currentUser);
            } else {
                // Viewing another user's profile
                setIsOwnProfile(false);
                try {
                    const userDocRef = doc(db, 'user_info', userId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setUserInFocus(userDocSnap.data());
                    } else {
                        console.error('User not found');
                        navigate('/'); // Redirect if user doesn't exist
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        return () => fetchUserData();
    }, [userId, currentUser]);

    /* Check to see if the user is following the userInFocus */
    useEffect(() => {
        const checkFollowingStatus = async () => {
            if (currentUser?.uid && userId) {
                try {
                    const currentUserRef = doc(db, 'user_info', currentUser.uid);
                    const currentUserSnap = await getDoc(currentUserRef);

                    if (currentUserSnap.exists()) {
                        const following = currentUserSnap.data()?.following || {};
                        setIsFollowing(Boolean(following[userId]));
                    }
                } catch (error) {
                    console.error('Error checking following status:', error);
                }
            }
        };

        return () => checkFollowingStatus();
    }, [currentUser?.uid, userId]);

    useEffect(() => {
        if (isOwnProfile) {
            generateWishlist({ setFunction: setWishlistItems });
        }
    }, [isOwnProfile, generateWishlist]);

    const handleLogout = async () => {
        setShowFeedbackModal(true);
    };

    /* Logic to handle the following of users by adding them to the following map from the following map field */
    const handleFollowToggle = async () => {
        if (currentUser.uid === userId) return;

        try {
            const currentUserRef = doc(db, 'user_info', currentUser.uid);
            const userToFollowRef = doc(db, 'user_info', userId);
    
            // Update the `following` list for the current user
            if (isFollowing) {
                // Unfollow: Remove the userId from the following map
                await updateDoc(currentUserRef, {
                    [`following.${userId}`]: deleteField(),
                });
                setIsFollowing(false);
            } else {
                // Follow: Add the userId to the following map
                await updateDoc(currentUserRef, {
                    [`following.${userId}`]: true,
                });
                setIsFollowing(true);
            }
            /* Update the `followers` list for the user being followed
            await updateDoc(userToFollowRef, {
                followers: arrayUnion(currentUser.uid),
            }); */
    
            console.log(`Successfully followed user: ${userId}`);
        } catch (error) {
            console.error("Error following user:", error);
        }
    }

    /* Logic to handle the unfollowing of users by removing them to the following map from the following map field */

    function CardBody({ items }) {
        return (
            <Card.Body>
                {items.length > 0 ? (
                    items.map((item) => (
                        <HomeCardBlock item={item} />
                    ))
                ) : (
                    <Card className="available-text">No available items</Card>
                )}
            </Card.Body>
        );
    };

    const handleFeedbackSubmit = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to submit feedback and log out:", error);
        }
    };

    const [userInfo, setUserInfo] = useState([]);
  
    useEffect(() => {
        const fetchUserInfo = async (e) => {
            try {
                const userDocRef = doc(db, 'user_info', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserInfo(userDocSnap.data());
                } else {
                }
            } catch (error) {
                console.error("Error fetching uploads: ", error);
            }
        };
        fetchUserInfo();
    }, []);

    return (
        <div className="container-profile">
            <div className="row d-flex justify-content-center align-items-center">
                <div className="col-md-4">
                    <Card className="d-flex align-items-center pb-6 pt-6 top-same-size-card">
                        <div className="d-flex align-items-center">
                            <img src={ defaultPic } alt={`${userInFocus?.email}'s profile`} className="img-fluid rounded-circle" style={{ width: '60px', height: '60px' }} />
                            <div className="ms-3">
                                <Card.Title className="h6">{userInFocus?.email}</Card.Title>
                                <Card.Text className="text-muted small">@{userInFocus?.email}</Card.Text>
                            </div>
                        </div>
                        <Col>
                            {isOwnProfile && (
                                <>
                                <Button className="logout-button mt-3" onClick={handleLogout}>Log out</Button>
                                <Button className="logout-button mt-3 ms-3" onClick={() => setShowModal(true)}>Change Profile Picture</Button>
                                </>
                            )}

                            {!isOwnProfile && (
                                <Button className="logout-button mt-3 ms-3" onClick={handleFollowToggle}>{isFollowing ? 'Unfollow' : 'Follow'}</Button>
                            )}
                        </Col>
                    </Card>
                </div>
            </div>

            {isOwnProfile && (
                <div>
                    <div className="inventory mt-4">
                        <Card.Title>Your Inventory</Card.Title>
                        <Card className="align-items-center same-size-card overflow-x-auto">
                            <CardBody items={currUserItems} />
                        </Card>
                    </div>
                    
                    <div className="wishlist h-100">
                        <Card.Title>Your Wishlist</Card.Title>
                        <Card className="align-items-center same-size-card h-100 p-0 overflow-x-auto mb-5">
                            <CardBody items={wishlistItems} />
                        </Card>
                    </div>
                </div>
            )}

            <FeedbackModal
                show={showFeedbackModal}
                handleClose={() => setShowFeedbackModal(false)}
                handleSubmit={handleFeedbackSubmit}
            />
            <ProfilePictureModal show={showModal} handleClose={() => setShowModal(false)} />
        </div>
    );
}

export default Profile;
