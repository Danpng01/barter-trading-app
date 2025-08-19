import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UpscalrLogo from '../assets/upscalr_logo.jpg';
import { Navbar, Nav, Image } from 'react-bootstrap';
import { FaRegCommentDots, FaUpload, FaHome, FaCompass, FaHeart, FaEllipsisH } from 'react-icons/fa';
import './Header.css'; // Make sure to create and import a CSS file for styling

function Header({ curruser }) {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogoClick = () => {
        setSearchQuery(''); // Reset the search query
        navigate('/');
    };

    const handleCategoryClick = (category) => {
        navigate(`/?category=${category}`);
        setShowDropdown(false);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <>
            <Navbar expand="lg" className="header">
                <Navbar.Brand as={Link} to="/" onClick={handleLogoClick}>
                    <Image src={UpscalrLogo} alt="UpScalr Logo" className="logo-image" />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse className="header-container" id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link as={Link} to="/chats"><FaRegCommentDots size={24} title="Chats" /></Nav.Link>
                        <Nav.Link as={Link} to="/upload"><FaUpload size={24} title="Upload" /></Nav.Link>
                        <Nav.Link as={Link} to="/" onClick={handleLogoClick} style={{ color: 'rgb(20, 4, 158' }}><FaHome size={24} title="Feed" /></Nav.Link>
                        <Nav.Link as={Link} to="/" onClick={handleLogoClick} style={{ color: 'rgb(20, 4, 158)' }}><FaCompass size={24} title="Explore" /></Nav.Link>
                        <Nav.Link onClick={() => handleCategoryClick('Wishlist')} style={{ color: 'rgb(20, 4, 158)' }}><FaHeart size={24} title="Wishlist" /></Nav.Link>
                        <Nav.Link onClick={toggleDropdown} style={{ color: 'rgb(20, 4, 158)' }}>View All Categories</Nav.Link>
                    </Nav>
                    <Nav>
                        {curruser ? (
                            <Nav.Link className="ms-0" onClick={() => {
                                navigate(`/profile/${curruser.uid}`);
                                window.location.reload();
                            }}>{curruser.email}</Nav.Link>
                        ) : (
                            <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        )}
                        <Nav.Link as={Link} to="/contact">Contact Us</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <div className={`category-dropdown ${showDropdown ? 'visible' : 'hidden'}`}>
                <Nav className="dropdown-nav">
                    <Nav.Link onClick={() => handleCategoryClick('Art Collectibles')} style={{ color: 'rgb(113, 228, 240)' }}>Art Collectibles</Nav.Link>
                    <Nav.Link onClick={() => handleCategoryClick('Accessories')} style={{ color: 'rgb(113, 228, 240)' }}>Accessories</Nav.Link>
                    <Nav.Link onClick={() => handleCategoryClick('Others')} style={{ color: 'rgb(113, 228, 240)' }}>Others</Nav.Link>
                </Nav>
            </div>
        </>
    );
}

export default Header;

