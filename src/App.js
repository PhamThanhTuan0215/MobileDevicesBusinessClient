import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { MyOrder } from "./pages/MyOrder";
import { Wishlist } from "./pages/Wishlist";
import { Cart } from "./pages/Cart";
import { ManageProducts } from "./pages/ManageProducts";
import { ManageOrders } from "./pages/ManageOrders";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./utils/ProtectedRoute";

function App() {

  localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lciI6eyJpZCI6IjY3N2QzYmJkNWVhNmFlODgxYjgxNmZiMSJ9LCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3Mzg1Mjg5NDgsImV4cCI6MTczODUzMjU0OH0.F51G1nkUvon7fxVznoRr5lwqkuyk67VDyzlrxwbzCbU");
  localStorage.setItem("customerId", "677d3bbd5ea6ae881b816fb1");
  localStorage.setItem("isLoggedIn", true)
  localStorage.setItem("role", "manager")

  // localStorage.removeItem("token")
  // localStorage.removeItem("customerId")
  // localStorage.removeItem("isLoggedIn")
  // localStorage.removeItem("role")

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true" || false;
  const role = localStorage.getItem("role") || "guest";

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
