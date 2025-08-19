import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Contact.css';

export default function Contact() {
  const form = useRef();
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    message: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
    .sendForm('service_eas9lyc', 'template_rqt99xv', form.current, {
        publicKey: 'xAm24KSJQGlL0MU9b',
    }).then(
        () => {
          setModalMessage('Message successfully sent!');
          setShowModal(true);
          setFormData({
            user_name: '',
            user_email: '',
            message: '',
          });
        },
        (error) => {
          setModalMessage('Failed to send message, please try again.');
          setShowModal(true);
          console.log('FAILED...', error.text);
        },
      );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleClose = () => setShowModal(false);

  return (
    <>
      <div className = 'decorative-box'></div>
      <div className='main-container'>
        <h2>Contact Us</h2>
        <p className="justified-text">
          Our team values your feedback and suggestions. We aim to create a community-driven platform where everyone's input helps us improve. {"\n"}{"\n"}
          Get in contact with us and share whats on your mind! We would love to head about your comments on Upscalr, from 
          items you'd like to see on the marketplace, to features you'd like to be added to the app, to any issues or bugs you've encountered in general :)  {"\n"}
        </p>
        <div className='StyledContactForm'>
          <form ref={form} onSubmit={sendEmail}>
            <label>Name</label>
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              required
            />
            <label>Email</label>
            <input
              type="email"
              name="user_email"
              value={formData.user_email}
              onChange={handleChange}
              required
            />
            <label>Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
            <input type="submit" value="Send" />
          </form>
        </div>

        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Notification</Modal.Title>
          </Modal.Header>
          <Modal.Body>{modalMessage}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
