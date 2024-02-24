
import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { useDropzone } from 'react-dropzone';



const useFetchProducts = (activeCategory, triggerFetch) => {
    const [products, setProducts] = useState([]);
    const [fetchTrigger, setFetchTrigger] = useState(false);

    useEffect(() => {
      async function fetchProducts() {
        // Construct the URL as before
        let url = 'http://localhost:8000/products';
        if (activeCategory) {
          url += `/category/${activeCategory}`;
        }
        // Fetch logic remains unchanged
        try {
          const response = await fetch(url);
          // Additional logic remains unchanged
          const productsData = await response.json();
          setProducts(productsData);
        } catch (error) {
          console.error('Failed to fetch products:', error);
        }
      }

      fetchProducts();
    }, [activeCategory, fetchTrigger]); // Depend on fetchTrigger to re-trigger fetch

    // Function to allow external trigger
    const triggerFetchProducts = () => setFetchTrigger(t => !t);

    return { products, triggerFetchProducts };
};

const AdminPanel = () => {
    const [categories, setCategories] = useState([]); 
    const [categoryName, setCategoryName] = useState('');
    const [product, setProduct] = useState({
        category: '',
        name: '',
        price: '',
        description: '',
        image: null,
    });

    
    const [productsDirect, setProductsDirect] = useState([]); // Added state for direct product management
    const [refreshProducts, setRefreshProducts] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [refresh, setRefresh] = useState(false);
    // Use the custom hook to fetch products
    const { products, triggerFetchProducts } = useFetchProducts(activeCategory, refreshProducts);
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };
    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8000/categories');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setCategories(data);
            if (data.length > 0) {
                setProduct(prevProduct => ({ ...prevProduct, category: data[0].catid }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);
    useEffect(() => {
        const fetchProducts = async () => {
          let url = 'http://localhost:8000/products';
          if (activeCategory) {
            url += `/category/${activeCategory}`;
          }
      
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const productsData = await response.json();
            setProductsDirect(productsData); // Use setProductsDirect to update the state
          } catch (error) {
            console.error('Failed to fetch products:', error);
          }
        };
      
        fetchProducts();
      }, [activeCategory, refresh]); 
      
    
    const handleImageChange = (e) => {
        setProduct({ ...product, image: e.target.files[0] });
    };


    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/add-category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: categoryName }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            alert(data);
            fetchCategories(); 
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Error adding category');
        }
    };
 
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('category', product.category);
        formData.append('name', product.name);
        formData.append('price', product.price);
        formData.append('description', product.description);
        // Ensure you have 'inventory' in your state if you are using it, otherwise remove this line
        formData.append('inventory', product.inventory); 
        if (product.image) formData.append('image', product.image);
       
        try {
            const response = await fetch('http://localhost:8000/add-product', {
                method: 'POST',
                body: formData,
                // Note: Do not set Content-Type header for multipart/form-data
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            alert(data);
    
            // Reset the product form state to clear the form fields
            setProduct({
                category: '',
                name: '',
                price: '',
                description: '',
                image: null,
            });
    
            // Call triggerFetchProducts to refresh the product list
            triggerFetchProducts();
            
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Error adding product');
        }
    };
    
    
    
    const handleDeleteCategory = async (catid) => {
        try {
            const response = await fetch(`http://localhost:8000/delete-category/${catid}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            await response.text();
            fetchCategories(); // Refresh categories list
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error deleting category');
        }
    };

    const [selectedProduct, setSelectedProduct] = useState('');

const handleProductChange = (event) => {
  setSelectedProduct(event.target.value);
};

// Assume handleDeleteProduct is already implemented to delete the selected product


    const handleDeleteProduct = async (productId) => {
        if (!productId) {
            console.error('Product ID is undefined');
            alert('Error: Product ID is undefined');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:8000/delete-product/${productId}`, { 
                method: 'DELETE' 
            });
            if (!response.ok) throw new Error('Network response was not ok');
            
            // Trigger a re-fetch of products
            triggerFetchProducts();
    
            // Optionally, you could directly remove the product from the local state
            // without needing to re-fetch from the server, which can be more efficient:
            setProductsDirect(currentProducts => 
                currentProducts.filter(product => product.pid !== productId)
            );
    
            alert('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    };
    
    
    
    return (
        <div>
            <h1>Admin Panel</h1>
            <div className="container">
                <div className="form-section">
                    
                    <h2>Add Category</h2>
                    <form onSubmit={handleCategorySubmit}>
                        <label htmlFor="name">Category Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                        />
                        <input type="submit" value="Add Category" />
                    </form>
                </div>
                <div className="list-section">
  <h2>Delete Categories</h2>
  <div className="dropdown-container">
    <select className="category-dropdown" onChange={handleCategoryChange} value={selectedCategory}>
      <option value="">Select a category</option>
      {categories.map((category) => (
        <option key={category.catid} value={category.catid}>
          {category.name}
        </option>
      ))}
    </select>
    <button className="delete-button" onClick={() => handleDeleteCategory(selectedCategory)}>
      Delete Selected Category
    </button>
  </div>
</div>

               
                <div className="form-section">
                    <h2>Add Product</h2>
                    <form onSubmit={handleProductSubmit} encType="multipart/form-data">
                        <label htmlFor="category">Category:</label>
                        <select
                            id="category"
                            name="category"
                            required
                            value={product.category}
                            onChange={(e) => setProduct({ ...product, category: e.target.value })}
                        >
                            {categories.map((category) => (
                                <option key={category.catid} value={category.catid}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="name">Product Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={product.name}
                            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                        />
                        <label htmlFor="price">Price:</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            required
                            value={product.price}
                            onChange={(e) => setProduct({ ...product, price: e.target.value })}
                        />
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            value={product.description}
                            onChange={(e) => setProduct({ ...product, description: e.target.value })}
                        />
                          <label htmlFor="image">Image:</label>
          
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                        />
              
                        {
                            product.image && (
                                <div className="dropzone">
                                    <img src={URL.createObjectURL(product.image)} alt="preview" style={{ maxWidth: '300px', maxHeight: '300px' }} />
                                </div>
                            )
                        }
                        <input type="submit" value="Add Product" />
                    </form>
                    </div>
 
                    <div className="list-section">
  <h2>Delete Products</h2>
  <div className="dropdown-container">
    <select className="product-dropdown" onChange={handleProductChange} value={selectedProduct}>
      <option value="">Select a product</option>
      {products.map((product) => (
        <option key={product.pid} value={product.pid}>
          {product.name}
        </option>
      ))}
    </select>
    <button className="delete-button" onClick={() => handleDeleteProduct(selectedProduct)}>
      Delete Selected Product
    </button>
  </div>
</div>


              
            </div>
        </div>
    );
};

export default AdminPanel;
