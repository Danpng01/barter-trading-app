import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import HomeCardBlock from './HomeCardBlock.jsx';
import "./Home.css";
import { Container, Row, Col, Image, Modal, Button, Form } from 'react-bootstrap';
import Guide from '../assets/Guide.jpg';
import defaultPic from '../assets/defaultProfilePic.png';
import { useBarteringItems } from '../Context/BarteringItemsContext.jsx';
import { useAuth } from '../Auth/AuthContext.jsx';
import { useChat } from '../Auth/UserChatContext.jsx';
import { getDoc, doc, updateDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../Firebase.js';

function Home() {
  const location = useLocation();
  const { searchQuery, setSearchQuery, handleSearch, handleWishlistSearch} = useBarteringItems();
  const { currentUser } = useAuth();
  const { dispatch } = useChat();
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userCountry, setUserCountry] = useState('');

  /* Finding Feed Items */
  const [feedItems, setFeedItems] = useState([]);  // Start with an empty array if the response is a list

  useEffect(() => {
    const uidParam = currentUser?.uid ? `?uid=${currentUser.uid}` : ""; // Include UID only if available

    // Fetch data from the Flask API
    fetch(`http://127.0.0.1:5000/feed-items?uid=${uidParam}`)  // Correct URL where Flask is running
      .then((response) => response.json())  // Use .json() to parse JSON responses
      .then((data) => setFeedItems(data))  // Set the response (list of items) to state
      .catch((error) => console.error('Error fetching data:', error));
  }, [currentUser?.uid]); // Trigger re-fetch when currentUser changes

  const [exploreItems, setExploreItems] = useState([]);  // Start with an empty array if the response is a list

  useEffect(() => {
    const uidParam = currentUser?.uid ? `?uid=${currentUser.uid}` : ""; // Include UID only if available
    // Fetch data from the Flask API
    fetch(`http://127.0.0.1:5000/explore-items?uid=${uidParam}`)  // Correct URL where Flask is running
      .then((response) => response.json())  // Use .json() to parse JSON responses
      .then((data) => setExploreItems(data))  // Set the response (list of items) to state
      .catch((error) => console.error('Error fetching data:', error));
  }, [currentUser?.uid]);// Trigger re-fetch when currentUser changes

  /**********************************/
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    setSearchQuery(category);
    if (category && category.toLowerCase().includes('wishlist')) {
      handleWishlistSearch();
    } else if (category) {
      handleSearch(category);
    }
  }, [location]);

  useEffect(() => {
    const checkUserName = async () => {
      const userDoc = await getDoc(doc(db, "user_info", currentUser.uid));
      if (userDoc.exists() && !userDoc.data().name) {
        setShowModal(true);
      }
    };
    checkUserName();
  }, [currentUser]);

  const handleSearchInputChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  async function loadData(item) {
    const combinedId = currentUser.uid > item.owner_id ? currentUser.uid + item.owner_id : item.owner_id + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "user_chat_messages", combinedId));
      const userInfo = await getDoc(doc(db, "user_info", item.owner_id));
      const currUser = await getDoc(doc(db, "user_info", currentUser.uid));
      const currUserInfo = currUser.data();
      
      if (!userInfo.exists()) {
        console.log("error");
        return;
      }
      
      /* currentUser is only used for the UID in this case. To use currentUser information 
      please make use of currUserInfo variable instead */
      if (!res.exists()) {
        // check new chat document entry
        await setDoc(doc(db, "user_chat_messages", combinedId), { 
          messages: [], 
          [item.owner_id + "_items"]: [item.id], 
          [currentUser.uid + "_items"]: []
        });
      } else {
        // update the existing document to ensure the arrays are present
        await updateDoc(doc(db, "user_chat_messages", combinedId), {
          [item.owner_id + "_items"]: arrayUnion(item.id) // Ensure the field exists
        });
      }

      if (await checkDocumentExists("user_chats", currentUser.uid)) {
        // create user chats
        await updateDoc(doc(db, "user_chats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: item.owner_id,
            email: userInfo.data().email,
            photoURL: (userInfo.data()?.photoURL || defaultPic),
            name: userInfo.data()?.name || "",
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, "user_chats", currentUser.uid), {
          [combinedId]: {
            userInfo: {
              uid: item.owner_id,
              email: userInfo.data().email,
              photoURL: userInfo.data().photoURL || defaultPic,
              name: userInfo.data().name,
            },
            date: serverTimestamp(),
          }
        });
      }
      
      if (await checkDocumentExists("user_chats", item.owner_id)) {
        await updateDoc(doc(db, "user_chats", item.owner_id), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            email: currUserInfo.email,
            photoURL: (currUserInfo.photoURL || defaultPic),
            name: currUserInfo.name,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, "user_chats", item.owner_id), {
          [combinedId]: {
            userInfo: {
              uid: currentUser.uid,
              email: currUserInfo.email,
              photoURL: (currUserInfo.photoURL || defaultPic),
              name: currUserInfo.name,
            },
            date: serverTimestamp(),
          }
        });
      }
  
      const user_chat_info = await getDoc(doc(db, "user_chats", currentUser.uid));
      const user_chat_data = user_chat_info.data()[combinedId];
      handleSelect(user_chat_data.userInfo);
  
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const handleNavigate = async (item) => {
    await loadData(item);
    return;
  }

  const checkDocumentExists = async (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      return true;
    } else {
      return false;
    }
  };

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  const handleModalClose = () => setShowModal(false);

  const handleModalSave = async () => {
    try {
      await updateDoc(doc(db, "user_info", currentUser.uid), { name: userName });
      setShowModal(false);
    } catch (error) {
      console.error("Error updating user name:", error);
    }
  };

  return (
    <>
      <Row className="outer-container ms-5 me-5">
        <Container fluid className="content w-100">
          <Col className="search-bar col-adjust">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="search-input"
            />
            <button className="search-button" onClick={() => handleSearch(searchQuery)}>
              Search
            </button>
          </Col>

          <p className="header-scrollable">Feed</p>
          <div className="item-container">
          {feedItems.length > 0 ? (
              feedItems.map((item) => (
                <div onClick={() => handleNavigate(item)} key={item.id}>
                  <HomeCardBlock item={item} />
                </div>
              ))
            ) : (
              <div className="available-text">No available items</div>
            )}
          </div>

          <p className="header-scrollable">Explore Page</p>
          <div className="item-container">
            {/* need to change barteting items to a unique class for the explore page */}
          {exploreItems.length > 0 ? (
              exploreItems.map((item) => (
                <div onClick={() => handleNavigate(item)} key={item.id}>
                  <HomeCardBlock item={item} />
                </div>
              ))
            ) : (
              <div className="available-text">No available items</div>
            )}
          </div>

          <Row id="about-us">
            <Col>
              <h2>About Our Platform</h2>
              <p>
                Our platform aims to address the issues of finite resources and waste
                by providing a space where individuals can trade items that still have
                utility. We recognize that people value assets differently, and our
                app empowers users to trade for items they consider to be of equal value.
              </p>
            </Col>
          </Row>
        </Container>
      </Row>

      <Image src={Guide} alt="User Guide" className="user-guide" />

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header>
          <Modal.Title>Help us to customize your barter experience!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formUserName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="countryUserName">
              <Form.Label>Country</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter the country you will be bartering in"
                value={userCountry}
                onChange={(e) => setUserCountry(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Home;