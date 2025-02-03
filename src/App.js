import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

import { Route, Routes} from "react-router-dom";
import { useState, useEffect } from "react";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { MyOrder } from "./pages/MyOrder";
import { Wishlist } from "./pages/Wishlist";
import { Cart } from "./pages/Cart";
import { ManageProducts } from "./pages/ManageProducts";
import { ManageOrders } from "./pages/ManageOrders";
import { Login } from "./pages/Login";
import { LoginAdmin } from "./pages/LoginAdmin";
import { Profile } from "./pages/Profile";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./utils/ProtectedRoute";

function App() {


  // State quản lý đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [role, setRole] = useState(localStorage.getItem("role") || "guest");

  // Theo dõi thay đổi trong localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
      setRole(localStorage.getItem("role") || "guest");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <>
      <Header />

      <Routes>
        {/* Truy cập tự do */}
        <Route path="/" element={<Home />} />

        {/*Truy cập bởi khách. Nhưng nếu đã đăng nhập, thì chỉ cho phép role "customer"*/}
        <Route
          path="/shop"
          element={<ProtectedRoute element={<Shop />} allowGuest={true} isLoggedIn={isLoggedIn} requiredRole={["customer"]} userRole={role} />}
        />

        {/*Yêu cầu đăng nhập và role phải là "customer"*/}
        <Route
          path="/my-orders"
          element={<ProtectedRoute element={<MyOrder />} isLoggedIn={isLoggedIn} requiredRole={["customer"]} userRole={role} />}
        />

        {/*Yêu cầu đăng nhập và role phải là "customer"*/}
        <Route
          path="/wishlist"
          element={<ProtectedRoute element={<Wishlist />} isLoggedIn={isLoggedIn} requiredRole={["customer"]} userRole={role} />}
        />

        {/*Yêu cầu đăng nhập và role phải là "customer"*/}
        <Route
          path="/cart"
          element={<ProtectedRoute element={<Cart />} isLoggedIn={isLoggedIn} requiredRole={["customer"]} userRole={role} />}
        />

        {/*Yêu cầu đăng nhập và role phải là "manager", "admin*/}
        <Route
          path="/manage-products"
          element={<ProtectedRoute element={<ManageProducts />} isLoggedIn={isLoggedIn} requiredRole={["manager", "admin"]} userRole={role} />}
        />

        {/*Yêu cầu đăng nhập và role phải là "manager", "admin*/}
        <Route
          path="/manage-orders"
          element={<ProtectedRoute element={<ManageOrders />} isLoggedIn={isLoggedIn} requiredRole={["manager", "admin"]} userRole={role} />}
        />

        {/*Chỉ có thể truy cập nếu chưa đăng nhập*/}
        <Route
          path="/login"
          element={<ProtectedRoute element={<Login />} allowGuest={true} isLoggedIn={isLoggedIn} requiredNotLogged={true} />}
        />

        <Route
          path="/loginAdmin"
          element={<ProtectedRoute element={<LoginAdmin />} allowGuest={true} isLoggedIn={isLoggedIn} requiredNotLogged={true} />}
        />

        {/*Yêu cầu phải đăng nhập*/}
        <Route
          path="/profile"
          element={<ProtectedRoute element={<Profile />} isLoggedIn={isLoggedIn} />}
        />

      </Routes>

      <Footer />
    </>
  );
}

export default App;
