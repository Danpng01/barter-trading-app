import React, { useRef, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext.jsx';
import { Container } from 'react-bootstrap';
import './MessageBlock.css';

const MessageBlock = ({ message }) => {
  const { currentUser } = useAuth();
  const ref = useRef();

  const isCurrentUser = message.senderId === currentUser.uid;
  const isOfferMessage = message.text === "An offer has been proposed";

  return (
    <Container
      className={`message ${isCurrentUser ? "owner" : ""} w-100 d-flex p-0 mb-3`}
      ref={ref}
      style={{ justifyContent: isOfferMessage ? "center" : isCurrentUser ? "flex-end" : "flex-start" }}
    >
      <div className={`d-flex flex-row gap-2 ${isCurrentUser ? "current-user-messageblock" : "other-user-messageblock"}`}>
        <p
          className={`p-3 fs-7 m-0 d-flex align-items-center justify-content-center text-message-box rounded ${isCurrentUser ? "current-user-message" : "other-user-message"}`}
          style={{
            color: 'black',
            backgroundColor: isOfferMessage ? '#90ee90' : '',
            width: isOfferMessage ? 'auto' : '',
            textAlign: isOfferMessage ? 'center' : '',
            borderRadius: isOfferMessage ? '20px' : '5px'
          }}
        >
          {message.text}
        </p>
      </div>
    </Container>
  );
}

export default MessageBlock;

