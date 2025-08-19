import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext.jsx';
import { useChat } from '../Auth/UserChatContext.jsx';
import ChatSidebar from './ChatSidebar.jsx'; 
import ChatMessages from './ChatMessages.jsx';
import { Container, Row, Col } from 'react-bootstrap';
import './Chat.css';

const Chat = () => {
    const { itemId } = useParams();
    const { currentUser } = useAuth();
    const { data } = useChat();

    return (
        <div className="d-flex justify-content-center align-items-center">
            <Container fluid className="chat-container">
                <Row className="h-100 chat-container-row">
                    <Col md={3} className="sb-adjust">
                        <ChatSidebar />
                    </Col>
                    <Col md={9} className="cm-adjust"> {/* Adjust the width to fill the remaining space */}
                        <ChatMessages ownerId={data.user.uid} itemId={itemId} currentUser={currentUser}/>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Chat;

