import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../assets/css/ManageOrders.css';

import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';
import OrderDetails from "../components/OrderDetails";

import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { FaSearch } from "react-icons/fa";
import { Tooltip } from 'primereact/tooltip';

const SearchCustomerBox = ({ searchCustomerTerm, setSearchCustomerTerm }) => (
    <div className="search-box">
        <FaSearch className="search-icon" />
        <input
            type="text"
            placeholder="Search customer name..."
            value={searchCustomerTerm}
            onChange={(e) => setSearchCustomerTerm(e.target.value)}
        />
    </div>
);

const SearchOrderIdBox = ({ searchOrderIdTerm, setSearchOrderIdTerm }) => (
    <div className="search-box">
        <FaSearch className="search-icon" />
        <input
            type="text"
            placeholder="Search order code..."
            value={searchOrderIdTerm}
            onChange={(e) => setSearchOrderIdTerm(e.target.value)}
        />
    </div>
);

export const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const rowsPerPage = 5;

    const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
    const [searchOrderIdTerm, setSearchOrderIdTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);

    const [isModalOpenDetails, setIsModalOpenDetails] = useState(false);
    const [selectedPOrderIdDetails, setSelectedOrderIdDetails] = useState(null);

    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updateStatus, setUpdateStatus] = useState({
        isPaid: false,
        status: "processing",
        isCompleted: false
    });

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
        api.get(`/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setOrders(response.data.data);
                setTotalRecords(response.data.data.length);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }, [managerId, token]);

    useEffect(() => {
        let filtered = [...orders];

        if (searchCustomerTerm.trim() !== "") {
            filtered = filtered.filter(o => o.customerName.toLowerCase().includes(searchCustomerTerm.toLowerCase()));
        }

        if (searchOrderIdTerm.trim() !== "") {
            filtered = filtered.filter(o => o._id.toLowerCase().includes(searchOrderIdTerm.toLowerCase()));
        }

        if (selectedDate) {
            const selectedTimestamp = new Date(selectedDate).setHours(0, 0, 0, 0);
            filtered = filtered.filter(o => {
                const orderDate = new Date(o.creation_date).setHours(0, 0, 0, 0);
                return orderDate === selectedTimestamp;
            });
        }

        setFilteredOrders(filtered);
    }, [searchCustomerTerm, searchOrderIdTerm, selectedDate, orders]);

    const onPageChange = (event) => {
        setFirst(event.first);
    };

    const viewDetails = (rowData) => {
        setSelectedOrderIdDetails(rowData._id);
        setIsModalOpenDetails(true);
    };

    const closeModalDetails = () => {
        setIsModalOpenDetails(false);
    };

    const updateOrder = (rowData) => {
        setSelectedOrder(rowData);
        setUpdateStatus({
            isPaid: rowData.isPaid,
            status: rowData.status,
            isCompleted: rowData.isCompleted
        });
        setIsUpdateDialogOpen(true);
    };

    const confirmUpdate = () => {
        if (!window.confirm("Are you sure you want to update this order?")) return;

        if (!managerId || !token) {
            return showAlert("You need to login", "warning");
        }

        api.put(
            `orders/change-status-order/${selectedOrder._id}`,
            {
                status: updateStatus.status,
                isPaid: updateStatus.isPaid,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                const updatedOrder = response.data.data
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
                    )
                );

                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });

        setIsUpdateDialogOpen(false);
    };


    useEffect(() => {
        if (updateStatus.isCompleted) {
            setUpdateStatus((prev) => ({
                ...prev,
                isPaid: true,
                status: "delivered",
            }));
        }
        else {
            if (selectedOrder) {
                setUpdateStatus((prev) => ({
                    ...prev,
                    isPaid: selectedOrder.isPaid,
                    status: selectedOrder.status,
                }));
            }
        }
    }, [updateStatus.isCompleted, selectedOrder]);

    useEffect(() => {
        if (updateStatus.isPaid === true && updateStatus.status === "delivered") {
            setUpdateStatus((prev) => ({
                ...prev,
                isCompleted: true,
            }));
        }
        else {
            if (selectedOrder) {
                setUpdateStatus((prev) => ({
                    ...prev,
                    isCompleted: selectedOrder.isCompleted,
                }));
            }
        }
    }, [updateStatus.isPaid, updateStatus.status, selectedOrder]);


    const cancelOrder = (rowData) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        if (!managerId || !token) {
            return showAlert("You need to login", "warning");
        }

        api.delete(
            `orders/cancel/${rowData._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                setOrders(prevOrders => prevOrders.map(order =>
                    order._id === rowData._id ? { ...order, status: "canceled" } : order
                ));

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
        if (rowData.status === "canceled") {
            return <span className="order-status-text canceled">{rowData.status}</span>;
        }

        if (rowData.isCompleted === true) {
            return <span className="order-status-text completed">completed</span>;
        }

        return (
            <div className="action-buttons">
                {rowData.isCompleted === false && (
                    <Button
                        label="Update"
                        className="p-button-sm p-button-warning"
                        onClick={() => updateOrder(rowData)}
                    />
                )}
                {(rowData.status === "processing" || rowData.status === "delivering") && (
                    <Button
                        label="Cancel"
                        className="p-button-sm p-button-danger"
                        onClick={() => cancelOrder(rowData)}
                    />
                )}
            </div>
        );
    };

    if (loading) return <div className="loading-spinner"></div>;
    return (
        <>
            <div className="filter-container">
                <SearchCustomerBox searchCustomerTerm={searchCustomerTerm} setSearchCustomerTerm={setSearchCustomerTerm} />
                <SearchOrderIdBox searchOrderIdTerm={searchOrderIdTerm} setSearchOrderIdTerm={setSearchOrderIdTerm} />

                <div className="date-filter">
                    <Calendar
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.value)}
                        placeholder="Select date"
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>
            </div>

            <div className="orders">

                {filteredOrders.length === 0 ? (
                    <p>No orders available.</p>
                ) : (
                    <>
                        <DataTable value={filteredOrders.slice(first, first + rowsPerPage)} paginator={false} responsiveLayout="scroll">
                            <Column body={actionBodyTemplate} header="Action" />
                            <Column field="_id" header="Order Code" sortable />
                            <Column field="customerName" header="Customer" sortable />
                            <Column field="totalQuantity" header="Total Quantity" sortable />
                            <Column
                                field="totalPrice"
                                header="Total (VND)"
                                body={(rowData) => rowData.totalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                sortable
                            />
                            <Column field="method" header="Method" sortable />
                            <Column
                                field="status"
                                header="Status"
                                body={(rowData) => (
                                    <span className={`status-badge status-${rowData.status.toLowerCase()}`}>
                                        {rowData.status}
                                    </span>
                                )}
                                sortable
                            />
                            <Column
                                field="isPaid"
                                header="Is Paid"
                                body={(rowData) => (
                                    <span className={`status-badge ${rowData.isPaid ? "paid" : "unpaid"}`}>
                                        {rowData.isPaid ? "Yes" : "No"}
                                    </span>
                                )}
                                sortable
                            />
                            <Column
                                field="isCompleted"
                                header="Is Completed"
                                body={(rowData) => (
                                    <span className={`status-badge ${rowData.isCompleted ? "completed" : "pending"}`}>
                                        {rowData.isCompleted ? "Yes" : "No"}
                                    </span>
                                )}
                                sortable
                            />
                            <Column body={detailsBodyTemplate} header="Details" />
                            <Column
                                field="customerAddress"
                                header="Address"
                                sortable
                                style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                body={(rowData) => (
                                    <>
                                        <span data-pr-tooltip={rowData.customerAddress}>
                                            {rowData.customerAddress}
                                        </span>
                                        <Tooltip target="span" />
                                    </>
                                )}
                            />
                            <Column
                                field="discountCode"
                                header="Discount Code"
                                body={(rowData) => rowData.discountCode ? rowData.discountCode : "-"}
                                sortable
                            />
                            <Column
                                field="discountPrice"
                                header="Discount Price"
                                body={(rowData) => rowData.discountPrice > 0 ? rowData.discountPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "-"}
                                sortable
                            />
                            <Column field="creation_date" header="Creation Date" body={(rowData) => new Date(rowData.creation_date).toLocaleString()} sortable />
                            <Column
                                field="paymentPrice"
                                header="Payment (VND)"
                                body={(rowData) => rowData.paymentPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                sortable
                            />

                        </DataTable>


                        <Paginator
                            first={first}
                            rows={rowsPerPage}
                            totalRecords={totalRecords}
                            onPageChange={onPageChange}
                        />
                    </>
                )}

                <Dialog header="Update Order Status" visible={isUpdateDialogOpen} onHide={() => setIsUpdateDialogOpen(false)} modal>
                    <div className="p-fluid">

                        <div className="p-field">
                            <label>Payment Status</label>
                            <Dropdown
                                value={updateStatus.isPaid}
                                options={[
                                    { label: "Paid", value: true },
                                    { label: "Unpaid", value: false }
                                ]}
                                onChange={(e) => setUpdateStatus({ ...updateStatus, isPaid: e.value })}
                            />
                        </div>

                        <div className="p-field">
                            <label>Order Status</label>
                            <Dropdown
                                value={updateStatus.status}
                                options={[
                                    { label: "Processing", value: "processing" },
                                    { label: "Delivering", value: "delivering" },
                                    { label: "Delivered", value: "delivered" },
                                ]}
                                onChange={(e) => setUpdateStatus({ ...updateStatus, status: e.value })}
                            />
                        </div>

                        <div className="p-field">
                            <label>Completion Status</label>
                            <Dropdown
                                value={updateStatus.isCompleted}
                                options={[
                                    { label: "Completed", value: true },
                                    { label: "Not Completed", value: false }
                                ]}
                                onChange={(e) => setUpdateStatus({ ...updateStatus, isCompleted: e.value })}
                            />
                        </div>

                        <div className="p-field">
                            <Button label="Confirm" className="p-button-success" onClick={confirmUpdate} />
                        </div>
                    </div>
                </Dialog>


                <OrderDetails
                    visible={isModalOpenDetails}
                    orderId={selectedPOrderIdDetails}
                    onClose={closeModalDetails}
                />

                {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </div>
        </>
    );
};
