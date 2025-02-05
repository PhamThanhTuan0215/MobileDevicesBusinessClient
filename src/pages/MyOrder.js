import '../assets/css/MyOrder.css';
import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';
import OrderDetails from "../components/OrderDetails";

export const MyOrder = () => {
    const [orders, setOrders] = useState([]);
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("token");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

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
                setOrders(response.data.data);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }, [customerId, token]);

    const handleCancelOrder = (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        api.delete(
            `orders/cancel/${orderId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                setOrders(prevOrders => prevOrders.map(order =>
                    order._id === orderId ? { ...order, status: "canceled" } : order
                ));

                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });

        console.log("Cancel Order: " + orderId);
    };

    const handleViewOrderClick = (id) => {
        setSelectedOrderId(id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (loading) return <div className="loading">Loading orders...</div>;

    return (
        <div className="my-orders">
            <h2>My Orders</h2>

            {orders.length === 0 ? (
                <p>You have no orders yet.</p>
            ) : (
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Details</th>
                            <th>Date</th>
                            <th>Total Quantity</th>
                            <th>Total Price</th>
                            <th>Discount</th>
                            <th>Payment Price</th>
                            <th>Method</th>
                            <th>Paid</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id}>
                                <td>
                                    <button className="details-button" onClick={() => handleViewOrderClick(order._id)}>
                                        View
                                    </button>
                                </td>
                                <td>{new Date(order.creation_date).toLocaleDateString()}</td>
                                <td>{order.totalQuantity}</td>
                                <td>{order.totalPrice.toLocaleString()} VND</td>
                                <td>{order.discountPrice.toLocaleString()} VND</td>
                                <td className='payment-price'>{order.paymentPrice.toLocaleString()} VND</td>
                                <td>{order.method}</td>
                                <td className={order.isPaid ? "paid" : "unpaid"}>
                                    {order.isPaid ? "Paid" : "Unpaid"}
                                </td>
                                <td className={`status ${order.status}`}>{order.status}</td>
                                <td>
                                    {(order.status === "processing" || order.status === "delivering") && (
                                        <button className="cancel-button" onClick={() => handleCancelOrder(order._id)}>
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>

            )}

            <OrderDetails
                visible={isModalOpen}
                orderId={selectedOrderId}
                onClose={closeModal}
            />

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    );
};
