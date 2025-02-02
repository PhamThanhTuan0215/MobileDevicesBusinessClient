import '../assets/css/Wishlist.css';
import api from "../services/api";
import AlertMessage from "../utils/AlertMessage"
import ProductDetails from "../components/ProductDetails";
import React, { useState, useEffect } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';

// Component hiển thị sản phẩm
const ProductCard = ({ product, onAddToCart, onRemoveFromWishlist, onClick }) => (
    <div className="product-card" onClick={() => onClick(product._id)}>
        <img src={product.url_image} alt={product.name} className="product-image" />
        <h2 className="product-name">{product.name}</h2>
        <p className="product-brand">{product.brand}</p>
        <p className="product-price">{product.retail_price.toLocaleString()} VND</p>
        <button className="remove-from-wishlist-button" onClick={(e) => {
            e.stopPropagation();
            onRemoveFromWishlist(product._id);
        }}>
            Remove from Wishlist
        </button>
        <button className="add-to-cart-button" onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product._id);
        }}>
            Add to Cart
        </button>
    </div>
);

export const Wishlist = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    
    const [loading, setLoading] = useState(true);
    
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {

        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("token");

        if (!customerId || !token) {
            showAlert("You need to log in to view your wishlist", "warning")
            setLoading(false);
            return;
        }

        api.get(`wishlists/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setProducts(response.data.data);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
        
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }, []);

    const handleRemoveFromWishlist = (productId) => {
        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("token");

        if (!customerId || !token) {
            showAlert("You need to log in", "warning")
            setLoading(false);
            return;
        }

        api.delete(
            `wishlists/remove/${customerId}/${productId}`, 
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {

                setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));

                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    const handleAddToCart = (productId) => {
        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("token");
    
        if (!customerId || !token) {
            showAlert("You need to log in", "warning");
            return;
        }

        api.post(`carts/add/${customerId}/${productId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                showAlert("Added to cart", "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    const handleProductClick = (id) => {
        setSelectedProductId(id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (loading) return <div className="loading">Loading wishlist...</div>;

    return (
        <>
            <div className="shop-container">

                <div className="product-grid">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onRemoveFromWishlist={handleRemoveFromWishlist}
                                onClick={handleProductClick}
                            />
                        ))
                    ) : (
                        <div className="no-products">
                            <p>There are no matching products.</p>
                        </div>
                    )}
                </div>

                <ProductDetails
                    visible={isModalOpen}
                    productId={selectedProductId}
                    onClose={closeModal}
                />
            </div>

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </>
    );
};
