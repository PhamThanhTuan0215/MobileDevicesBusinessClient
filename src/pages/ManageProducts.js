import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../assets/css/ManageProducts.css';

import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';
import ProductDetails from "../components/ProductDetails";
import AddProduct from "../components/AddProduct";
import EditProduct from "../components/EditProduct";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { FaTrash, FaEdit } from 'react-icons/fa';

export const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const rowsPerPage = 5;

    const [isModalOpenDetails, setIsModalOpenDetails] = useState(false);
    const [selectedProductIdDetails, setSelectedProductIdDetails] = useState(null);

    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [selectedProductIdEdit, setSelectedProductIdEdit] = useState(null);

    const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);

    const managerId = localStorage.getItem("managerId");
    const token = localStorage.getItem("token");

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        if (!managerId || !token) {
            return showAlert("You need to login", "warning");
        }

        setLoading(true);
        api.get(`/products`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setProducts(response.data.data);
                setTotalRecords(response.data.data.length);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }, [managerId, token]);

    const onPageChange = (event) => {
        setFirst(event.first);
    };

    const imageBodyTemplate = (rowData) => {
        return <img src={rowData.url_image} alt={rowData.name} style={{ width: '50px', borderRadius: '5px' }} />;
    };

    const viewDetails = (rowData) => {
        setSelectedProductIdDetails(rowData._id);
        setIsModalOpenDetails(true);
    };

    const closeModalDetails = () => {
        setIsModalOpenDetails(false);
    };

    const addProductModel = () => {
        setIsModalOpenAdd(true)
    };

    const closeModalAdd = (isAdded = false, message = "", addedProduct = null) => {

        if (isAdded === true) {
            setProducts(prevProducts => {
                const updatedProducts = [...prevProducts, addedProduct];
                setTotalRecords(updatedProducts.length);
                return updatedProducts;
            });

            showAlert(message, "success");
        }

        setIsModalOpenAdd(false);
    };

    const editProduct = (rowData) => {
        setSelectedProductIdEdit(rowData._id);
        setIsModalOpenEdit(true);
    };

    const closeModalEdit = (isUpdated = false, message = "", updatedProduct = null) => {

        if (isUpdated === true) {
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product._id === updatedProduct._id ? updatedProduct : product
                )
            );

            showAlert(message, "success");
        }

        setIsModalOpenEdit(false);
    };

    const deleteProduct = (rowData) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        api.delete(
            `products/delete/${rowData._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                setProducts(prevProducts =>
                    prevProducts.filter(product => product._id !== rowData._id)
                );

                setTotalRecords(prev => prev - 1);

                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    const detailsBodyTemplate = (rowData) => {
        return <Button label="View" className="p-button-sm p-button-info" onClick={() => viewDetails(rowData)} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="action-buttons">
                <Button className="p-button-sm p-button-warning" onClick={() => editProduct(rowData)} ><FaEdit /></Button>
                <Button className="p-button-sm p-button-danger" onClick={() => deleteProduct(rowData)} ><FaTrash /></Button>
            </div>
        );
    };

    if (loading) return <div className="loading-spinner"></div>;
    return (
        <div className="products">

            <AddProduct
                visible={isModalOpenAdd}
                onClose={closeModalAdd}
            />

            <EditProduct
                visible={isModalOpenEdit}
                productId={selectedProductIdEdit}
                onClose={closeModalEdit}
            />

            <Button label="Add New Product" className="p-button-sm p-button-success add-button" onClick={() => addProductModel()} />;

            {products.length === 0 ? (
                <p>No products available.</p>
            ) : (
                <>
                    <DataTable value={products.slice(first, first + rowsPerPage)} paginator={false} responsiveLayout="scroll">
                        <Column field="name" header="Product Name" sortable />
                        <Column body={imageBodyTemplate} header="Image" />
                        <Column field="brand" header="Brand" sortable />
                        <Column
                            field="import_price"
                            header="Import Price (VND)"
                            body={(rowData) => rowData.import_price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                            sortable
                        />
                        <Column
                            field="retail_price"
                            header="Retail Price (VND)"
                            body={(rowData) => rowData.retail_price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                            sortable
                        />

                        <Column field="amount" header="Stock" sortable />
                        <Column body={detailsBodyTemplate} header="Details" />
                        <Column body={actionBodyTemplate} header="Action" />
                    </DataTable>

                    <Paginator
                        first={first}
                        rows={rowsPerPage}
                        totalRecords={totalRecords}
                        onPageChange={onPageChange}
                    />
                </>
            )}

            <ProductDetails
                visible={isModalOpenDetails}
                productId={selectedProductIdDetails}
                onClose={closeModalDetails}
            />

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    );
};
