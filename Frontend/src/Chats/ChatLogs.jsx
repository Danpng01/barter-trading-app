import React, { useState, useEffect } from 'react'
import { Container, Col } from 'react-bootstrap';
import { useAuth } from '../Auth/AuthContext.jsx';
import { useChat } from '../Auth/UserChatContext.jsx';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase.js';
import './ChatLogs.css';
import defaultPic from '../assets/defaultProfilePic.png';

const ChatLogs = () => {

    const { currentUser } = useAuth();
    const { data, dispatch } = useChat();
    const [ownerPic, setOwnerPic] = useState(defaultPic);
    const [chatLogs, setChatLogs] = useState([]);

    useEffect(() => {
        const fetchChatLogs = onSnapshot(doc(db, "user_chats", currentUser.uid), async (docSnapshot) => {
            if (docSnapshot.exists()) {
                const chatData = docSnapshot.data();
                const chatIds = Object.keys(chatData);
                const chatLogsWithUnread = [];

                try {
                    for (const chatId of chatIds) {
                        const messagesRef = doc(db, `user_chat_messages/${chatId}`);
                        const querySnapshot = await getDoc(messagesRef);
                        
                        const queryMessages = querySnapshot.data().messages;
                        let unreadCount = 0;
                        queryMessages.map((messageDoc) => {
                            if (messageDoc.read === false && messageDoc.senderId !== currentUser.uid) {
                                unreadCount++;
                            }
                        });

                        chatLogsWithUnread.push({
                            ...chatData[chatId],
                            chatId,
                            unreadCount
                        });
                    }

                    setChatLogs(chatLogsWithUnread);
                } catch (error) {
                console.error('Error fetching unread counts: ', error);
                }
            }
        });

        return () => {
            if (currentUser.uid) {
                fetchChatLogs();
            }
        }

    }, [currentUser.uid]);
        
    const updateUnreadCount = async (chatid) => {
        let unreadCount = 0;
        setChatLogs((prevChatLogs) =>
            prevChatLogs.map((chat) =>
                chat.chatId === chatid ? { ...chat, unreadCount } : chat
            )
        );
        
    }

    const handleSelect = async (userInfo, chatId) => {
        dispatch({ type: "CHANGE_USER", payload: userInfo });
        await updateUnreadCount(chatId);
    };

    return (
        <div>
            {chatLogs && chatLogs.sort((a, b) => b.date - a.date).map((chat) => (
                <Container key={chat.chatId} className="p-0 mb-3 truncate-text-chatlogs" onClick={() => handleSelect(chat.userInfo, chat.chatId)}>
                    <div className="d-flex align-items-center flex-row pb-2">
                        <Col xs="auto">
                            <img
                                src={(chat.userInfo?.photoURL || ownerPic)}
                                className="rounded-circle p-0"
                                style={{ width: '60px', height: '60px' }}
                                alt="User"
                            />
                        </Col>
                        <Col>
                            <p className="p-0 m-0">{chat.userInfo.name ? chat.userInfo.name : chat.userInfo.email}</p>
                            <p className="p-0 m-0">{chat.lastMessage?.text}</p>
                        </Col>
                        <Col className="chat-unread-count">
                            {chat.unreadCount > 0 && (
                                <p className="p-0 m-0 text-muted">{chat.unreadCount}</p>
                            )}
                        </Col>
                    </div>
                </Container>
            ))}
        </div>
    );
}

export default ChatLogs;