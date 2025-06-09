const express = require('express');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

let products = [
  { 
    id: uuidv4(), 
    name: 'Gaming Laptop', 
    description: 'High-performance laptop for gaming and productivity',
    price: 1299.99, 
    category: 'Electronics', 
    inStock: true 
  },
  { 
    id: uuidv4(), 
    name: 'Smartphone Pro', 
    description: 'Latest flagship smartphone with advanced camera',
    price: 899.99, 
    category: 'Electronics', 
    inStock: true 
  },
  { 
    id: uuidv4(), 
    name: 'Coffee Maker', 
    description: 'Automatic drip coffee maker with programmable timer',
    price: 79.99, 
    category: 'Kitchen', 
    inStock: false 
  },
  { 
    id: uuidv4(), 
    name: 'Ergonomic Office Chair', 
    description: 'Comfortable office chair with lumbar support',
    price: 249.99, 
    category: 'Furniture', 
    inStock: true 
  },
  { 
    id: uuidv4(), 
    name: 'Wireless Mouse', 
    description: 'Precision wireless mouse with long battery life',
    price: 39.99, 
    category: 'Electronics', 
    inStock: true 
  }
];

// Middleware
app.use(express.json());

// Custom logger middleware
const logRequests = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

// Authentication middleware - checks for API key
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY || 'your-secret-api-key';

  if (!apiKey) {
    return next(new AuthenticationError('API key is required'));
  }

  if (apiKey !== validApiKey) {
    return next(new AuthenticationError('Invalid API key'));
  }

  next();
};

// Validation middleware for product data
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    errors.push('Description is required and must be at least 5 characters');
  }

  if (!price || typeof price !== 'number' || price <= 0) {
    errors.push('Price is required and must be a positive number');
  }

  if (!category || typeof category !== 'string' || category.trim().length < 2) {
    errors.push('Category is required and must be at least 2 characters');
  }

  if (typeof inStock !== 'boolean') {
    errors.push('inStock is required and must be a boolean value');
  }

  if (errors.length > 0) {
    return next(new ValidationError(`Validation failed: ${errors.join(', ')}`));
  }

  next();
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.use(logRequests);

// Routes

// Root endpoint - Hello World
app.get('/', (req, res) => {
  res.json({ message: 'Hello World! Welcome to the Products API' });
});

// GET /api/products - List all products with filtering, pagination, and search
app.get('/api/products', asyncHandler(async (req, res) => {
  let filteredProducts = [...products];
  
  const { category, search, page = 1, limit = 10, inStock } = req.query;
  
  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Filter by stock status
  if (inStock !== undefined) {
    const stockFilter = inStock === 'true';
    filteredProducts = filteredProducts.filter(product => product.inStock === stockFilter);
  }
  
  // Search functionality
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
  
  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(filteredProducts.length / limitNum),
      totalProducts: filteredProducts.length,
      hasNext: endIndex < filteredProducts.length,
      hasPrev: startIndex > 0
    }
  });
}));

// GET /api/products/search - Search products by name
app.get('/api/products/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    throw new ValidationError('Search query parameter "q" is required');
  }
  
  const searchTerm = q.toLowerCase();
  const searchResults = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm)
  );
  
  res.json({
    query: q,
    results: searchResults,
    count: searchResults.length
  });
}));

// GET /api/products/stats - Get product statistics
app.get('/api/products/stats', asyncHandler(async (req, res) => {
  const stats = {
    totalProducts: products.length,
    inStockCount: products.filter(p => p.inStock).length,
    outOfStockCount: products.filter(p => !p.inStock).length,
    categoryCounts: {},
    averagePrice: 0,
    totalValue: 0
  };
  
  // Calculate category counts and price statistics
  let totalPrice = 0;
  products.forEach(product => {
    // Category counts
    if (stats.categoryCounts[product.category]) {
      stats.categoryCounts[product.category]++;
    } else {
      stats.categoryCounts[product.category] = 1;
    }
    
    // Price calculations
    totalPrice += product.price;
  });
  
  stats.averagePrice = products.length > 0 ? (totalPrice / products.length).toFixed(2) : 0;
  stats.totalValue = totalPrice.toFixed(2);
  
  res.json(stats);
}));

// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  
  res.json(product);
}));

// POST /api/products - Create a new product (requires authentication)
app.post('/api/products', authenticateApiKey, validateProduct, asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  
  const newProduct = {
    id: uuidv4(),
    name: name.trim(),
    description: description.trim(),
    price: parseFloat(price),
    category: category.trim(),
    inStock: Boolean(inStock)
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    message: 'Product created successfully',
    product: newProduct
  });
}));

// PUT /api/products/:id - Update an existing product (requires authentication)
app.put('/api/products/:id', authenticateApiKey, validateProduct, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, inStock } = req.body;
  
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    throw new NotFoundError('Product not found');
  }
  
  products[productIndex] = {
    id: id,
    name: name.trim(),
    description: description.trim(),
    price: parseFloat(price),
    category: category.trim(),
    inStock: Boolean(inStock)
  };
  
  res.json({
    message: 'Product updated successfully',
    product: products[productIndex]
  });
}));

// DELETE /api/products/:id - Delete a product (requires authentication)
app.delete('/api/products/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    throw new NotFoundError('Product not found');
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.json({
    message: 'Product deleted successfully',
    product: deletedProduct
  });
}));

// Global error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Handle custom errors
  if (err instanceof NotFoundError || err instanceof ValidationError || err instanceof AuthenticationError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message
    });
  }
  
  // Handle other errors
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Something went wrong on the server'
  });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'NotFound',
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/products`);
});
