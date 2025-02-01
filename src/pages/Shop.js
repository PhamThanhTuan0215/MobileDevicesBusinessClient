import { useEffect, useState } from "react";
import api from "../services/api";
import '../assets/css/Shop.css';
import { FaSearch } from "react-icons/fa";
import ProductDetails from "../components/ProductDetails";
import AlertMessage from "../utils/AlertMessage"

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
const ProductCard = ({ product, onAddToCart, onAddToWishlist, onClick }) => (
    <div className="product-card" onClick={() => onClick(product._id)}>
        <img src={product.url_image} alt={product.name} className="product-image" />
        <h2 className="product-name">{product.name}</h2>
        <p className="product-brand">Brand: {product.brand}</p>
        <p className="product-price">{product.retail_price.toLocaleString()} VND</p>
        <button className="add-to-wishlist-button" onClick={(e) => {
            e.stopPropagation();
            onAddToWishlist(product._id);
        }}>
            Add to Wishlist
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

    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        api.get("/products/display")
            .then(response => {
                const result = response.data;
                const productList = Array.isArray(result.data) ? result.data : [];
                setProducts(productList);
                setFilteredProducts(productList);

                const uniqueBrands = [...new Set(productList.map(p => p.brand))];
                setBrands(["All", ...uniqueBrands]);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        let filtered = [...products];

        if (selectedSort === "asc") {
            filtered = filtered.sort((a, b) => a.retail_price - b.retail_price);
        }
        else if (selectedSort === "desc") {
            filtered = filtered.sort((a, b) => b.retail_price - a.retail_price);
        }

        setFilteredProducts(filtered);
    }, [selectedSort, products]);


    useEffect(() => {
        let filtered = [...products];

        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    useEffect(() => {
        let filtered = [...products];

        if (selectedBrand !== "All") {
            filtered = filtered.filter(p => p.brand === selectedBrand);
        }

        setFilteredProducts(filtered);
    }, [selectedBrand, products]);

    const handleAddToWishlist = (productId) => {
        console.log("Added to wishlist:", productId);
        showAlert("Added product to wishlist! (sample)", "error")
    };

    const handleAddToCart = (productId) => {
        console.log("Added to cart:", productId);
        showAlert("Added product to cart! (sample)", "success")
    };

    const handleProductClick = (id) => {
        setSelectedProductId(id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
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
                            onAddToCart={handleAddToCart}
                            onAddToWishlist={handleAddToWishlist}
                            onClick={handleProductClick}
                        />
                    ))
                ) : (
                    <div className="no-products">
                        <p>There are no matching products.</p>
                    </div>
                )}
            </div>

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

            <ProductDetails
                visible={isModalOpen}
                productId={selectedProductId}
                onClose={closeModal}
            />
        </div>
    );
};
