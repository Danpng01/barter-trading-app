// Login.jsx
import React, { useState, useRef } from 'react';
import { Form, Card, Button, Alert, Row, Container } from 'react-bootstrap';
import { useAuth } from '../Auth/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup, loginWithGoogle, currentUser, logout, addUserInfo } = useAuth();
    const navigate = useNavigate();

    async function handleGoogleLogin() {
        try {
            setError("");
            setLoading(true);
            const userCred = await loginWithGoogle();
            if (userCred.emailVerified) {
                navigate('/');
            } else {
                setError("Please verify your email before logging in.");
                await logout();
                navigate('/login');
            }
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                setError("Failed to sign in with Google: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError("Password do not match");
        }
        
        try {
            setError("");
            setLoading(true);
            const userCred = await signup(emailRef.current.value, passwordRef.current.value);
            if (userCred.emailVerified) {
                navigate('/');
            } else {
                // alert("Please verify your email before logging in.");
                await logout();
                navigate('/login');
            }
            // Need to include a way to stop addition of user info if the sign up is unsuccessful.
        } catch (error) {
            setError("Failed to create an account: " + error.message);
        }
        setLoading(false);
    };

    return (
        <>
            <div className="d-flex flex-column height-adjustments">
                <Container className="d-flex align-items-center justify-content-center pb-2">
                    <Card className="w-50">
                        <Card.Body className="card-body-adjustments">
                            <h2 className="text-center mb-4">Sign Up</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form className="w-100" onSubmit={handleSubmit}>
                                <Form.Group controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" ref={emailRef} required />
                                </Form.Group>
                                <Form.Group className="pt-4 pb-4" controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" ref={passwordRef} required />
                                </Form.Group>
                                <Form.Group className="pb-4" controlId="passwordconfirm">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control type="password" ref={passwordConfirmRef} required />
                                </Form.Group>
                                <Button disabled={loading} className="w-100" type="submit">Sign Up</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Container>
                <div className="w-100 w-center mt-2">Already have an account? <Link to="/login">Log In</Link></div>
            </div>
        </>
    );
}