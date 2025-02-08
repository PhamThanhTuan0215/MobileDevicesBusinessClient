import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import '../assets/css/OrderDetails.css'
import AlertMessage from "../utils/AlertMessage"
import api from "../services/api";
import { getErrorMessage } from '../utils/ErrorHandler';

const OrderDetailModal = ({ visible, orderId, onClose, isStats = false }) => {
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(true);

    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            showAlert("You need to log in", "warning")
            setLoading(false);
            return;
        }

        if (orderId) {
            setLoading(true);
            let path = `orders/details/${orderId}`
            if (isStats === true) {
                path = `reports/orders/details/${orderId}`
            }

            api.get(path, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    setOrderDetails(response.data.data);
                    setLoading(false);
                })
                .catch(error => {
                    setLoading(false);

                    const { message, statusMessage } = getErrorMessage(error.response);
                    showAlert(message, statusMessage);
                });
        }

    }, [isStats, orderId, visible]);

    return (
        <Dialog
            visible={visible}
            onHide={onClose}
            header="Order Details"
            style={{ width: '80vw' }}

        >
            {loading ? (
                <p>Loading...</p>
            ) : orderDetails.length > 0 ? (
                <table className="order-details-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Product Name</th>
                            {isStats && (
                                <>
                                    <th>Import Price</th>
                                    <th>Total Import Price</th>
                                </>
                            )}
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total Price</th>
                            {isStats && (
                                <>
                                    <th>
                                        Profit <br />
                                        <small style={{ color: "red", fontSize: "12px" }}><i>(Discount not included)</i></small>
                                    </th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {orderDetails.map(detail => (
                            <tr key={detail._id}>
                                <td>
                                    <img
                                        src={detail.url_image}
                                        alt={detail.productName}
                                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                                    />
                                </td>
                                <td>{detail.productName}</td>
                                {isStats && (
                                    <>
                                        <td>{detail.importPrice.toLocaleString()} VND</td>
                                        <td>{detail.totalImportPrice.toLocaleString()} VND</td>
                                    </>
                                )}
                                <td>{detail.price.toLocaleString()} VND</td>
                                <td>{detail.quantity}</td>
                                <td>{detail.totalPrice.toLocaleString()} VND</td>
                                {isStats && (
                                    <>
                                        <td style={{ color: "#28a745", fontWeight: "bold" }}>{detail.profit.toLocaleString()} VND</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

            ) : (
                <p>No details available for this order.</p>
            )}

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </Dialog>
    );
};

export default OrderDetailModal;
