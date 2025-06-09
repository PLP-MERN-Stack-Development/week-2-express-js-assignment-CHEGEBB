# Express.js RESTful API - Product Management

A complete RESTful API built with Express.js for managing products. This API includes CRUD operations, middleware implementation, error handling, and advanced features like filtering, pagination, and search.

## Features

- ✅ Full CRUD operations for products
- ✅ Custom middleware (logging, authentication, validation)
- ✅ Comprehensive error handling with custom error classes
- ✅ Filtering by category and stock status
- ✅ Pagination support
- ✅ Search functionality
- ✅ Product statistics endpoint
- ✅ UUID-based product IDs

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd express-restful-api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Protected routes require an API key in the request headers:
```
x-api-key: your-secret-api-key
```

### Product Schema
```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "inStock": "boolean"
}
```

## API Endpoints

### 1. Hello World
- **GET** `/`
- **Description:** Welcome message
- **Authentication:** Not required

**Response:**
```json
{
  "message": "Hello World! Welcome to the Products API"
}
```

### 2. Get All Products
- **GET** `/api/products`
- **Description:** Retrieve all products with optional filtering and pagination
- **Authentication:** Not required

**Query Parameters:**
- `category` (string): Filter by category
- `inStock` (boolean): Filter by stock status (true/false)
- `search` (string): Search in name, description, and category
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Example Request:**
```bash
GET /api/products?category=Electronics&page=1&limit=5
```

**Response:**
```json
{
  "products": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Gaming Laptop",
      "description": "High-performance laptop for gaming and productivity",
      "price": 1299.99,
      "category": "Electronics",
      "inStock": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalProducts": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3. Get Product by ID
- **GET** `/api/products/:id`
- **Description:** Retrieve a specific product by ID
- **Authentication:** Not required

**Example Request:**
```bash
GET /api/products/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Gaming Laptop",
  "description": "High-performance laptop for gaming and productivity",
  "price": 1299.99,
  "category": "Electronics",
  "inStock": true
}
```

### 4. Create Product
- **POST** `/api/products`
- **Description:** Create a new product
- **Authentication:** Required (API key)

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description here",
  "price": 99.99,
  "category": "Electronics",
  "inStock": true
}
```

**Response:**
```json
{
  "message": "Product created successfully",
  "product": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "New Product",
    "description": "Product description here",
    "price": 99.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

### 5. Update Product
- **PUT** `/api/products/:id`
- **Description:** Update an existing product
- **Authentication:** Required (API key)

**Request Body:**
```json
{
  "name": "Updated Product",
  "description": "Updated description",
  "price": 149.99,
  "category": "Electronics",
  "inStock": false
}
```

**Response:**
```json
{
  "message": "Product updated successfully",
  "product": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Updated Product",
    "description": "Updated description",
    "price": 149.99,
    "category": "Electronics",
    "inStock": false
  }
}
```

### 6. Delete Product
- **DELETE** `/api/products/:id`
- **Description:** Delete a product
- **Authentication:** Required (API key)

**Response:**
```json
{
  "message": "Product deleted successfully",
  "product": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Deleted Product",
    "description": "Product description",
    "price": 99.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

### 7. Search Products
- **GET** `/api/products/search`
- **Description:** Search products by name or description
- **Authentication:** Not required

**Query Parameters:**
- `q` (string, required): Search query

**Example Request:**
```bash
GET /api/products/search?q=laptop
```

**Response:**
```json
{
  "query": "laptop",
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Gaming Laptop",
      "description": "High-performance laptop for gaming and productivity",
      "price": 1299.99,
      "category": "Electronics",
      "inStock": true
    }
  ],
  "count": 1
}
```

### 8. Get Product Statistics
- **GET** `/api/products/stats`
- **Description:** Get product statistics and analytics
- **Authentication:** Not required

**Response:**
```json
{
  "totalProducts": 5,
  "inStockCount": 4,
  "outOfStockCount": 1,
  "categoryCounts": {
    "Electronics": 3,
    "Kitchen": 1,
    "Furniture": 1
  },
  "averagePrice": "553.99",
  "totalValue": "2769.95"
}
```

## Error Handling

The API uses custom error classes and returns appropriate HTTP status codes:

### Error Types

1. **ValidationError (400)**: Invalid request data
2. **AuthenticationError (401)**: Missing or invalid API key
3. **NotFoundError (404)**: Resource not found
4. **InternalServerError (500)**: Server-side errors

### Error Response Format

```json
{
  "error": "ValidationError",
  "message": "Validation failed: Name is required and must be at least 2 characters"
}
```

## Testing the API

### Using cURL

1. **Get all products:**
```bash
curl -X GET "http://localhost:3000/api/products"
```

2. **Create a product:**
```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{
    "name": "Test Product",
    "description": "This is a test product",
    "price": 29.99,
    "category": "Test",
    "inStock": true
  }'
```

3. **Search products:**
```bash
curl -X GET "http://localhost:3000/api/products/search?q=laptop"
```

4. **Get product statistics:**
```bash
curl -X GET "http://localhost:3000/api/products/stats"
```

### Using Postman

1. Import the following endpoints into Postman
2. Set the base URL to `http://localhost:3000`
3. For protected routes, add header: `x-api-key: your-secret-api-key`

## Middleware

### 1. Logger Middleware
- Logs all incoming requests with timestamp, method, and URL
- Applied to all routes

### 2. Authentication Middleware
- Checks for API key in request headers
- Required for POST, PUT, and DELETE operations
- Header format: `x-api-key: your-secret-api-key`

### 3. Validation Middleware
- Validates product data for create and update operations
- Ensures required fields are present and properly formatted
- Returns detailed validation error messages

### 4. Async Error Handler
- Wraps async route handlers to catch and forward errors
- Prevents unhandled promise rejections

## Project Structure

```
express-restful-api/
├── server.js          # Main application file
├── package.json       # Dependencies and scripts
├── .env.example       # Environment variables template
├── .env              # Environment variables (create this)
├── README.md         # API documentation
└── .gitignore        # Git ignore rules
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Server Configuration
PORT=3000

# API Security
API_KEY=your-secret-api-key
```

## Dependencies

### Production Dependencies
- **express**: Web framework for Node.js
- **uuid**: For generating unique product IDs
- **dotenv**: For loading environment variables

### Development Dependencies
- **nodemon**: For auto-restarting the server during development

## HTTP Status Codes Used

- `200 OK`: Successful GET, PUT requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing API key
- `403 Forbidden`: Invalid API key
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

## Advanced Features

### Filtering
- Filter products by category: `?category=Electronics`
- Filter by stock status: `?inStock=true`

### Pagination
- Page number: `?page=2`
- Items per page: `?limit=5`
- Returns pagination metadata

### Search
- Search across name, description, and category
- Case-insensitive matching
- Dedicated search endpoint with query statistics

### Statistics
- Total product count
- Stock status breakdown
- Category distribution
- Price analytics (average, total value)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please create an issue in the GitHub repository.
