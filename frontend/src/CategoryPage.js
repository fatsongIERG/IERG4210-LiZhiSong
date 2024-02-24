import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavMenu from './NavMenu';
import MainContainer from './MainContainer';
import ShoppingList from './ShoppingList';

const CategoryPage = () => {
  const { catid } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/categories');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const categoriesData = await response.json();
        setCategories(categoriesData);
        // Find the specific category using the catid
        const foundCategory = categoriesData.find(c => c.catid.toString() === catid);
        setCategory(foundCategory);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://localhost:8000/products/category/${catid}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const productsData = await response.json();
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    if (catid) {
      fetchCategories();
      fetchProducts();
    }
  }, [catid]);

  const handleAddToCart = (product) => {
    console.log('Adding to cart:', product);
  };

  if (!catid) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      <header className="header">
        <Link to="/" className="header-title">
          <h1>Online Shopping Mall</h1>
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
        category={category ? category.name : ''}
      />
    </div>
  );
};

export default CategoryPage;
