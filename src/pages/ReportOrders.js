import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../assets/css/ReportOrders.css';

import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';
import OrderDetails from "../components/OrderDetails";

import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { FaSearch } from "react-icons/fa";
import { Dropdown } from 'primereact/dropdown';

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

export const ReportOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const rowsPerPage = 4;

    const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
    const [searchOrderIdTerm, setSearchOrderIdTerm] = useState("");
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [quickDateOption, setQuickDateOption] = useState("thisMonth");

    const [totalStats, setTotalStats] = useState({
        quantity: 0,
        import_price: 0,
        retail: 0,
        payment: 0,
        profit: 0,
        profit_margin: 0
    });

    const [isModalOpenDetails, setIsModalOpenDetails] = useState(false);
    const [selectedOrderIdDetails, setSelectedOrderIdDetails] = useState(null);

    const managerId = localStorage.getItem("managerId");
    const token = localStorage.getItem("token");

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const formatDate = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {

        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setSelectedStartDate(startDate);
        setSelectedEndDate(endDate);

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        if (!managerId || !token) {
            return showAlert("You need to login", "warning");
        }

        setLoading(true);
        api.get(`/reports/orders?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                const ordersData = response.data.data;

                const totalQuantity = ordersData.reduce((sum, order) => sum + order.totalQuantity, 0);
                const totalImportPrice = ordersData.reduce((sum, order) => sum + order.totalImportPrice, 0);
                const totalRetail = ordersData.reduce((sum, order) => sum + order.totalPrice, 0);
                const totalPayment = ordersData.reduce((sum, order) => sum + order.paymentPrice, 0);
                const totalProfit = ordersData.reduce((sum, order) => sum + order.profit, 0);

                const profitMargin = totalRetail ? ((totalProfit / totalRetail) * 100).toFixed(2) : 0;

                setOrders(ordersData);
                setTotalStats({
                    quantity: totalQuantity,
                    import_price: totalImportPrice,
                    retail: totalRetail,
                    payment: totalPayment,
                    profit: totalProfit,
                    profit_margin: profitMargin
                });
                setTotalRecords(ordersData.length);
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

    const viewDetails = (rowData) => {
        setSelectedOrderIdDetails(rowData._id);
        setIsModalOpenDetails(true);
    };

    const closeModalDetails = () => {
        setIsModalOpenDetails(false);
    };

    useEffect(() => {
        let filtered = [...orders];

        if (searchCustomerTerm.trim() !== "") {
            filtered = filtered.filter(o => o.customerName.toLowerCase().includes(searchCustomerTerm.toLowerCase()));
        }

        if (searchOrderIdTerm.trim() !== "") {
            filtered = filtered.filter(o => o._id.toLowerCase().includes(searchOrderIdTerm.toLowerCase()));
        }

        setFilteredOrders(filtered);
    }, [searchCustomerTerm, searchOrderIdTerm, orders]);

    const handleQuickDateChange = (option) => {
        setQuickDateOption(option)

        const today = new Date();
        let startDate = null;
        let endDate = null;

        switch (option) {
            case "today":
                startDate = new Date(today);
                endDate = new Date(today);
                break;
            case "yesterday":
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 1);
                endDate = new Date(startDate);
                break;
            case "thisMonth":
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case "thisYear":
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date(today.getFullYear(), 11, 31);
                break;
            case "all":
                startDate = null;
                endDate = null;
                break;
            default:
                return;
        }

        setSelectedStartDate(startDate);
        setSelectedEndDate(endDate);
    };


    const handleLoadData = () => {

        if (!selectedStartDate && selectedEndDate) {
            showAlert("Please select start dates!", "warning");
            return;
        }

        if (selectedStartDate && !selectedEndDate) {
            showAlert("Please select end dates!", "warning");
            return;
        }

        if (!managerId || !token) {
            return showAlert("You need to login", "warning");
        }

        const formattedStartDate = formatDate(selectedStartDate);
        const formattedEndDate = formatDate(selectedEndDate);

        setSearchCustomerTerm("")
        setSearchOrderIdTerm("")
        setLoading(true);
        
        api.get(`/reports/orders?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                const ordersData = response.data.data;

                const totalQuantity = ordersData.reduce((sum, order) => sum + order.totalQuantity, 0);
                const totalImportPrice = ordersData.reduce((sum, order) => sum + order.totalImportPrice, 0);
                const totalRetail = ordersData.reduce((sum, order) => sum + order.totalPrice, 0);
                const totalPayment = ordersData.reduce((sum, order) => sum + order.paymentPrice, 0);
                const totalProfit = ordersData.reduce((sum, order) => sum + order.profit, 0);

                const profitMargin = totalRetail ? ((totalProfit / totalRetail) * 100).toFixed(2) : 0;

                setOrders(ordersData);
                setTotalStats({
                    quantity: totalQuantity,
                    import_price: totalImportPrice,
                    retail: totalRetail,
                    payment: totalPayment,
                    profit: totalProfit,
                    profit_margin: profitMargin
                });
                setTotalRecords(ordersData.length);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    const detailsBodyTemplate = (rowData) => {
        return <Button label="View" className="p-button-sm p-button-info" onClick={() => viewDetails(rowData)} />;
    };

    if (loading) return <div className="loading-spinner"></div>;
    return (
        <>
            <div className="filter-container">
                <SearchOrderIdBox searchOrderIdTerm={searchOrderIdTerm} setSearchOrderIdTerm={setSearchOrderIdTerm} />
                <SearchCustomerBox searchCustomerTerm={searchCustomerTerm} setSearchCustomerTerm={setSearchCustomerTerm} />

                <div className="date-filter">
                    <div className="calendar-row">
                        <Calendar
                            value={selectedStartDate}
                            onChange={(e) => setSelectedStartDate(e.value)}
                            placeholder="Select start date"
                            showIcon
                            dateFormat="dd/mm/yy"
                        />

                        <Dropdown
                            value={quickDateOption}
                            options={[
                                { label: "Today", value: "today" },
                                { label: "Yesterday", value: "yesterday" },
                                { label: "This Month", value: "thisMonth" },
                                { label: "This Year", value: "thisYear" },
                                { label: "All", value: "all" }
                            ]}
                            onChange={(e) => handleQuickDateChange(e.value)}
                            placeholder="Quick Select"
                            className="p-dropdown-sm date-dropdown"
                        />
                    </div>

                    <div className="calendar-row">
                        <Calendar
                            value={selectedEndDate}
                            onChange={(e) => setSelectedEndDate(e.value)}
                            placeholder="Select end date"
                            showIcon
                            dateFormat="dd/mm/yy"
                        />

                        <Button
                            label="Load Data"
                            className="p-button-primary p-button-sm load-btn"
                            onClick={handleLoadData}
                        />
                    </div>

                </div>

            </div>

            <div className="orders">

                {filteredOrders.length === 0 ? (
                    <p>No orders available.</p>
                ) : (
                    <>
                        <DataTable value={filteredOrders.slice(first, first + rowsPerPage)} paginator={false} responsiveLayout="scroll">
                            <Column field="_id" header="Order Code" />
                            <Column field="customerName" header="Customer" sortable />
                            <Column field="creation_date" header="Creation Date" body={(rowData) => new Date(rowData.creation_date).toLocaleString()} sortable />
                            <Column field="totalQuantity" header="Quantity" sortable />
                            <Column
                                field="totalImportPrice"
                                header="Total Import (VND)"
                                body={(rowData) => rowData.totalImportPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                sortable
                            />
                            <Column
                                field="totalPrice"
                                header="Total (VND)"
                                body={(rowData) => rowData.totalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                sortable
                            />
                            <Column
                                field="discountCode"
                                header="Discount Code"
                                body={(rowData) => rowData.discountCode ? rowData.discountCode : "-"}
                            />
                            <Column
                                field="discountPrice"
                                header="Discount Price"
                                body={(rowData) => rowData.discountPrice > 0 ? rowData.discountPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "-"}
                            />
                            <Column
                                field="paymentPrice"
                                header="Payment (VND)"
                                body={(rowData) => rowData.paymentPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                sortable
                            />
                            <Column
                                field="profit"
                                header="Profit (VND)"
                                body={(rowData) => <span style={{ color: "#28a745", fontWeight: "bold" }}>{rowData.profit.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>}
                                sortable
                            />
                            <Column field="profitMargin" header="Profit Margin" body={(rowData) => `${rowData.profitMargin}%`} sortable />
                            <Column body={detailsBodyTemplate} header="Details" />
                        </DataTable>

                        <div className="total-stats-table">
                            <table className="p-table p-component">
                                <thead>
                                    <tr>
                                        <th>Total Statistics</th>
                                        <th>Quantity</th>
                                        <th>Total Import Price(VND)</th>
                                        <th>Payment (VND)</th>
                                        <th>Profit (VND)</th>
                                        <th>Average  Profit Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Value</td>
                                        <td>{totalStats.quantity}</td>
                                        <td>{totalStats.import_price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                                        <td>{totalStats.payment.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                                        <td style={{ color: "#28a745", fontWeight: "bold" }}>{totalStats.profit.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                                        <td>{totalStats.profit_margin}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <Paginator
                            first={first}
                            rows={rowsPerPage}
                            totalRecords={totalRecords}
                            onPageChange={onPageChange}
                        />
                    </>
                )}

                <OrderDetails
                    visible={isModalOpenDetails}
                    orderId={selectedOrderIdDetails}
                    onClose={closeModalDetails}
                    isStats={true}
                />

                {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </div>
        </>
    );
};
