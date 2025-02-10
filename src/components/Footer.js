import React from 'react';
import '../assets/css/Footer.css';

const Footer = () => {
    const email_contact_1 = process.env.REACT_APP_EMAIL_CONTACT_THANH
    const email_contact_2 = process.env.REACT_APP_EMAIL_CONTACT_TUAN

    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; Thanh & Tuan mobile phone store.</p>
                <p>Contact us at: {email_contact_1} or {email_contact_2}</p>
            </div>
        </footer>
    );
};

export default Footer;