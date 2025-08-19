// ProfilePictureModal.jsx
import React, { useState, useRef } from 'react';
import { Modal, Button, Image } from 'react-bootstrap';
import { useAuth } from '../Auth/AuthContext.jsx';
import { updateProfile } from "firebase/auth";
import { storage } from '../Firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './ProfilePictureModal.css';

const ProfilePictureModal = ({ show, handleClose }) => {
    const { currentUser } = useAuth();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    async function uploadProfilePicture(file) {
        const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        await updateProfile(currentUser, { photoURL });
    }

    const handleUpload = async () => {
        if (!image) return;

        setUploading(true);
        try {
            await uploadProfilePicture(image);
            handleClose();
        } catch (error) {
            console.error("Error uploading profile picture: ", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
            <Modal.Title>Change Profile Picture</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex flex-column align-items-center">
                    {preview && <Image className="preview-circle" src={preview} alt="Profile Preview" roundedCircle />}
                    <Button onClick={() => fileInputRef.current.click()} className="mt-3">
                    Choose New Picture
                    </Button>
                    <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Cancel
            </Button>
            <Button variant="primary" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Save Changes'}
            </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProfilePictureModal;
