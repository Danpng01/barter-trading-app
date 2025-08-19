import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const PrivacyPolicyModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Privacy Policy</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Your Privacy</h4>
        <p>
          Your privacy is important to us. It is Upscalr's policy to respect your privacy regarding any information we may collect from you across our website, https://upscalr.com, and other sites we own and operate.
        </p>
        <h4>Information We Collect</h4>
        <p>
          We only collect information about you if we have a reason to do so — for example, to provide our Services, to communicate with you, or to make our Services better.
        </p>
        <h4>How We Use Information</h4>
        <p>
          We use information about you as mentioned above and for the purposes listed below:
        </p>
        <ul>
          <li>To provide our Services</li>
          <li>To further develop and improve our Services</li>
          <li>To monitor and analyze trends</li>
          <li>To communicate with you</li>
        </ul>
        {/* Add more sections as needed */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrivacyPolicyModal;
