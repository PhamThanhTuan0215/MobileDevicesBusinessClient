import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from "primereact/dropdown";
import '../../assets/css/EditProduct.css';
import AlertMessage from "../../utils/AlertMessage";
import api from "../../services/api";
import { getErrorMessage } from '../../utils/ErrorHandler';

const EditAccountCustomerModel = ({ visible, accountId, onClose }) => {
    const [AccountDetails, setAccountDetails] = useState(null);

    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        if (accountId) {
            setLoading(true);
            api.get(`/customers/${accountId}`)
                .then(response => {
                    setAccountDetails(response.data.data);
                    setLoading(false);
                })
                .catch(error => {
                    setLoading(false);
                    const { message, statusMessage } = getErrorMessage(error.response);
                    showAlert(message, statusMessage);
                });
        }
    }, [accountId, visible]);

    const handleChange = (e, field) => {
        setAccountDetails(prevState => ({
            ...prevState,
            [field]: e.target.value
        }));
    };


    const handleSave = () => {
        if (!AccountDetails) return;

        if (!AccountDetails.name || !AccountDetails.email || !AccountDetails.address || !AccountDetails.phone) {
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
            status: AccountDetails.status
        };

        setLoading(true);
        api.patch(`/customers/${accountId}`, requestData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        })
        .then(response => {
            setLoading(false);
            const editAccount = response.data.data;
            onClose(true, response.data.message, editAccount);
        })
        .catch(error => {
            setLoading(false);
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        });
    };


    return (
        <Dialog
            visible={visible}
            onHide={onClose}
            header="Edit Account"
            style={{ width: '50vw' }}
        >
            {loading ? (
                <div className="loading-spinner"></div>
            ) : AccountDetails ? (
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
                        <label>Status</label>
                        <Dropdown 
                            value={AccountDetails.status} 
                            options={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]} 
                            onChange={(e) => handleChange(e, "status")} 
                        />
                    </div>
        
                    <div className="p-dialog-footer">
                        <Button label="Save" className="p-button-success" onClick={handleSave} />
                        <Button label="Cancel" className="p-button-secondary" onClick={onClose} />
                    </div>
                </div>
            ) : (
                <p>Account not found</p>
            )}

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </Dialog>
    );
};

export default EditAccountCustomerModel;