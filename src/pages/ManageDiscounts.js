import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../assets/css/ManageProducts.css';

import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';
import AddDiscount from "../components/ManageDiscounts/AddDiscount";
import EditDiscount from "../components/ManageDiscounts/EditDiscount";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { FaTrash, FaEdit } from 'react-icons/fa';

export const ManageDiscounts = () => {

    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const rowsPerPage = 5;


    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [selectedDiscountIdEdit, setSelectedDiscountIdEdit] = useState(null);

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
        api.get(`/discounts`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setDiscounts(response.data.data);
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

    const addProductModel = () => {
        setIsModalOpenAdd(true)
    };

    const closeModalAdd = (isAdded = false, message = "", addedDiscount = null) => {

        if (isAdded === true) {
            setDiscounts(prevDiscounts => {
                const updatedDiscounts = [...prevDiscounts, addedDiscount];
                setTotalRecords(updatedDiscounts.length);
                return updatedDiscounts;
            });

            showAlert(message, "success");
        }

        setIsModalOpenAdd(false);
    };

    const editDiscount = (rowData) => {
        setSelectedDiscountIdEdit(rowData._id);
        setIsModalOpenEdit(true);
    };

    const closeModalEdit = (isUpdated = false, message = "", updatedDiscounts = null) => {

        if (isUpdated === true) {
            setDiscounts(prevDiscounts =>
                prevDiscounts.map(discount =>
                    discount._id === updatedDiscounts._id ? updatedDiscounts : discount
                )
            );

            showAlert(message, "success");
        }

        setIsModalOpenEdit(false);
    };

    const deleteDiscount = (rowData) => {
        if (!window.confirm("Are you sure you want to delete this discount?")) return;

        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        api.delete(
            `discounts/${rowData._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                setDiscounts(prevDiscounts =>
                    prevDiscounts.filter(discount => discount._id !== rowData._id)
                );

                setTotalRecords(prev => prev - 1);

                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="action-buttons">
                <Button className="p-button-sm p-button-warning" onClick={() => editDiscount(rowData)} ><FaEdit /></Button>
                <Button className="p-button-sm p-button-danger" onClick={() => deleteDiscount(rowData)} ><FaTrash /></Button>
            </div>
        );
    };

    if (loading) return <div className="loading-spinner"></div>;
    return (
        <div className="products">

            <AddDiscount
                visible={isModalOpenAdd}
                onClose={closeModalAdd}
            />

            <EditDiscount
                visible={isModalOpenEdit}
                discountId={selectedDiscountIdEdit}
                onClose={closeModalEdit}
            />

            <Button label="Add New Discount" className="p-button-sm p-button-success add-button" onClick={() => addProductModel()} />;

            {discounts.length === 0 ? (
                <p>No products available.</p>
            ) : (
                <>
                    <DataTable value={discounts.slice(first, first + rowsPerPage)} paginator={false} responsiveLayout="scroll">
                        <Column field="code" header="Code" sortable />
                        <Column field="type" header="Type" sortable />
                        <Column field="value" header="Value" sortable />
                        <Column field="start_date" header="Start date" sortable />
                        <Column field="end_date" header="End_date" sortable />
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

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    );
}