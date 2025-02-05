import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../assets/css/ManageProducts.css';

import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';
import ProductDetails from "../components/ProductDetails";

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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

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
        setSelectedProductId(rowData._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const addProductModel = () => {
        showAlert("Add product (chưa code)", "warning");
        console.log("Open Model Add Product");
    };

    const editProduct = (rowData) => {
        if (!managerId || !token) {
            return showAlert("You need to login", "warning");
        }

        api.get(`/products/details/${rowData._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                console.log(response.data.data)

                showAlert("Edit Product (chưa code)", "warning");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    const deleteProduct = (rowData) => {
        showAlert("Delete product (chưa code)", "warning");
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

    if (loading) return <div className="loading">Loading products...</div>;

    return (
        <div className="products">
            <Button label="Add New Product" className="p-button-sm p-button-success add-button" onClick={() => addProductModel()} />;

            {products.length === 0 ? (
                <p>No products available.</p>
            ) : (
                <>
                    <DataTable value={products.slice(first, first + rowsPerPage)} paginator={false} responsiveLayout="scroll">
                        <Column field="name" header="Product Name" sortable />
                        <Column body={imageBodyTemplate} header="Image" />
                        <Column field="brand" header="Brand" sortable />
                        <Column field="import_price" header="Import Price" sortable />
                        <Column field="retail_price" header="Retail Price" sortable />
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
                visible={isModalOpen}
                productId={selectedProductId}
                onClose={closeModal}
            />

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    );
};
