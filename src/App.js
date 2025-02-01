import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { MyOrder } from "./pages/MyOrder";
import { Wishlist } from "./pages/Wishlist";
import { Cart } from "./pages/Cart";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import Header from "./components/Header";
import Footer from "./components/Footer";


function App() {
  return (
    <>
      <Header />

      <Routes>

        <Route path='/' element={<Home />} />

        <Route path='/shop' element={<Shop />} />

        <Route path='/my-orders' element={<MyOrder />} />

        <Route path='/wishlist' element={<Wishlist />} />

        <Route path='/cart' element={<Cart />} />

        <Route path='/login' element={<Login />} />

        <Route path='/profile' element={<Profile />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
