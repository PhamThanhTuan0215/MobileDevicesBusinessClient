import { NavLink } from 'react-router-dom'
import { FaShoppingCart, FaUserCircle, FaHeart  } from 'react-icons/fa';

export const Navbar = () => {

    const isLoggedIn = false;

    return (
        <nav className='primary-nav'>

            <NavLink to='/' >Home</NavLink>

            <NavLink to='/shop' >Shop</NavLink>

            <NavLink to='/my-orders' >My Orders</NavLink>

            <NavLink to='/wishlist' style={{ color: 'red' }}>
                <FaHeart />
            </NavLink>

            <NavLink to='/cart' className='cart-navlink'>
                <FaShoppingCart />
            </NavLink>

            {
                isLoggedIn ? (
                    <NavLink to='/profile' className='profile-navlink'>
                    <FaUserCircle size={20} />
                </NavLink>
                ) : <NavLink to="/login" className="login-navlink">Login</NavLink>
            }
        </nav>
    )
}
