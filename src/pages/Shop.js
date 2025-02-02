import { useEffect, useState } from "react";
import api from "../services/api";
import '../assets/css/Shop.css';
import { FaSearch } from "react-icons/fa";
import ProductDetails from "../components/ProductDetails";
import AlertMessage from "../utils/AlertMessage"
import { getErrorMessage } from "../utils/ErrorHandler";

// Component tìm kiếm
const SearchBox = ({ searchTerm, setSearchTerm }) => (
    <div className="search-box">
        <FaSearch className="search-icon" />
        <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
    </div>
);

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
            className={`toggle-wishlist-button ${wishlist.includes(product._id) ? "wishlist-remove" : "wishlist-add"}`}
            onClick={(e) => {
                e.stopPropagation();
                onWishlistToggle(product._id);
            }}
        >
            {wishlist.includes(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
        </button>
        <button className="add-to-cart-button" onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product._id);
        }}>
            Add to Cart
        </button>
    </div>
);

export const Shop = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSort, setSelectedSort] = useState("none");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [wishlist, setWishlist] = useState([]);

    const [loading, setLoading] = useState(true);

    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {

        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("token");

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

        api.get("/products/display")
            .then(response => {
                const result = response.data;
                const productList = Array.isArray(result.data) ? result.data : [];
                setProducts(productList);
                setFilteredProducts(productList);

                const uniqueBrands = [...new Set(productList.map(p => p.brand))];
                setBrands(["All", ...uniqueBrands]);

                setLoading(false);
            })
            .catch(error => {
                setLoading(false);

                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });

    }, []);

    useEffect(() => {
        let filtered = [...products];

        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (selectedBrand !== "All") {
            filtered = filtered.filter(p => p.brand === selectedBrand);
        }

        if (selectedSort === "asc") {
            filtered = filtered.sort((a, b) => a.retail_price - b.retail_price);
        }
        else if (selectedSort === "desc") {
            filtered = filtered.sort((a, b) => b.retail_price - a.retail_price);
        }

        setFilteredProducts(filtered);
    }, [searchTerm, selectedBrand, selectedSort, products]);

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
                .then(() => {
                    showAlert("Removed from wishlist", "success");
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
                .then(() => {
                    showAlert("Added to wishlist", "success");
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
            .then(() => {
                showAlert("Added to cart", "success");
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
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                wishlist={wishlist}
                                onAddToCart={handleAddToCart}
                                onWishlistToggle={handleWishlistToggle}
                                onClick={handleProductClick}
                            />
                        ))
                    ) : (
                        <div className="no-products">
                            <p>There are no matching products.</p>
                        </div>
                    )}
                </div>

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
