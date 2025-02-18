import React, { useState, useEffect } from "react";
import '../assets/css/Profile.css';
import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import { getErrorMessage } from "../utils/ErrorHandler";
import ChangePassword from "../components/ChangePassword";

export const Profile = () => {

    const customerId = localStorage.getItem("customerId");
    const managerId = localStorage.getItem("managerId");
    const token = localStorage.getItem("token");

    const [user, setUser] = useState({
        name: "",
        phone: "",
        address: "",
        email: "",
        url_avatar: ""
    });
    
    const [previewAvatar, setPreviewAvatar] = useState(user.url_avatar);
    // const [showAvatarPopup, setShowAvatarPopup] = useState(false);
    const [alert, setAlert] = useState(null);
    const [isModalOpenPassword, setIsModalOpenPassword] = useState(false);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };
    
    useEffect(() => {
        const customerId = localStorage.getItem("customerId");
        const managerId = localStorage.getItem("managerId");
        let url_api = "";
        if (!customerId){
            url_api = "/managers/" + managerId;
        }
        else{
            url_api = "/customers/" + customerId;
        }
        const fetchUserData = async () => {
            try {
                const response = await api.get(url_api);
                setUser(response.data.data);
                setPreviewAvatar(response.data.data.url_avatar);
            } catch (error) {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            }
        };
        fetchUserData();
    }, []);

    const handleUpdateProfile = async () => {

        const { name, phone, address, email, url_avatar } = user;

        if (!name || !phone || !address || !email || !url_avatar) {
            showAlert("Please fill in all fields!", "warning");
            return; 
        }

        let url_api = "";
        if (!customerId){
            url_api = "/managers/" + managerId;
        }
        else{
            url_api = "/customers/" + customerId;
        }

        try {
            await api.patch(url_api, user,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAlert({ type: "success", message: "Profile updated successfully!" });
        } catch (error) {
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    };

    const PasswordModel = () => {
        setIsModalOpenPassword(true)
    };

    const closeModalPassword = (isAdded = false, message = "") => {

        if (isAdded === true) {
            showAlert(message, "success");
        }

        setIsModalOpenPassword(false);
    };


    // const handleAvatarChange = async (e) => {
    //     const file = e.target.files[0];
    //     if (!file) return;
        
    //     const formData = new FormData();
    //     formData.append("avatar", file);
        
    //     try {
    //         const response = await api.post("/user/upload-avatar", formData);
    //         setUser({ ...user, avatar: response.data.avatar });
    //         setPreviewAvatar(response.data.avatar);
    //         setAlert({ type: "success", message: "Avatar updated successfully!" });
    //         setShowAvatarPopup(false);
    //     } catch (error) {
    //         const { message, statusMessage } = getErrorMessage(error.response);
    //         showAlert(message, statusMessage);
    //     }
    // };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };
    
    return (
        <>
            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            <div className="profile-container">
                <ChangePassword
                    visible={isModalOpenPassword}
                    onClose={closeModalPassword}
                />
                <h2>Profile</h2>
                <div className="profile-avatar">
                    <img src={previewAvatar} alt="Avatar" />
                    {/* <button onClick={() => setShowAvatarPopup(true)}>Update Avatar</button> */}
                </div>
                <div className="profile-info">
                    <label>Email:</label>
                    <input type="text" value={user.email} disabled />
                    <label>Name:</label>
                    <input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                    <label>Address:</label>
                    <input type="text" value={user.address} onChange={(e) => setUser({ ...user, address: e.target.value })} />
                    <label>Phone:</label>
                    <input type="text" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
                    <button onClick={handleUpdateProfile}>Update Information</button>
                </div>
                <button className="change-password-btn" onClick={() => PasswordModel()}>
                    Change Password
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
                {/* {showAvatarPopup && (
                    <div className="avatar-popup">
                        <div className="popup-content">
                            <h3>Update Avatar</h3>
                            <input type="file" accept="image/*" onChange={handleAvatarChange} />
                            <div className="popup-buttons">
                                <button className="confirm-btn">Confirm</button>
                                <button className="cancel-btn" onClick={() => {setShowAvatarPopup(false); setPreviewAvatar(user.avatar)}}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )} */}
            </div>
        </>
    );
};