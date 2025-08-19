import React, { useState } from 'react';
import { Col, Button } from 'react-bootstrap';
import { useAuth } from '../Auth/AuthContext.jsx';
import { useChat } from '../Auth/UserChatContext.jsx';
import { arrayUnion, doc, Timestamp, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../Firebase.js';
import { v4 as uuid } from "uuid";

export const ChatInputpanel = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const { currentUser } = useAuth();
    const { data } = useChat();

    const handleSend = async () => {

        setLoading(true);
        
        if (!currentUser || !data.user.uid) {
            console.error("Need to select a recipent in order to send the message!");
            setLoading(false);
            return;
        }

        try {
            await updateDoc(doc(db, "user_chat_messages", data.chatId), {
                messages: arrayUnion({
                    id: uuid(),
                    text,
                    senderId: currentUser.uid,
                    date: Timestamp.now(),
                }),
            });

            setText('');
        } catch (error) {
            console.error('Error sending message: ', error);
        } finally {
            setLoading(false);
        }

        try {
            setLoading(true);
            await updateDoc(doc(db, "user_chats", currentUser.uid), {
                [data.chatId + ".lastMessage"]: {
                    text,
                },
                [data.chatId + ".date"]: serverTimestamp(),
            });
    
            await updateDoc(doc(db, "user_chats", data.user.uid), {
                [data.chatId + ".lastMessage"]: {
                    text,
                },
                [data.chatId + ".date"]: serverTimestamp(),
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setText(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (!loading && e.key === "Enter" && text != "") {
            e.preventDefault();
            handleSend();
        } else if (text === "" && !loading && e.key === "Enter") {
            alert("Unable to send blank message");
            return;
        }
    };

    return (
        <div>
            <Col className="d-flex">
                <input
                    type="text"
                    placeholder="Type message here..."
                    value={text}
                    onChange={handleInputChange}
                    className="w-100"
                    onKeyDown={handleKeyPress}
                />
                <Button onClick={handleSend} disabled={loading}>Send</Button>
            </Col>
        </div>
    );
};

export default ChatInputpanel;
