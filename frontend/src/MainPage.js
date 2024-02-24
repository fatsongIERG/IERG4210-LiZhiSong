import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';
import NavMenu from './NavMenu';
import MainContainer from './MainContainer';
import ShoppingList from './ShoppingList';

const MainPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // Fetch categories once on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:8000/categories');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const categoriesData = await response.json();
                setCategories(categoriesData);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch all products once on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:8000/products');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const productsData = await response.json();
                setProducts(productsData);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (product) => {
        // Handle adding products to the cart
    };

    return (
        <div className="main-container">
            <header className="header">
                <Link to="/" className="header-title">
                    <h1>Online Shopping Mall</h1>
                </Link>
                <Link to="/admin" className="admin-panel-link">
                    Admin Panel
                </Link>
                <img
                    src="https://cdn6.f-cdn.com/contestentries/1397912/17268448/5b7b6950e0845_thumb900.jpg"
                    alt="Shopping List"
                    className="shopping-list-button"
                    style={{ width: '100px', height: 'auto' }}
                />
                <ShoppingList className="shopping-list" />
            </header>
            <NavMenu
                categories={categories} // Pass the whole category object instead of just the name
            />
            <MainContainer
                products={products}
                handleAddToCart={handleAddToCart}
            />
        </div>
    );
};

export default MainPage;



