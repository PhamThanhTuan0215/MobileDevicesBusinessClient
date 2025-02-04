import React, { useState } from 'react';
import '../assets/css/Login.css';
import { jwtDecode } from "jwt-decode"
import AlertMessage from "../utils/AlertMessage"
import { getErrorMessage } from "../utils/ErrorHandler";
import api from "../services/api";

import user_icon from '../assets/image/person.png';
import password_icon from '../assets/image/password.png';
import email_icon from '../assets/image/email.png';

export const Login = () => {
    const [action, setAction] = useState("Login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await api.post('customers/login', {
                email,
                password
            });

            if (response.status === 200) {
                const token = response.data.data.token;
                if (token) {
                    const decoded = jwtDecode(token);
                    localStorage.setItem('role', decoded.role);
                    localStorage.setItem('customerId', decoded.customer.id);
                    localStorage.setItem('isLoggedIn', true);
                }
                localStorage.setItem('token', token);

                window.location.reload();
            }
        } catch (error) {
            setLoading(false);

            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    };

    const handleRegister = async () => {
        try {
            setLoading(true);
            const response = await api.post('customers/', {
                name,
                email,
                password
            });
    
            if (response.status === 201) {
                setLoading(false);
                showAlert("Register successfully! Please login.", "success");
                setAction("Login");
            }
        } catch (error) {
            setLoading(false);
    
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    };

    const handleLostPassword = async () => {
        try {
            setLoading(true);
            const response = await api.post('customers/forgotPassword', { email });
    
            if (response.status === 200) {
                setLoading(false);
                showAlert("The password reset request has been sent! Please check your email.", "success");
                setAction("Login");
            }
        } catch (error) {
            setLoading(false);
    
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <>
            <div className='container'>
                <div className="header">
                    <div className="text">{action}</div>
                    <div className="underline"></div>
                </div>

                <div className="inputs">
                    {action === "Sign Up" && (
                        <div className="input">
                            <img src={user_icon} alt="" />
                            <input type="text" placeholder='Name' value={name} 
                               onChange={(e) => setName(e.target.value)} />
                        </div>
                    )}

                    {(action === "Login" || action === "Sign Up") && (
                        <>
                            <div className="input">
                                <img src={email_icon} alt="" />
                                <input type="email" placeholder='Email' value={email} 
                                    onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div className="input">
                                <img src={password_icon} alt="" />
                                <input type="password" placeholder='Password' value={password}
                                    onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </>
                    )}

                    {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

                    {action === "Lost Password" && (
                        <div className="input">
                            <img src={email_icon} alt="" />
                            <input type="email" placeholder='Email' value={email} 
                                onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                    )}
                </div>

                {action === "Login" && (
                    <div className="forgot-password" onClick={() => setAction("Lost Password")}>
                        Lost Password? <span>Click Here!</span>
                    </div>
                )}

                <div className="submit-container">
                    {action === "Lost Password" ? (
                        <>
                            <div className="submit" onClick={handleLostPassword} >Send Request</div>
                            <div className="submit gray" onClick={() => setAction("Login")}>Back</div>
                        </>
                    ) : (
                        <>
                            <div className={action === "Login" ? "submit gray" : "submit"} 
                                onClick={() => { setAction("Sign Up"); 
                                    if (action === "Sign Up") {
                                        handleRegister();
                                    }
                                }}>Sign Up</div>

                            <div className={action === "Sign Up" ? "submit gray" : "submit"}
                                onClick={() => { setAction("Login"); 
                                    if (action === "Login") {
                                        handleLogin();
                                    }
                                } }>Login</div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}