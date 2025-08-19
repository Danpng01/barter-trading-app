import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import emailjs from '@emailjs/browser';
import { useAuth } from '../Auth/AuthContext.jsx';

const FeedbackModal = ({ show, handleClose, handleSubmit }) => {

    const { currentUser } = useAuth();

    const form = useRef();
    const [formData, setFormData] = useState({
        user_name: '',
        user_email: currentUser.email,
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
                handleSubmit();
            },
            (error) => {
                setModalMessage('Failed to send message, please try again.');
                setShowModal(true);
                console.log('FAILED...', error.text);
            },
        );
    };

    const noEmailSentLogOut = (e) => {
        e.preventDefault();
        handleSubmit();
    }


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
          ...prevData,
          [name]: value
        }));
    };
    
    return (
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>Leave Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form ref={form} onSubmit={sendEmail}>
            <Form.Group controlId="feedbackForm.ControlTextarea1">
                <Row className="mb-2">
                    <Form.Label>Your Feedback</Form.Label>
                    <small className="text-muted">Please be kind in your feedback</small>
                    <small className="text-muted">Your feedback helps us improve! Thank you.</small>
                </Row>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    name="message"
                    required
                />
            </Form.Group>
            <Col>
                <Button variant="primary" type="submit" className="mt-3">
                    Submit and Log out
                </Button>
                <Button variant="secondary" onClick={noEmailSentLogOut} className="mt-3 ms-3">
                    No thanks and Log out
                </Button>
            </Col>
            </Form>
        </Modal.Body>
        </Modal>
    );
    };

export default FeedbackModal;
