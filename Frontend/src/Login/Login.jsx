import React, { useState, useRef } from 'react';
import { Form, Card, Button, Alert, Row, Container } from 'react-bootstrap';
import { useAuth } from '../Auth/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login, loginWithGoogle, logout, addUserInfo } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError("");
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            navigate('/');
        } catch (error) {
            await logout();
            setError("Failed to sign in: " + error.message);
        }
        setLoading(false);
    };

    async function handleGoogleLogin() {
        try {
            setError("");
            setLoading(true);
            const userCred = await loginWithGoogle();
            if (userCred.emailVerified) {
                addUserInfo(userCred.user.uid, userCred.user.email);
                navigate('/');
            } else {
                setError("Please verify your email before logging in.");
                await logout();
            }
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                setError("Failed to sign in with Google: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column height-adjustments">
            <Container className="d-flex align-items-center justify-content-center pb-2">
                <Card className="w-50">
                    <Card.Body className="inner-comp-adjustments">
                        <h2 className="text-center mb-4">
                            Log In  
                        </h2>
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
                            <Button disabled={loading} className="w-100 mb-4" type="submit">Login</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
            <div className="w-100 text-center mt-2 pb-3">New here? <Link to="/signup">Sign Up</Link></div>
        </div>
    );
}
