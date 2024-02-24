import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ category }) => {
  return (
    <div className="breadcrumb">
      <Link to="/">Home</Link>
      {category && <> {' > '} <Link to={`/category/${category}`}>{category}</Link></>}
    </div>
  );
};

const MainContainer = ({ products, handleAddToCart, category }) => {
    return (
      <div className="main-container">
        <Breadcrumb category={category} />
        <main className="product-list">
  {products.length > 0 ? (
    products.map((product) => (
      <div key={product.pid} className="product-cell">
        <Link to={`/product/${product.pid}`}>
          {/* Ensure that the image URL is correct. Use product.image_url or the correct property name based on your backend response */}
          <img src={product.image_url} alt={product.name} className="product-image" />
        </Link>
        <div className="product-info">
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
            Add to Cart
          </button>
        </div>
      </div>
    ))
  ) : (
    <p>No products found in this category.</p>
  )}
</main>

      </div>
    );
  };
  
export default MainContainer;
