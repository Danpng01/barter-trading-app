import React, { useState, useRef } from 'react';
import { db, storage } from '../Firebase.js'; // Adjust the import path as needed
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../Auth/AuthContext.jsx';
import './Upload.css';

function Upload() {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState(''); 
  const [condition, setCondition] = useState(''); 
  const [pickupLocation, setPickupLocation] = useState(''); 
  const [uploading, setUploading] = useState(false);
  const [imageId, setImageId] = useState('');
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    setUploading(true);
  
    try {
      let imageUrl = '';
  
      if (image) {
        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        console.log('Image uploaded to storage');
        imageUrl = await getDownloadURL(storageRef);
        console.log('Image URL retrieved:', imageUrl);
      }

      const docRef = await addDoc(collection(db, 'card_items'), {
        name: itemName,
        description: description,
        category: category,
        condition: condition,
        imageUrl: imageUrl,
        timestamp: new Date(),
        owner_id: currentUser.uid,
        pickupLocation: pickupLocation
      });
      console.log('Item data added to Firestore');

      const documentIdToStore = docRef.id;
      try {
        const userDocRef = doc(db, 'user_info', currentUser.uid);
        await updateDoc(userDocRef, {
          owned_list: arrayUnion(documentIdToStore)
        });
        /* alert('pic_id updated successfully'); not needed, otherwise there will be 2 alerts*/
      } catch (error) {
        alert('Error updating pic_id ', error);
      }
  
      setItemName('');
      setDescription('');
      setImage(null);
      setCategory('');
      setCondition('');
      setPickupLocation('');
      fileInputRef.current.value = null;
      alert('Item uploaded successfully');
    } catch (error) {
      alert('Error uploading item ', error);
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <div className="content">
      <div className="upload-container">
        <h2>Upload Item for Barter</h2>
        <form onSubmit={handleSubmit} className="upload-form">
          <label>
            Item Name:
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </label>
          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
          <label>
            Category: 
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>Select category here</option>
              <option value="books">Books</option>
              <option value="clothes">Clothes</option>
              <option value="electronics">Electronics</option>
              <option value="artcollectibles">Art Collectibles</option>
              <option value="Accessories">Accessories</option>
              <option value="Others">Others</option>
            </select>
          </label>

          <label>
            Condition: 
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
            >
              <option value="" disabled>Select condition here</option>
              <option value="well-used">Well used</option>
              <option value="lightly-used">Lightly used</option>
              <option value="brand-new">Brand new</option>
            </select>
          </label>

          <label>
            Pick up location: 
            <input
              type="text"
              value={pickupLocation}
              placeholder="Enter a postal code or an MRT station"
              onChange={(e) => setPickupLocation(e.target.value)}
              required
            />
          </label>

          <label>
            Image:
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setImage(e.target.files[0])}
              accept=".jpg, .jpeg, .heic, .png" // Specify the accepted file types
              required
            />
          </label>
          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Item'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Upload;
