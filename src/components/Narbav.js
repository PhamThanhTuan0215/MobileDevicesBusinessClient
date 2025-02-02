import { NavLink } from 'react-router-dom'
import { FaShoppingCart, FaUserCircle, FaHeart } from 'react-icons/fa';

export const Navbar = () => {

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true" || false;
    const role = localStorage.getItem("role") || "guest";

    return (
        <nav className='primary-nav'>

            <NavLink to='/' >Home</NavLink>

            {(!isLoggedIn || role === "customer") && <NavLink to="/shop">Shop</NavLink>}

            {isLoggedIn && role === "customer" && <NavLink to="/my-orders">My Orders</NavLink>}

            {isLoggedIn && role === "customer" && (
                <NavLink to="/wishlist" style={{ color: "red" }}>
                    <FaHeart />
                </NavLink>
            )}

            {isLoggedIn && role === "customer" && (
                <NavLink to="/cart" >
                    <FaShoppingCart />
                </NavLink>
            )}

            {isLoggedIn && (role === "manager" || role === "admin") && <NavLink to="/manage-products">Manage Products</NavLink>}

            {isLoggedIn && (role === "manager" || role === "admin") && <NavLink to="/manage-orders">Manage Orders</NavLink>}

            {
                isLoggedIn === true ? (
                    <NavLink to='/profile' className='profile-navlink'>
                        <FaUserCircle size={20} />
                    </NavLink>
                ) : <NavLink to="/login" className="login-navlink">Login</NavLink>
            }
        </nav>
    )
}
