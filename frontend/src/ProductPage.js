import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductPage.css';
import NavMenu from './NavMenu';
import ShoppingList from './ShoppingList';

const Breadcrumbs = ({ category, productName }) => (
  <div className="breadcrumbs">
    <Link to="/">Home</Link> {' > '}
    {category && <Link to={`/category/${category.catid}`}>{category.name}</Link>} {' > '}
    <span>{productName}</span>
  </div>
);

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
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
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setError(error.message);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const response = await fetch(`http://localhost:8000/products/${productId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const productData = await response.json();
        setProduct(productData);

        // Find and set the category for the product
        const productCategory = categories.find(c => c.catid === productData.catid);
        setCategory(productCategory);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setError(error.message);
      }
    };

    if (categories.length > 0) {
      fetchProduct();
    }
  }, [productId, categories]);

  if (!productId) {
    return <div>Product ID is undefined.</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product || !category) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      <header className="header">
        {/* Header content */}
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
     
      <div className="product-page">
      <Breadcrumbs category={category} productName={product.name} />
        <div className="product-container">
          <div className="product-images">
            <img src={product.image_url} alt={product.name} />
          </div>
          <div className="product-details">
            <h2>{product.name}</h2>
            <p className="product-price">Price: ${product.price}</p>
            {product.description && <p className="product-description">{product.description}</p>}
            <button type="button" className="btn-add-to-cart">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
