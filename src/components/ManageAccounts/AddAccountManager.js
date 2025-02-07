import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from "primereact/dropdown";
import '../../assets/css/AddProduct.css';
import AlertMessage from "../../utils/AlertMessage";
import api from "../../services/api";
import { getErrorMessage } from '../../utils/ErrorHandler';

const AddAccountManagerModel = ({ visible, onClose }) => {
    const [AccountDetails, setAccountDetails] = useState({
        name: '',
        email: '',
        address: "",
        phone: "",
        role: "",
    });
    

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const handleChange = (e, field) => {
        setAccountDetails(prevState => ({
            ...prevState,
            [field]: e.target.value
        }));
    };


    const handleSave = () => {
        if (!AccountDetails) return;

        if (!AccountDetails.name || !AccountDetails.email || !AccountDetails.address || !AccountDetails.phone || !AccountDetails.role) {
            showAlert("Please fill in all fields.", "warning");
            return;
        }

        const token = localStorage.getItem("token");
        
        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        const requestData = {
            name: AccountDetails.name,
            email: AccountDetails.email,
            address: AccountDetails.address,
            phone: AccountDetails.phone,
            role: AccountDetails.role
        };

        setLoading(true);
        api.post(`/managers`, requestData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        })
        .then(response => {
            setLoading(false);
            const addAccount = response.data.data;
            onClose(true, response.data.message, addAccount);
        })
        .catch(error => {
            setLoading(false);
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        });
    };

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <Dialog
            visible={visible}
            onHide={onClose}
            header="Add Account"
            style={{ width: '50vw' }}
        >
            <div className="account-edit-form">
                <h3>Account Information</h3>
                <div className="p-field">
                    <label>Name</label>
                    <InputText value={AccountDetails.name} onChange={(e) => handleChange(e, "name")} />
                </div>
                <div className="p-field">
                    <label>Email</label>
                    <InputText value={AccountDetails.email} onChange={(e) => handleChange(e, "email")} />
                </div>
                <div className="p-field">
                    <label>Address</label>
                    <InputText value={AccountDetails.address} onChange={(e) => handleChange(e, "address")} />
                </div>
                <div className="p-field">
                    <label>Phone</label>
                    <InputText value={AccountDetails.phone} onChange={(e) => handleChange(e, "phone")} />
                </div>
                <div className="p-field">
                    <label>Role</label>
                    <Dropdown 
                        value={AccountDetails.role} 
                        options={[{ label: "Admin", value: "admin" }, { label: "Manager", value: "manager" }]} 
                        onChange={(e) => handleChange(e, "role")} 
                    />
                </div>
    
                <div className="p-dialog-footer">
                    <Button label="Save" className="p-button-success" onClick={handleSave} />
                    <Button label="Cancel" className="p-button-secondary" onClick={onClose} />
                </div>
            </div>
            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </Dialog>
    );    
};

export default AddAccountManagerModel;