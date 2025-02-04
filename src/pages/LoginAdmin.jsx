import React, { useState } from 'react';
import '../assets/css/Login.css';
import { jwtDecode } from "jwt-decode"
import AlertMessage from "../utils/AlertMessage"
import { getErrorMessage } from "../utils/ErrorHandler";
import api from "../services/api";

import password_icon from '../assets/image/password.png';
import email_icon from '../assets/image/email.png';

export const LoginAdmin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await api.post('managers/login', {
                email,
                password
            });

            if (response.status === 200) {
                const token = response.data.data.token;
                if (token) {
                    const decoded = jwtDecode(token);
                    localStorage.setItem('role', decoded.role);
                    localStorage.setItem('customerId', decoded.manager.id);
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

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <>
            <div className='container'>
                <div className="header">
                    <div className="text">Login</div>
                    <div className="underline"></div>
                </div>

                <div className="inputs">
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

                    {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
                </div>

                <div className="submit-container">
                    <div className="submit" onClick={handleLogin}>Login</div>
                </div>
            </div>
        </>
    )
}