import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../assets/css/ManageProducts.css';

import { TabMenu } from 'primereact/tabmenu';

import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';

import AddAccountManagerModel from '../components/ManageAccounts/AddAccountManager';
import EditAccountManagerModel from '../components/ManageAccounts/EditAccountManager';
import EditAccountCustomerModel from '../components/ManageAccounts/EditAccountCustomer';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { FaTrash, FaEdit } from 'react-icons/fa';
export const ManageAccounts = () => {

    const [managers, setManagers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const rowsPerPage = 5;

    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [selectedAccountIdEdit, setSelectedAccountIdEdit] = useState(null);

    const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);


    const managerId = localStorage.getItem("managerId");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const tabs = [
        ...(role !== "manager" ? [{ label: "Managers", icon: "pi pi-users" }] : []),
        { label: 'Customer', icon: 'pi pi-tags' }
    ];

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        if (!managerId || !token) {
            return showAlert("You need to login", "warning");
        }
    
        setLoading(true);
    
        const fetchCustomers = api.get(`/customers`, { headers: { Authorization: `Bearer ${token}` } });
        const fetchManagers = role !== "manager"
            ? api.get(`/managers`, { headers: { Authorization: `Bearer ${token}` } })
            : Promise.resolve({ data: { data: [] } });
    
        Promise.all([fetchCustomers, fetchManagers])
            .then(([customersResponse, managersResponse]) => {
                const customersData = customersResponse.data.data;
                const managersData = managersResponse.data.data;
    
                setCustomers(customersData);
                if (role !== "manager") {
                    setManagers(managersData);
                }
    
                // Xác định tab thực tế dựa trên role
                const adjustedIndex = role === "manager" ? activeIndex : activeIndex === 0 ? 0 : 1;
    
                if (adjustedIndex === 0) {
                    setTotalRecords(role === "manager" ? customersData.length : managersData.length);
                } else {
                    setTotalRecords(customersData.length);
                }
    
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }, [managerId, token, role, activeIndex]);
        

    const onPageChange = (event) => {
        setFirst(event.first);
    };

    const addAccountModel = () => {
        setIsModalOpenAdd(true)
    };

    const closeModalAddManager = (isAdded = false, message = "", addedAccount = null) => {

        if (isAdded === true) {
            setManagers(prevManagers => {
                const updatedAccounts = [...prevManagers, addedAccount];
                setTotalRecords(updatedAccounts.length);
                return updatedAccounts;
            });

            showAlert(message, "success");
        }

        setIsModalOpenAdd(false);
    };

    const editAccount = (rowData) => {
        setSelectedAccountIdEdit(rowData._id);
        setIsModalOpenEdit(true);
    };

    const closeModalEditManager = (isUpdated = false, message = "", updatedAccount = null) => {

        if (isUpdated === true) {
            setManagers(prevManagers =>
                prevManagers.map(manager =>
                    manager._id === updatedAccount._id ? updatedAccount : manager
                )
            );

            showAlert(message, "success");
        }

        setIsModalOpenEdit(false);
    };

    const closeModalEditCustomer = (isUpdated = false, message = "", updatedAccount = null) => {

        if (isUpdated === true) {
            setCustomers(prevCustomers =>
                prevCustomers.map(customer =>
                    customer._id === updatedAccount._id ? updatedAccount : customer
                )
            );

            showAlert(message, "success");
        }

        setIsModalOpenEdit(false);
    };


    const deleteManager = (rowData) => {
        if (!window.confirm("Are you sure you want to delete this manager?")) return;

        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        api.delete(
            `managers/${rowData._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                setManagers(prevManagers =>
                    prevManagers.filter(manager => manager._id !== rowData._id)
                );

                setTotalRecords(prev => prev - 1);

                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    const deleteCustomer = (rowData) => {
        if (!window.confirm("Are you sure you want to delete this customer?")) return;

        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        api.delete(
            `customers/${rowData._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                setCustomers(prevCustomers =>
                    prevCustomers.filter(customer => customer._id !== rowData._id)
                );

                setTotalRecords(prev => prev - 1);

                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    // const detailsBodyTemplate = (rowData) => {
    //     return <Button label="View" className="p-button-sm p-button-info" />;
    // };

    const actionBodyTemplateCustomer = (rowData) => {
        return (
            <div className="action-buttons">
                <Button className="p-button-sm p-button-warning" onClick={() => editAccount(rowData)} ><FaEdit /></Button>
                <Button className="p-button-sm p-button-danger" onClick={() => deleteCustomer(rowData)} ><FaTrash /></Button>
            </div>
        );
    };

    const actionBodyTemplateManager = (rowData) => {
        return (
            <div className="action-buttons">
                <Button className="p-button-sm p-button-warning" onClick={() => editAccount(rowData)} ><FaEdit /></Button>
                <Button className="p-button-sm p-button-danger" onClick={() => deleteManager(rowData)} ><FaTrash /></Button>
            </div>
        );
    };

    if (loading) return <div className="loading-spinner"></div>;
    return (
        <div className="products">
            <TabMenu model={tabs} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} />

            {role !== "manager" && activeIndex === 0 && (
                <>
                <Button label="Add New Account" className="p-button-sm p-button-success add-button" onClick={() => addAccountModel()} />;
                <AddAccountManagerModel
                    visible={isModalOpenAdd}
                    onClose={closeModalAddManager}
                />

                {selectedAccountIdEdit && isModalOpenEdit && (
                    <EditAccountManagerModel
                        visible={isModalOpenEdit}
                        accountId={selectedAccountIdEdit}
                        onClose={closeModalEditManager}
                    />
                )}
                    {managers.length === 0 ? (
                        <p>No products available.</p>
                    ) : (
                        <>
                            <DataTable value={managers.slice(first, first + rowsPerPage)} paginator={false} responsiveLayout="scroll">
                                <Column field="name" header="Name" sortable />
                                {/* <Column body={imageBodyTemplate} header="Image" /> */}
                                <Column field="email" header="Email" sortable />
                                <Column field="address" header="Address" sortable />
                                <Column field="phone" header="Phone" sortable />
                                <Column field="role" header="Role" sortable />
                                <Column field="status" header="Status" sortable />
                                {/* <Column body={detailsBodyTemplate} header="Details" /> */}
                                <Column body={actionBodyTemplateManager} header="Action" />
                            </DataTable>

                            <Paginator
                                first={first}
                                rows={rowsPerPage}
                                totalRecords={totalRecords}
                                onPageChange={onPageChange}
                            />
                        </>
                    )}

                </>
            )}

            {(role === "manager" ? activeIndex === 0 : activeIndex === 1) && (
                <>
                {selectedAccountIdEdit && isModalOpenEdit && (
                    <EditAccountCustomerModel
                        visible={isModalOpenEdit}
                        accountId={selectedAccountIdEdit}
                        onClose={closeModalEditCustomer}
                    />
                )}
                {customers.length === 0 ? (
                    <p>No products available.</p>
                ) : (
                    <>
                        <DataTable value={customers.slice(first, first + rowsPerPage)} paginator={false} responsiveLayout="scroll" className="custom-datatable">
                            <Column field="name" header="Name" sortable />
                            <Column field="email" header="Email" sortable />
                            <Column field="address" header="Address" sortable />
                            <Column field="phone" header="Phone" sortable />
                            <Column field="status" header="Status" sortable />
                            {/* <Column body={detailsBodyTemplate} header="Details" /> */}
                            <Column body={actionBodyTemplateCustomer} header="Action" />
                        </DataTable>

                        <Paginator
                            first={first}
                            rows={rowsPerPage}
                            totalRecords={totalRecords}
                            onPageChange={onPageChange}
                        />
                    </>
                )}
            </>
            )}

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    );
}