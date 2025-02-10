import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import '../assets/css/Shop.css';
import { FaSearch } from "react-icons/fa";
import ProductDetails from "../components/ProductDetails";
import AlertMessage from "../utils/AlertMessage"
import { getErrorMessage } from "../utils/ErrorHandler";
import { useLocation } from 'react-router-dom';
import { FaHeart, FaCartPlus } from 'react-icons/fa';

import { Paginator } from 'primereact/paginator';

// Component tìm kiếm
const SearchBox = ({ searchTerm, setSearchTerm }) => {
    const inputRef = useRef(null);
    const [tempSearch, setTempSearch] = useState(searchTerm);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setSearchTerm(tempSearch);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [tempSearch, setSearchTerm]);

    return (
        <div className="search-box">
            <FaSearch className="search-icon" />
            <input
                ref={inputRef}
                type="text"
                placeholder="Search product..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
            />
        </div>
    );
};

// Component lọc theo thương hiệu
const BrandFilter = ({ brands, selectedBrand, setSelectedBrand }) => (
    <div className="brand-filter">
        <label>Brand:</label>
        <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
            {brands.map((brand, index) => (
                <option key={index} value={brand}>{brand}</option>
            ))}
        </select>
    </div>
);

// Component sắp xếp theo giá
const PriceSort = ({ selectedSort, setSelectedSort }) => (
    <div className="price-sort">
        <label>Sort by Price:</label>
        <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
            <option value="none">Not sorted</option>
            <option value="asc">Low to High</option>
            <option value="desc">High to Low</option>
        </select>
    </div>
);

// Component hiển thị sản phẩm
const ProductCard = ({ product, wishlist, onAddToCart, onWishlistToggle, onClick }) => (
    <div className="product-card" onClick={() => onClick(product._id)}>
        <img src={product.url_image} alt={product.name} className="product-image" />
        <h2 className="product-name">{product.name}</h2>
        <p className="product-brand">{product.brand}</p>
        <p className="product-price">{product.retail_price.toLocaleString()} VND</p>
        <button
            className={`toggle-wishlist-button`}
            onClick={(e) => {
                e.stopPropagation();
                onWishlistToggle(product._id);
            }}
        >
            <FaHeart color={wishlist.includes(product._id) ? "red" : "gray"} />
        </button>
        <button className="add-to-cart-button" onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product._id);
        }}>
            <FaCartPlus />
        </button>
    </div>
);

export const Shop = () => {

    const location = useLocation();
    const alertMessage = location.state?.alertMessage;
    const alertMessageStatus = location.state?.statusMessage;

    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSort, setSelectedSort] = useState("none");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [page, setPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const rowsPerPage = 10;

    const [wishlist, setWishlist] = useState([]);

    const [loading, setLoading] = useState(true);

    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {

        if (alertMessage) {
            showAlert(alertMessage, alertMessageStatus)
        }

        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("token");

        // favorite products
        if (!customerId || !token) {
            setWishlist([]);
        }
        else {
            api.get(`wishlists/${customerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    setWishlist(response.data.data.map(item => item._id));
                })
                .catch(error => {
                    setWishlist([]);
                });
        }

        // brands
        api.get("/products/brands")
            .then(response => {
                const brandsList = response.data.data || [];
                setBrands(brandsList);
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);

                setBrands(["All"])
            });

        api.get("/products/display?page=1")
            .then(response => {
                const result = response.data;
                const productList = Array.isArray(result.data) ? result.data : [];
                setProducts(productList);
                setTotalRecords(result.totalLength);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);

                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });

    }, [alertMessage, alertMessageStatus]);

    useEffect(() => {

        setLoading(true);

        setPage(1)
        setFirst(0)

        const params = new URLSearchParams();

        if (searchTerm.trim() !== "") {
            params.append("productNameSearch", searchTerm);
        }
        if (selectedBrand !== "All" && selectedBrand !== "") {
            params.append("brand", selectedBrand);
        }
        if (selectedSort === "asc" || selectedSort === "desc") {
            params.append("sortPrice", selectedSort);
        }

        api.get(`/products/display?page=1&${params.toString()}`)
            .then(response => {
                const result = response.data;
                const productList = Array.isArray(result.data) ? result.data : [];
                setProducts(productList);
                setTotalRecords(result.totalLength);

                setLoading(false);
            })
            .catch(error => {
                setLoading(false);

                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });

    }, [searchTerm, selectedBrand, selectedSort]);

    useEffect(() => {

        setLoading(true);

        const params = new URLSearchParams();

        if (searchTerm.trim() !== "") {
            params.append("productNameSearch", searchTerm);
        }
        if (selectedBrand !== "All" && selectedBrand !== "") {
            params.append("brand", selectedBrand);
        }
        if (selectedSort === "asc" || selectedSort === "desc") {
            params.append("sortPrice", selectedSort);
        }

        api.get(`/products/display?page=${page}&${params.toString()}`)
            .then(response => {
                const result = response.data;
                const productList = Array.isArray(result.data) ? result.data : [];
                setProducts(productList);
                setTotalRecords(result.totalLength);

                setLoading(false);
            })
            .catch(error => {
                setLoading(false);

                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }, [searchTerm, selectedBrand, selectedSort, page])

    const onPageChange = (event) => {
        setFirst(event.first);
        const page = event.first / rowsPerPage + 1;
        setPage(page)
    };


    const handleWishlistToggle = (productId) => {

        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("token");

        if (!customerId || !token) {
            showAlert("You need to log in", "warning");
            return;
        }

        const isInWishlist = wishlist.includes(productId);

        if (isInWishlist) {
            // Xóa sản phẩm khỏi wishlist
            api.delete(`wishlists/remove/${customerId}/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    showAlert(response.data.message, "success");
                    setWishlist(wishlist.filter(id => id !== productId));
                })
                .catch(error => {
                    const { message, statusMessage } = getErrorMessage(error.response);
                    showAlert(message, statusMessage);
                });
        } else {
            // Thêm sản phẩm vào wishlist
            api.post(`wishlists/add/${customerId}/${productId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    showAlert(response.data.message, "success");
                    setWishlist([...wishlist, productId]);
                })
                .catch(error => {
                    const { message, statusMessage } = getErrorMessage(error.response);
                    showAlert(message, statusMessage);
                });
        }
    };

    const handleAddToCart = (productId) => {
        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("token");

        if (!customerId || !token) {
            showAlert("You need to log in", "warning");
            return;
        }

        api.post(`carts/add/${customerId}/${productId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    const handleProductClick = (id) => {
        setSelectedProductId(id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (loading) return <div className="loading">Loading products...</div>;

    return (
        <>

            <div className="shop-container">
                <div className="filter-container">
                    <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    <BrandFilter brands={brands} selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} />
                    <PriceSort selectedSort={selectedSort} setSelectedSort={setSelectedSort} />
                </div>

                <div className="product-grid">
                    {products.length > 0 ? (
                        <>
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    wishlist={wishlist}
                                    onAddToCart={handleAddToCart}
                                    onWishlistToggle={handleWishlistToggle}
                                    onClick={handleProductClick}
                                />
                            ))}

                        </>
                    ) : (
                        <div className="no-products">
                            <p>There are no matching products.</p>
                        </div>
                    )}
                </div>

                {products.length > 0 &&
                    <Paginator
                        first={first}
                        rows={rowsPerPage}
                        totalRecords={totalRecords}
                        onPageChange={onPageChange}
                    />}

                <ProductDetails
                    visible={isModalOpen}
                    productId={selectedProductId}
                    onClose={closeModal}
                />
            </div>

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </>
    );
};
