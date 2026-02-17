
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './contexts/StoreContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Store from './pages/Store';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderReceived from './pages/OrderReceived';
import AbacusTraining from './pages/AbacusTraining';
import AdminPanel from './pages/AdminPanel';
import StudentDashboard from './pages/StudentDashboard';
import CourseViewer from './pages/CourseViewer';
import InstructorPanel from './pages/InstructorPanel';
import AIChat from './components/AIChat';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/store" element={<Store />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/training" element={<AbacusTraining />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-received/:id" element={<OrderReceived />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* LMS Routes */}
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/course/:id" element={<CourseViewer />} />
              <Route path="/instructor" element={<InstructorPanel />} />

              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/categories" element={<div className="text-center pt-20 text-gray-500">صفحه دسته‌بندی (به زودی)</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <AIChat />
          </Layout>
        </Router>
      </AuthProvider>
    </StoreProvider>
  );
};

export default App;
