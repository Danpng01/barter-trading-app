import React, { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap';
import ChatSearchbar from './ChatSearchbar.jsx';
import ChatLogs from './ChatLogs.jsx';
import { useAuth } from '../Auth/AuthContext.jsx';

const ChatSidebar = () => {

  const { currentUser, getUserName } = useAuth();
  const [userName, setUserName] = useState("");
  
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const user_info = await getUserName(currentUser);
        setUserName(user_info.name);
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    fetchUsername();
  }, [currentUser, getUserName]);

  return (
    <Container>
      <div className="sb-header mt-2">Chatting as {userName ? userName : currentUser.email}</div>
      <ChatSearchbar />
      <ChatLogs />
    </Container>
  );
}

export default ChatSidebar;
