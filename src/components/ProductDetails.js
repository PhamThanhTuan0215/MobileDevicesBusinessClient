import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import '../assets/css/ProductDetails.css'
import AlertMessage from "../utils/AlertMessage"
import api from "../services/api";
import { getErrorMessage } from '../utils/ErrorHandler';

const ProductDetailModal = ({ visible, productId, onClose }) => {
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        if (productId) {
            setLoading(true);
            api.get(`/products/details/${productId}`)
                .then(response => {
                    setProductDetails(response.data.data);
                    setLoading(false);
                })
                .catch(error => {
                    setLoading(false);

                    const { message, statusMessage } = getErrorMessage(error.response);
                    showAlert(message, statusMessage);
                });
        }
    }, [productId, visible]);

    return (
        <Dialog
            visible={visible}
            onHide={onClose}
            header="Product Details"
            style={{ width: '80vw' }}

        >
            {loading ? (
                <p>Loading...</p>
            ) : productDetails ? (
                <div className="product-details">
                    <div className="product-content">

                        <div className="product-basic-info">
                            <h2 className="product-name">{productDetails.name}</h2>
                            <img src={productDetails.url_image} alt={productDetails.name} />
                            <p className="product-brand">{productDetails.brand}</p>
                            <p className="product-price">{productDetails.retail_price.toLocaleString()} VND</p>

                        </div>

                        <div className="product-details-info">
                            <h3>Details</h3>
                            <div className="detail-item">
                                <strong>OS:</strong> {productDetails.detailsProduct.os}
                            </div>
                            <div className="detail-item">
                                <strong>RAM:</strong> {productDetails.detailsProduct.ram}
                            </div>
                            <div className="detail-item">
                                <strong>Storage:</strong> {productDetails.detailsProduct.storage}
                            </div>
                            <div className="detail-item">
                                <strong>Battery:</strong> {productDetails.detailsProduct.battery}
                            </div>
                            <div className="detail-item">
                                <strong>Screen Size:</strong> {productDetails.detailsProduct.screen_size} inches
                            </div>
                            <div className="detail-item">
                                <strong>Color:</strong> {productDetails.detailsProduct.color}
                            </div>
                            <div className="product-description">
                                <strong>Description:</strong>
                                <p>{productDetails.detailsProduct.description}</p>
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <p>Product not found</p>
            )}

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </Dialog>
    );
};

export default ProductDetailModal;
