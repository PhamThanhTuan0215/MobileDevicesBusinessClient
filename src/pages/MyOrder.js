import '../assets/css/MyOrder.css';
import api from "../services/api";
import AlertMessage from "../utils/AlertMessage"
import React, { useState, useEffect } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';


export const MyOrder = () => {

    const [orders, setOrders] = useState([]); 
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("token");
    
    const [loading, setLoading] = useState(true);
    
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        setLoading(true);
        api.get(`/orders/my-orders/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setOrders(response.data.data)

                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }, [customerId, token]);

    if (loading) return <div className="loading">Loading wishlist...</div>;

    return (
        <>
            <div >
                {orders.length}
            </div>

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </>
    );
};
