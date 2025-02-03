import "../assets/css/Cart.css";
import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import ProductDetails from "../components/ProductDetails";
import { getErrorMessage } from "../utils/ErrorHandler";
import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { FaPlus, FaMinus } from "react-icons/fa";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useNavigate } from 'react-router-dom';

export const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [method, setMethod] = useState("cash");
    const [discountCode, setDiscountCode] = useState("");
    const [discountPrice, setDiscountPrice] = useState(0);
    const [paymentPrice, setPaymentPrice] = useState(0);

    const [loading, setLoading] = useState(false);
    const [isModalOpenDetails, setIsModalOpenDetails] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [isModalOpenOrder, setIsModalOpenOrder] = useState(false);

    const [alert, setAlert] = useState(null);

    const navigate = useNavigate();

    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("token");

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {

        if (!customerId || !token) {
            showAlert("You need to log in to view your cart", "warning")
            setLoading(false);
            return;
        }

        api.get(`carts/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                const items = response.data.data
                setCartItems(items);

                const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
                setTotalPrice(totalPrice);

                const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
                setTotalQuantity(totalQuantity);

                setLoading(false);
            })
            .catch(error => {
                setLoading(false);

                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }, [customerId, token]);

    const minusQuantity = (cartId, productId) => {
        api.delete(
            `carts/remove/${cartId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                setCartItems(prevItems => {
                    const updatedItems = prevItems
                        .map(item =>
                            item.productId === productId
                                ? { ...item, quantity: item.quantity - 1, totalPrice: (item.quantity - 1) * item.price }
                                : item
                        )
                        .filter(item => item.quantity > 0);

                    const totalPrice = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
                    setTotalPrice(totalPrice);

                    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
                    setTotalQuantity(totalQuantity);

                    return updatedItems;
                });

                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }

    const plusQuantity = (productId) => {
        api.post(`carts/add/${customerId}/${productId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setCartItems(prevItems => {
                    const updatedItems = prevItems.map(item =>
                        item.productId === productId
                            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.price }
                            : item
                    );

                    const totalPrice = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
                    setTotalPrice(totalPrice);

                    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
                    setTotalQuantity(totalQuantity);

                    return updatedItems;
                });

                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }

    const applyDiscount = () => {
        api.post(`/discounts/apply`, {
            code: discountCode,
            price: totalPrice
        }, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                setDiscountPrice(response.data.discountPrice);
                setPaymentPrice(response.data.paymentPrice)
                showAlert("Discount applied successfully", "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    const handleConfirmOrder = () => {

        const isPaid = false

        if(method !== "cash") {
            
            // xử lý trong trường hợp thanh toán online, sau đó cập nhật isPaid nếu thành công
            showAlert("xử lý thanh toán online (chưa code)", "warning")
        }

        console.log("totalQuantity:" + totalQuantity)
        console.log("totalPrice:" + totalPrice)
        console.log("method:" + method)
        console.log("isPaid:" + isPaid)
        console.log("discountCode:" + discountCode)
        console.log("discountPrice:" + discountPrice)
        console.log("paymentPrice:" + paymentPrice)

        // thực hiện gọi api đặt hàng ở đây

        // chuyển hướng về /shop nếu thanh toán thành công (kèm thông báo)
        closeModalOrder()
        navigate("/shop", { 
            replace: true,
            state: { alertMessage: "Chưa code thanh toán", statusMessage: "warning" }
        });
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="cart-actions">
                <Button icon={<FaMinus />} className="p-button-text p-button-sm" onClick={() => minusQuantity(rowData._id, rowData.productId)} />
                <Button icon={<FaPlus />} className="p-button-text p-button-sm" onClick={() => plusQuantity(rowData.productId)} />
                <Button label="Details" className="p-button-outlined p-button-sm" onClick={() => handleProductClick(rowData.productId)} />
            </div>
        );
    };

    const handleProductClick = (id) => {
        setSelectedProductId(id);
        setIsModalOpenDetails(true);
    };

    const closeModalDetails = () => {
        setIsModalOpenDetails(false);
    };

    const handleOrderNow = () => {
        setDiscountCode("")
        setDiscountPrice(0)
        setPaymentPrice(totalPrice)
        setIsModalOpenOrder(true);
    };

    const closeModalOrder = () => {
        setDiscountCode("")
        setDiscountPrice(0)
        setPaymentPrice(totalPrice)
        setIsModalOpenOrder(false);
    };

    return (
        <>
            <div className="cart-container">
                <h2>Shopping Cart</h2>

                <DataTable value={cartItems} loading={loading} responsiveLayout="scroll">
                    <Column
                        header="Image"
                        body={(data) => (
                            <img
                                src={data.url_image || "/default-product.jpg"}
                                alt={data.productName}
                                style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                            />
                        )}
                    ></Column>
                    <Column field="productName" header="Name"></Column>
                    <Column field="price" header="Price" body={(data) => data.price.toLocaleString() + " VND"}></Column>
                    <Column field="quantity" header="Quantity"></Column>
                    <Column field="totalPrice" header="Total" body={(data) => data.totalPrice.toLocaleString() + " VND"}></Column>
                    <Column header="Actions" body={actionBodyTemplate}></Column>
                </DataTable>

                <div className="cart-summary">
                    <h3>Quantity: <span className="quantity-value">{totalQuantity}</span></h3>
                    <h3>Total: <span className="price-value">{totalPrice.toLocaleString()}</span> VND</h3>
                    <Button label="Order Now" className="p-button-success" onClick={handleOrderNow} />
                </div>
            </div>

            <ProductDetails
                visible={isModalOpenDetails}
                productId={selectedProductId}
                onClose={closeModalDetails}
            />

            <Dialog
                visible={isModalOpenOrder}
                style={{ width: '50vw' }}
                header="Order Summary"
                modal
                onHide={closeModalOrder}
            >
                <div>
                    <h4>Total Price: <span className="price-value">{totalPrice.toLocaleString()}</span> VND</h4>
                    <h4>Total Quantity: <span className="quantity-value">{totalQuantity}</span></h4>

                    <div className="p-field">
                        <label htmlFor="method">Payment Method</label>
                        <Dropdown
                            id="method"
                            value={method}
                            options={[{ label: 'Cash', value: 'cash' }, { label: 'VNPay', value: 'vnpay' }]}
                            onChange={(e) => setMethod(e.value)}
                            placeholder="Select a method"
                        />
                    </div>

                    <div className="p-field">
                        <label htmlFor="discountCode">Discount Code</label>
                        <div className="p-inputgroup">
                            <InputText
                                id="discountCode"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                placeholder="Enter discount code"
                            />
                            <Button label="Apply" onClick={applyDiscount} />
                        </div>
                    </div>

                    <h4>Discount Price: <span className="price-discount-value">{discountPrice.toLocaleString()}</span> VND</h4>
                    <h4>Payment Price: <span className="price-payment-value">{paymentPrice.toLocaleString()}</span> VND</h4>

                    <Button
                        label="Confirm Order"
                        className="p-button-success"
                        onClick={handleConfirmOrder}
                    />
                </div>

                {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
                
            </Dialog>

            {!isModalOpenOrder && alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </>
    );
};

export default Cart;
