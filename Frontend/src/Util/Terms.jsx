import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const TermsOfServiceModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Terms of Service</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Terms of Service for Upscalr</h4>
        <p>
          Welcome to Upscalr! These terms of service outline the rules and regulations for the use of Upscalr's Website, located at https://upscalr.com.
        </p>
        <h5>1. Acceptance of Terms</h5>
        <p>
          By accessing this website, you agree to comply with these Terms of Service. If you do not agree with any part of these terms, you may not use our services.
        </p>
        <h5>2. Use License</h5>
        <p>
          Permission is granted to temporarily download one copy of the materials on Upscalr's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license, you may not:
        </p>
        <ul>
          <li>Modify or copy the materials</li>
          <li>Use the materials for any commercial purpose</li>
          <li>Attempt to decompile or reverse engineer any software contained on Upscalr's website</li>
          <li>Remove any copyright or other proprietary notations from the materials</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
        </ul>
        <h5>3. Disclaimer</h5>
        <p>
          The materials on Upscalr's website are provided on an 'as is' basis. Upscalr makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
        <h5>4. Limitations</h5>
        <p>
          In no event shall Upscalr or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Upscalr's website, even if Upscalr or a Upscalr authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>
        <h5>5. Accuracy of Materials</h5>
        <p>
          The materials appearing on Upscalr's website could include technical, typographical, or photographic errors. Upscalr does not warrant that any of the materials on its website are accurate, complete, or current. Upscalr may make changes to the materials contained on its website at any time without notice.
        </p>
        <h5>6. Links</h5>
        <p>
          Upscalr has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Upscalr of the site. Use of any such linked website is at the user's own risk.
        </p>
        <h5>7. Modifications</h5>
        <p>
          Upscalr may revise these terms of service for its website at any time without notice. By using this website, you agree to be bound by the current version of these Terms of Service.
        </p>
        <h5>8. Governing Law</h5>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Upscalr operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TermsOfServiceModal;
