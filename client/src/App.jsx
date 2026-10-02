import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import BookDetail from './pages/BookDetail.jsx';
import Cart from './pages/Cart.jsx';
import MyReservations from './pages/MyReservations.jsx';
import Reviews from './pages/Reviews.jsx';
import About from './pages/About.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="browse" element={<Browse />} />
          <Route path="book/:id" element={<BookDetail />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Member-only */}
          <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route
            path="my-reservations"
            element={<ProtectedRoute><MyReservations /></ProtectedRoute>}
          />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin-only */}
          <Route
            path="admin"
            element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
