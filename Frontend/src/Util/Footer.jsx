import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import PrivacyPolicyModal from './PrivacyModal';
import TermsOfServiceModal from './Terms';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Footer.css';

const Footer = () => {
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCategoryClick = (category) => {
    window.scrollTo(0, 0);  // Scroll to the top
    navigate(`/?category=${category}`);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    window.scrollTo(0, 0);  // Scroll to the top
    setShowDropdown(!showDropdown);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 Upscalr. All rights reserved.</p>

        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/chats" style={{color: 'white'}}>Chats</Nav.Link>
          <Nav.Link as={Link} to="/upload" style={{color: 'white'}}>Upload</Nav.Link>
          <Nav.Link onClick={() => handleCategoryClick('Books')} style={{ color: 'rgb(113, 228, 240)' }}>Books</Nav.Link>
          <Nav.Link onClick={() => handleCategoryClick('Clothes')} style={{ color: 'rgb(113, 228, 240)' }}>Clothes</Nav.Link>
          <Nav.Link onClick={() => handleCategoryClick('Electronics')} style={{ color: 'rgb(113, 228, 240)' }}>Electronics</Nav.Link>
          <Nav.Link onClick={() => handleCategoryClick('Wishlist')} style={{ color: 'rgb(113, 228, 240)' }}>Wishlist</Nav.Link>
          <Nav.Link onClick={toggleDropdown} style={{ color: 'rgb(113, 228, 240)' }}>View All Categories</Nav.Link>
        </Nav>

        <div className={`category-dropdown ${showDropdown ? 'visible' : 'hidden'}`}>
            <Nav className="dropdown-nav">
                <Nav.Link onClick={() => handleCategoryClick('Art Collectibles')} style={{ color: 'rgb(113, 228, 240)' }}>Art Collectibles</Nav.Link>
                <Nav.Link onClick={() => handleCategoryClick('Accessories')} style={{ color: 'rgb(113, 228, 240)' }}>Accessories</Nav.Link>
                <Nav.Link onClick={() => handleCategoryClick('Alcoholic Drinks')} style={{ color: 'rgb(113, 228, 240)' }}>Alcoholic Drinks</Nav.Link>
            </Nav>
        </div>

        <nav>
          <ul className="footer-nav">
            <li><a href="/#about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="#privacy" onClick={handleShow}>Privacy Policy</a></li>
            <li><a href="#terms" onClick={handleShow}>Terms of Service</a></li>
          </ul>
        </nav>
      </div>

      <PrivacyPolicyModal show={showModal} handleClose={handleClose} />
      <TermsOfServiceModal show={showModal} handleClose={handleClose} />
    </footer>
  );
};

export default Footer;
