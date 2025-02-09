import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../assets/css/ReportProducts.css';

import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';
import ProductDetails from "../components/ProductDetails";

import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { FaSearch } from "react-icons/fa";
import { Dropdown } from 'primereact/dropdown';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const SearchProductBox = ({ searchCustomerTerm, setSearchProductTerm }) => (
    <div className="search-box">
        <FaSearch className="search-icon" />
        <input
            type="text"
            placeholder="Search product name..."
            value={searchCustomerTerm}
            onChange={(e) => setSearchProductTerm(e.target.value)}
        />
    </div>
);

export const ReportProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const rowsPerPage = 4;

    const [isModalOpenDetails, setIsModalOpenDetails] = useState(false);
    const [selectedProductIdDetails, setSelectedProductIdDetails] = useState(null);

    const [searchProductTerm, setSearchProductTerm] = useState("");
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [quickDateOption, setQuickDateOption] = useState("thisMonth");

    const [totalStats, setTotalStats] = useState({
        quantity: 0,
        import_price: 0,
        retail: 0,
        profit: 0,
        profit_margin: 0
    });

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

    const chartDataQuantitySold = {
        labels: filteredProducts.map((product) => product.name),
        datasets: [
            {
                label: 'Quantity Sold',
                data: filteredProducts.map((product) => product.quantitySold),
                backgroundColor: '#42A5F5',
                borderColor: '#1E88E5',
                borderWidth: 1,
                barThickness: 40
            }
        ]
    };

    const chartDataProfit = {
        labels: filteredProducts.map((product) => product.name),
        datasets: [
            {
                label: 'Profit (VND)',
                data: filteredProducts.map((product) => product.profit),
                backgroundColor: '#46e043',
                borderColor: '#1E88E5',
                borderWidth: 1,
                barThickness: 40
            }
        ]
    };

    const chartOptionsProfit = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            }
        },
        scales: {
            y: {
                ticks: {
                    // stepSize: 100000,
                    beginAtZero: true
                }
            }
        }
    };

    const chartOptionsQuantitySold = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            }
        },
        scales: {
            y: {
                ticks: {
                    stepSize: 1,
                    beginAtZero: true
                }
            }
        }
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
        api.get(`/reports/products?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                const productsData = response.data.data;

                const quantitySold = productsData.reduce((sum, product) => sum + product.quantitySold, 0);
                const totalImportPrice = productsData.reduce((sum, product) => sum + product.totalImportPrice, 0);
                const totalRetail = productsData.reduce((sum, product) => sum + product.totalPrice, 0);
                const totalProfit = productsData.reduce((sum, product) => sum + product.profit, 0);

                const profitMargin = totalRetail ? ((totalProfit / totalRetail) * 100).toFixed(2) : 0;

                setTotalStats({
                    quantity: quantitySold,
                    import_price: totalImportPrice,
                    retail: totalRetail,
                    profit: totalProfit,
                    profit_margin: profitMargin
                });

                setProducts(productsData);

                setTotalRecords(productsData.length);
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
        setSelectedProductIdDetails(rowData.productId);
        setIsModalOpenDetails(true);
    };

    const closeModalDetails = () => {
        setIsModalOpenDetails(false);
    };

    useEffect(() => {
        let filtered = [...products];

        if (searchProductTerm.trim() !== "") {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchProductTerm.toLowerCase()));
        }

        setFilteredProducts(filtered);
    }, [searchProductTerm, products]);

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

        setLoading(true);
        setSearchProductTerm("");

        api.get(`/reports/products?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                const productsData = response.data.data;

                setProducts(productsData);

                const quantitySold = productsData.reduce((sum, product) => sum + product.quantitySold, 0);
                const totalImportPrice = productsData.reduce((sum, product) => sum + product.totalImportPrice, 0);
                const totalRetail = productsData.reduce((sum, product) => sum + product.totalPrice, 0);
                const totalProfit = productsData.reduce((sum, product) => sum + product.profit, 0);

                const profitMargin = totalRetail ? ((totalProfit / totalRetail) * 100).toFixed(2) : 0;

                setTotalStats({
                    quantity: quantitySold,
                    import_price: totalImportPrice,
                    retail: totalRetail,
                    profit: totalProfit,
                    profit_margin: profitMargin
                });

                setTotalRecords(productsData.length);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    const imageBodyTemplate = (rowData) => {
        return <img src={rowData.url_image} alt={rowData.name} style={{ width: '50px', borderRadius: '5px' }} />;
    };

    const detailsBodyTemplate = (rowData) => {
        return <Button label="View" className="p-button-sm p-button-info" onClick={() => viewDetails(rowData)} />;
    };

    if (loading) return <div className="loading-spinner"></div>;
    return (
        <>

            <div className="filter-container">
                <SearchProductBox searchProductTerm={searchProductTerm} setSearchProductTerm={setSearchProductTerm} />

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

            <div className="products">

                {filteredProducts.length === 0 ? (
                    <p>No products available.</p>
                ) : (
                    <>
                        <DataTable value={filteredProducts.slice(first, first + rowsPerPage)} paginator={false} responsiveLayout="scroll">
                            <Column field="name" header="Product Name" sortable />
                            <Column body={imageBodyTemplate} header="Image" />
                            <Column
                                field="quantitySold"
                                header="Quantity"
                                body={(rowData) => rowData.quantitySold}
                                sortable
                            />
                            <Column
                                field="import_price"
                                header="Import Price (VND)"
                                body={(rowData) => rowData.import_price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                sortable
                            />
                            <Column
                                field="retail_price"
                                header="Retail Price (VND)"
                                body={(rowData) => rowData.retailPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                sortable
                            />
                            <Column
                                field="totalImportPrice"
                                header="Total Import Price (VND)"
                                body={(rowData) => rowData.totalImportPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                sortable
                            />
                            <Column
                                field="totalPrice"
                                header="Total Price (VND)"
                                body={(rowData) => rowData.totalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                sortable
                            />
                            <Column
                                field="profit"
                                header="Profit (VND)"
                                body={(rowData) => <span style={{ color: "#28a745", fontWeight: "bold" }}>{rowData.profit.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>}
                                sortable
                            />
                            <Column
                                field="profitMargin"
                                header="Profit Margin (%)"
                                body={(rowData) => rowData.profitMargin}
                                sortable
                            />
                            <Column body={detailsBodyTemplate} header="Details" />
                        </DataTable>

                        <div className="total-stats-table">
                            <table className="p-table p-component">
                                <thead>
                                    <tr>
                                        <th>Total Statistics</th>
                                        <th>Quantity</th>
                                        <th>Total Import Price(VND)</th>
                                        <th>Profit (VND)</th>
                                        <th>Average  Profit Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Value</td>
                                        <td>{totalStats.quantity}</td>
                                        <td>{totalStats.import_price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
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

                        <div className="chart-container">
                            <Bar data={chartDataQuantitySold} options={chartOptionsQuantitySold} />
                            <h3>Product Sales Quantity Sold Chart</h3>
                        </div>

                        <div className="chart-container">
                            <Bar data={chartDataProfit} options={chartOptionsProfit} />
                            <h3>Product Sales Profit Chart</h3>
                        </div>
                    </>
                )}

                <ProductDetails
                    visible={isModalOpenDetails}
                    productId={selectedProductIdDetails}
                    onClose={closeModalDetails}
                />

                {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </div>
        </>
    );
};
