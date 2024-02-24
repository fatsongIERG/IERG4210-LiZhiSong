// useFetchProducts.js
import { useState, useEffect } from 'react';

const useFetchProducts = (activeCategory = null) => {
    const [products, setProducts] = useState([]);

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
                setProducts(productsData);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };

        fetchProducts();
    }, [activeCategory]);

    return products;
};

export default useFetchProducts;
