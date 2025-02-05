import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

import React, { useState, useEffect } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import '../assets/css/ProductReviews.css';
import AlertMessage from "../utils/AlertMessage";
import api from "../services/api";
import { getErrorMessage } from '../utils/ErrorHandler';
import { AiOutlineDelete } from "react-icons/ai";

const CustomRating = ({ value }) => {
    const fullStars = Math.floor(value);
    const halfStar = value % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
        <div className="custom-rating">
            {[...Array(fullStars)].map((_, index) => (
                <span key={`full-${index}`} className="star full">★</span>
            ))}
            {halfStar > 0 && <span className="star half">★</span>}
            {[...Array(emptyStars)].map((_, index) => (
                <span key={`empty-${index}`} className="star empty">★</span>
            ))}
        </div>
    );
};

const ProductReviewModal = ({ productId }) => {
    const [reviews, setReviews] = useState([]);

    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);

    const [ratingAvg, setRatingAvg] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "guest";


    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        if (productId) {
            setLoading(true);
            api.get(`/reviews/${productId}`)
            .then(response => {
                const reviewItems = response.data.data;
            
                setReviews(reviewItems);
                setTotalReviews(reviewItems.length);
            
                // Tính rating trung bình
                const totalRating = reviewItems.reduce((sum, review) => sum + review.rating, 0);
                const averageRating = reviewItems.length > 0 ? totalRating / reviewItems.length : 0;
                setRatingAvg(averageRating);
            
                setLoading(false);
            })
                .catch(error => {
                    setLoading(false);
                    const { message, statusMessage } = getErrorMessage(error.response);
                    showAlert(message, statusMessage);
                });
        }

    }, [productId]);

    const handleAddReview = () => {

        if (!token) {
            return showAlert("You need to login", "info");
        }

        if (role !== "customer") {
            return showAlert("Only customers can review", "info");
        }

        if (rating === 0) {
            return showAlert("Please select a rating", "info");
        }

        if (!comment.trim()) {
            return showAlert("Comment cannot be empty", "info");
        }

        api.post(`reviews/add/${customerId}/${productId}`, { comment, rating }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setComment("");
                setRating(0);

                const newReview = response.data.data;

                setReviews(prevReviews => {
                    const existingIndex = prevReviews.findIndex(review => review._id === newReview._id);

                    if (existingIndex !== -1) {

                        return prevReviews.map(review =>
                            review._id === newReview._id ? newReview : review
                        );
                    } else {
                        return [newReview, ...prevReviews];
                    }
                });

                showAlert(response.data.message, "success");
            })

            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };


    const handleDeleteReview = (reviewId) => {
        if (!token) {
            return showAlert("You need to login", "info");
        }

        let path = `reviews/delete/${customerId}/${reviewId}`
        if (role === "manager" || role === "admin") {
            path = `reviews/delete-by-manager/${reviewId}`
        }

        api.delete(path, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));

                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    useEffect(() => {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        setRatingAvg(averageRating);
        setTotalReviews(reviews.length)

    }, [reviews]);

    return (
        <>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <h2>Product Reviews</h2>

                    <div className="review-summary">
                        {ratingAvg !== 0 && <p><strong>Average Rating:</strong> {ratingAvg.toFixed(1)} / 5</p>}
                        <p><strong>Total Reviews:</strong> {totalReviews}</p>
                    </div>

                    <div className="product-reviews-container">
                        {/* Hiển thị danh sách reviews nếu có */}
                        {reviews.length > 0 ? (
                            <div className="product-reviews">
                                {reviews.map(review => (
                                    <div key={review._id} className="review-item">
                                        <p className="customer-name">{review.customerName}</p>
                                        <CustomRating value={review.rating} />
                                        <p className="review-comment">"{review.comment}"</p>
                                        {(role === "manager" || role === "admin" || review.customerId === customerId) && (
                                            <AiOutlineDelete
                                                className="delete-icon"
                                                onClick={() => handleDeleteReview(review._id)}
                                                title="Delete review"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No reviews available for this product.</p>
                        )}

                        {/* Luôn hiển thị phần nhập đánh giá */}
                        <div className="add-review-section">
                            <h4>Add a Review</h4>
                            <Rating
                                value={rating}
                                onChange={(e) => setRating(e.value)}
                                cancel={false}
                                className="review-rating"
                            />
                            <InputTextarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                placeholder="Write your review..."
                                className="review-textarea"
                            />
                            <Button label="Submit" icon="pi pi-send" onClick={handleAddReview} className="submit-button" />
                        </div>
                    </div>
                </div>
            )}


            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </>
    );

};

export default ProductReviewModal;
