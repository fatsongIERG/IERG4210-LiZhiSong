


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import MainPage from './MainPage';
import ProductPage from './ProductPage';
import CategoryPage from './CategoryPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/category/:catid" element={<CategoryPage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        
      </Routes>
    </Router>
  );
};

export default App;
