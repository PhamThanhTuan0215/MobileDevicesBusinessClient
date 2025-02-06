import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import '../assets/css/AddProduct.css';
import AlertMessage from "../utils/AlertMessage";
import api from "../services/api";
import { getErrorMessage } from '../utils/ErrorHandler';

const AddProductModel = ({ visible, onClose }) => {
    const [productDetails, setProductDetails] = useState({
        name: '',
        brand: '',
        import_price: 0,
        retail_price: 0,
        amount: 0,
        detailsProduct: {
            os: '',
            ram: '',
            storage: '',
            battery: '',
            screen_size: '',
            color: '',
            description: ''
        },
        url_image: ''
    });
    
    const [selectedImage, setSelectedImage] = useState(null);

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const handleChange = (e, field, isDetails = false) => {
        setProductDetails(prevState => ({
            ...prevState,
            [isDetails ? 'detailsProduct' : field]: isDetails
                ? { ...prevState.detailsProduct, [field]: e.target.value }
                : e.target.value
        }));
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const handleSave = () => {
        if (!productDetails) return;

        if (
            !productDetails.name ||
            !productDetails.brand ||
            !productDetails.import_price ||
            !productDetails.retail_price ||
            !productDetails.amount ||
            !productDetails.detailsProduct.os ||
            !productDetails.detailsProduct.ram ||
            !productDetails.detailsProduct.storage ||
            !productDetails.detailsProduct.battery ||
            !productDetails.detailsProduct.screen_size ||
            !productDetails.detailsProduct.color ||
            !productDetails.detailsProduct.description
        ) {
            showAlert("Please fill in all fields.", "warning");
            return;
        }

        if (
            productDetails.import_price <= 0 ||
            productDetails.retail_price <= 0 ||
            productDetails.amount <= 0
        ) {
            showAlert("Import price, retail price, and stock must be greater than 0.", "warning");
            return;
        }

        if (!selectedImage) {
            showAlert("Please select image.", "warning");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("name", productDetails.name);
        formData.append("brand", productDetails.brand);
        formData.append("import_price", productDetails.import_price);
        formData.append("retail_price", productDetails.retail_price);
        formData.append("amount", productDetails.amount);

        formData.append("os", productDetails.detailsProduct.os);
        formData.append("ram", productDetails.detailsProduct.ram);
        formData.append("storage", productDetails.detailsProduct.storage);
        formData.append("battery", productDetails.detailsProduct.battery);
        formData.append("screen_size", productDetails.detailsProduct.screen_size);
        formData.append("color", productDetails.detailsProduct.color);
        formData.append("description", productDetails.detailsProduct.description);
        formData.append("image", selectedImage);

        setLoading(true)
        api.post(`/products/add`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        })
            .then(response => {
                setLoading(false)
                const addProduct = response.data.data.product;
                onClose(true, response.data.message, addProduct);
            })
            .catch(error => {
                setLoading(false)
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <Dialog
            visible={visible}
            onHide={onClose}
            header="Add Product"
            style={{ width: '50vw' }}
        >
            <div className="product-edit-form">
                <h3>Basic Information</h3>
                <div className="p-field">
                    <label>Name</label>
                    <InputText value={productDetails.name} onChange={(e) => handleChange(e, "name")} />
                </div>
                <div className="p-field">
                    <label>Brand</label>
                    <InputText value={productDetails.brand} onChange={(e) => handleChange(e, "brand")} />
                </div>
                <div className="p-field">
                    <label>Import Price</label>
                    <InputNumber value={productDetails.import_price} onValueChange={(e) => handleChange(e, "import_price")} />
                </div>
                <div className="p-field">
                    <label>Retail Price</label>
                    <InputNumber value={productDetails.retail_price} onValueChange={(e) => handleChange(e, "retail_price")} />
                </div>
                <div className="p-field">
                    <label>Stock</label>
                    <InputNumber value={productDetails.amount} onValueChange={(e) => handleChange(e, "amount")} />
                </div>

                <h3>Details</h3>
                <div className="p-field">
                    <label>OS</label>
                    <InputText value={productDetails.detailsProduct.os} onChange={(e) => handleChange(e, "os", true)} />
                </div>
                <div className="p-field">
                    <label>RAM</label>
                    <InputText value={productDetails.detailsProduct.ram} onChange={(e) => handleChange(e, "ram", true)} />
                </div>
                <div className="p-field">
                    <label>Storage</label>
                    <InputText value={productDetails.detailsProduct.storage} onChange={(e) => handleChange(e, "storage", true)} />
                </div>
                <div className="p-field">
                    <label>Battery</label>
                    <InputText value={productDetails.detailsProduct.battery} onChange={(e) => handleChange(e, "battery", true)} />
                </div>
                <div className="p-field">
                    <label>Screen Size</label>
                    <InputText value={productDetails.detailsProduct.screen_size} onChange={(e) => handleChange(e, "screen_size", true)} />
                </div>
                <div className="p-field">
                    <label>Color</label>
                    <InputText value={productDetails.detailsProduct.color} onChange={(e) => handleChange(e, "color", true)} />
                </div>
                <div className="p-field">
                    <label>Description</label>
                    <InputTextarea rows={3} value={productDetails.detailsProduct.description} onChange={(e) => handleChange(e, "description", true)} />
                </div>
                <div className="p-field image-upload-container">
                    <label>Image</label>
                    <div className="image-preview">
                        {selectedImage ? (
                            <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="image-preview-img" />
                        ) : productDetails?.url_image ? (
                            <img src={productDetails.url_image} alt="Current Product" className="image-preview-img" />
                        ) : (
                            <span className="image-placeholder">No image selected</span>
                        )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="image-upload-input" />
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

export default AddProductModel;
