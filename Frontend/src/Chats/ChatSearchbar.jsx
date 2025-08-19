import React, { useState } from 'react'
import { collection, query, where, getDoc, setDoc, doc, updateDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../Firebase.js';
import { useAuth } from '../Auth/AuthContext.jsx';
import { useChat } from '../Auth/UserChatContext.jsx';
import defaultPic from '../assets/defaultProfilePic.png';

const ChatSearchbar = () => {

  const [username, setUsername] = useState('');
  const [user, setUser] = useState('');
  const [err, setErr] = useState(false);
  const { currentUser } = useAuth();
  const { dispatch } = useChat();
  
  const handleSearch = async () => {
    const q = query(collection(db, "user_info"), where("email", "==", username));
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUser(doc.data());
      });
    } catch (error) {
      setErr(true);
    }
  }

  const handleKey = (e) => {
    e.code == "Enter" && handleSearch();
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

  const handleSelect = async () => {
    // check whether the 2 users convo exist at all
    const combinedId = currentUser.uid > user.uid ? currentUser.uid + user.uid : user.uid + currentUser.uid;
    try { 
      const res = await getDoc(doc(db, "user_chat_messages", combinedId));

      /* currentUser is only used for the UID in this case. To use currentUser information 
      please make use of currUserInfo variable instead */
      const currUser = await getDoc(doc(db, "user_info", currentUser.uid));
      const currUserInfo = currUser.data();

      if (!res.exists()) {
        // check new chat document entry
        await setDoc(doc(db, "user_chat_messages", combinedId), { 
          messages: [], 
        });

        if (await checkDocumentExists("user_chats", currentUser.uid)) {
          //create user chats
          await updateDoc(doc(db, "user_chats", currentUser.uid), {
            [combinedId + ".userInfo"]: {
              uid: user.uid,
              email: user.email,
              photoURL: (user.photoURL || defaultPic),
              name: user.name || "",
            },
            [combinedId + ".date"]: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, "user_chats", currentUser.uid), {
            [combinedId]: {
              userInfo: {
                uid: user.uid,
                email: user.email,
                photoURL: user.photoURL || defaultPic,
                name: user.name || "",
              },
              date: serverTimestamp(),
            }
          });
        }

        if (await checkDocumentExists("user_chats", user.uid)) {
          await updateDoc(doc(db, "user_chats", user.uid), {
            [combinedId + ".userInfo"]: {
              uid: currentUser.uid,
              email: currUserInfo.email,
              photoURL: (currUserInfo.photoURL || defaultPic),
              name: currUserInfo.name,
            },
            [combinedId + ".date"]: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, "user_chats", user.uid), {
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
      }
      try {
        const result = await getDoc(doc(db, "user_chats", currentUser.uid));
        const chat = result.data()[combinedId];
        handleClickSearch(chat.userInfo);
      } catch (error) {
        console.log("error: ", error);
      }
    } catch (error) {
      console.log("error: ", error);
    }

    setUser(null);
    setUsername("");
  }

  const handleSearchInputChange = (e) => {
    const query = e.target.value.toLowerCase();
    setUsername(query);
  };

  const handleClickSearch = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  return (
    <div className="sbsb-adjust">
      <input
        type="text"
        placeholder="Search messages and usernames..."
        value={username}
        onKeyDown={handleKey}
        onChange={handleSearchInputChange}
        className="w-100 mt-2 mb-2"
      />
      {err && <span>User not found!</span>}
      {user && <div className="user-chat-search mb-2" onClick={handleSelect} >
        <img src={user.photoURL || defaultPic} alt="" className="rounded-circle p-0" style={{ width: '60px', height: '60px' }} />
        <div className="user-chat-search-info w-100">
          <span>{user.email}</span>
        </div>
      </div>}
    </div>
  )
}

export default ChatSearchbar;
