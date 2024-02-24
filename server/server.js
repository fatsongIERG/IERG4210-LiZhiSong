const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
const fs = require('fs');
const uploadsDir = './uploads';

if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const path = require('path');
const port = 8000;
console.log("Current directory:", __dirname);


// Set up storage engine for Multer
const storage = multer.diskStorage({
   destination: function(req, file, cb) {
       cb(null, 'uploads/');
   },
   filename: function(req, file, cb) {
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
       cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
   }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });


// Connect to SQLite database
const db = new sqlite3.Database('./mydatabase.db', (err) => {
   if (err) {
       console.error(err.message);
   }
   console.log('Connected to the database.');
});


app.use(express.urlencoded({ extended: true }));


// Serve HTML forms
app.get('/admin-panel', (req, res) => {
   db.all("SELECT catid, name FROM categories", [], (err, categories) => {
       if (err) {
           console.error(err.message);
           res.send("Error retrieving categories from the database.");
           return;
       }


       let categoryOptions = categories.map(category => `<option value="${category.catid}">${category.name}</option>`).join('\n');


       // Use the constructed path to read the admin_panel.html file
       fs.readFile(adminPanelPath, 'utf8', (err, html) => {
           if (err) {
               console.error(err.message);
               res.send("Error loading the admin panel page.");
               return;
           }


           const finalHtml = html.replace('<!-- Options will be populated server-side -->', categoryOptions);
           res.send(finalHtml);
       });
   });
});
// Server-side route to handle fetching a single product by ID

  

app.get('/categories', (req, res) => {
   db.all("SELECT catid, name FROM categories", [], (err, categories) => {
       if (err) {
           console.error(err.message);
           res.status(500).send("Error retrieving categories from the database.");
           return;
       }
       res.json(categories);
   });
});




// Endpoint to handle adding categories
app.post('/add-category', (req, res) => {
   const { name } = req.body;
   console.log("Received name:", name); // Add this line for debugging
   db.run(`INSERT INTO categories (name) VALUES (?)`, [name], function(err) {
       if (err) {
           res.send('Error adding category');
           return console.error(err.message);
       }
       res.send('Category added successfully');
   });
});


app.post('/add-product', upload.single('image'), (req, res) => {
    console.log("File metadata:", req.file);
    const { category, name, price, description } = req.body;
    let { inventory } = req.body;
    
    inventory = inventory || 0; // Default inventory to 0 if it's undefined

    if (!req.file) {
        return res.status(400).send('No image uploaded');
    }

    const imageUrl = `http://localhost:${port}/uploads/${req.file.filename}`;

    db.run(`INSERT INTO products (catid, name, price, inventory, description, image_url) VALUES (?, ?, ?, ?, ?, ?)`, 
           [category, name, price, inventory, description, imageUrl], 
           function(err) {
        if (err) {
            console.error("Database insertion error:", err);
            return res.status(500).send(`Error adding product to the database: ${err.message}`);
        }
        console.log('Product added successfully');
        res.send('Product added successfully');
    });
});


app.get('/product-image/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT image, image_type FROM products WHERE id = ?`, [id], (err, row) => {
        if (err) {
            res.status(500).send('Database error');
            return console.error(err.message);
        }
        if (row && row.image) {
            res.writeHead(200, {
                'Content-Type': row.image_type, // Dynamically set the Content-Type
                'Content-Length': row.image.length
            });
            res.end(row.image);
        } else {
            res.status(404).send('Image not found');
        }
    });
});

 
app.use('/uploads', express.static('uploads'));


// Endpoint to fetch products by category ID
app.get('/products/category/:catid', (req, res) => {
    const catid = req.params.catid;
    db.all("SELECT * FROM products WHERE catid = ?", [catid], (err, products) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error retrieving products from the database.");
            return;
        }
        res.json(products);
    });
});

app.get('/category/:catid', (req, res) => {
    const catid = req.params.catid;
    db.get("SELECT * FROM categories WHERE catid = ?", [catid], (err, category) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error retrieving category from the database.");
            return;
        }
        if (!category) {
            res.status(404).send("Category not found");
            return;
        }
        res.json(category);
    });
});

app.get('/products/category/:catid', (req, res) => {
    const { catid } = req.params;
    db.all("SELECT * FROM products WHERE category = ?", [catid], (err, products) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error retrieving products from the database.");
            return;
        }
        if (products.length === 0) {
            res.status(404).send("No products found for this category.");
            return;
        }
        res.json(products);
    });
});

app.delete('/delete-category/:catid', (req, res) => {
    const { catid } = req.params;
    // Your database query to delete the category
    db.run(`DELETE FROM categories WHERE catid = ?`, [catid], function(err) {
        if (err) {
            return console.error(err.message);
            res.status(500).send('Error deleting category');
        }
        res.send('Category deleted successfully');
    });
});

// Endpoint to fetch all products
app.get('/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, products) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error retrieving products from the database.");
            return;
        }
        res.json(products);
    });
});
app.get('/products/:productId', (req, res) => {
    const { productId } = req.params; // Extract the productId from the request parameters
    const sql = "SELECT * FROM products WHERE pid = ?"; // SQL query with placeholder for productId

    db.get(sql, [productId], (err, product) => { // Use db.get() to fetch single entry
        if (err) {
            console.error(err.message);
            res.status(500).send("Error retrieving product from the database.");
            return;
        }
        if (product) {
            res.json(product); // Send back the single product as JSON
        } else {
            res.status(404).send("Product not found"); // Send 404 if no product was found
        }
    });
});

app.post('/add-product', upload.single('image'), (req, res) => {
    // ... handle the product addition logic ...
  
    // Once the product is added to the database, send back a JSON response
    // Make sure 'newProduct' has all the necessary fields that the frontend expects
    const newProduct = {
      pid: newlyCreatedProductId, // This should be the ID generated by the database
      category: req.body.category,
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      // Include any other fields that are part of your product model
    };
  
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  });
  


// ...
app.delete('/delete-product/:productId', (req, res) => {
    const { productId } = req.params;
    db.run(`DELETE FROM products WHERE pid = ?`, [productId], function(err) {
        if (err) {
            console.error('Error deleting product:', err.message);
            res.status(500).send(`Error deleting product: ${err.message}`);
            return;
        }
        if (this.changes === 0) {
            res.status(404).send('Product not found');
        } else {
            res.send('Product deleted successfully');
        }
    });
});




app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`);
});
