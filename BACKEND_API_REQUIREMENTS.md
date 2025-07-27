# Backend API Requirements for Checkout System

## Overview
This document outlines the backend APIs required to support the checkout functionality in your React Native app. The checkout system includes order creation, order management, and payment processing.

## Required APIs

### 1. Order Creation API

**Endpoint:** `POST /api/v1/orders/create`

**Description:** Creates a new order from cart items

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "customerInfo": {
    "name": "John Doe",
    "phone": "+8801234567890",
    "email": "john@example.com"
  },
  "shippingInfo": {
    "address": "123 Main Street",
    "division": "Dhaka",
    "district": "Dhaka City",
    "upazila": "Dhanmondi",
    "postCode": "1209"
  },
  "paymentInfo": {
    "method": "cash_on_delivery" // or "bkash"
  },
  "orderInfo": {
    "items": [
      {
        "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "quantity": 2,
        "price": 90000,
        "productName": "Tomato"
      }
    ],
    "subtotal": 180000,
    "deliveryFee": 60,
    "total": 180060,
    "notes": "Please deliver in the morning"
  }
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "orderId": "ORD-2024-001",
  "data": {
    "order": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "orderId": "ORD-2024-001",
      "customerId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "customerInfo": {
        "name": "John Doe",
        "phone": "+8801234567890",
        "email": "john@example.com"
      },
      "shippingInfo": {
        "address": "123 Main Street",
        "division": "Dhaka",
        "district": "Dhaka City",
        "upazila": "Dhanmondi",
        "postCode": "1209"
      },
      "paymentInfo": {
        "method": "cash_on_delivery",
        "status": "pending"
      },
      "orderInfo": {
        "items": [
          {
            "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
            "quantity": 2,
            "price": 90000,
            "productName": "Tomato",
            "total": 180000
          }
        ],
        "subtotal": 180000,
        "deliveryFee": 60,
        "total": 180060,
        "notes": "Please deliver in the morning"
      },
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Response (Error - 400/401/500):**
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

### 2. Get User Orders API

**Endpoint:** `GET /api/v1/orders`

**Description:** Retrieves all orders for the authenticated user

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Query Parameters (Optional):**
```
?status=pending&limit=10&page=1
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "orderId": "ORD-2024-001",
        "customerId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "customerInfo": {
          "name": "John Doe",
          "phone": "+8801234567890",
          "email": "john@example.com"
        },
        "shippingInfo": {
          "address": "123 Main Street",
          "division": "Dhaka",
          "district": "Dhaka City",
          "upazila": "Dhanmondi",
          "postCode": "1209"
        },
        "paymentInfo": {
          "method": "cash_on_delivery",
          "status": "pending"
        },
        "orderInfo": {
          "items": [
            {
              "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
              "quantity": 2,
              "price": 90000,
              "productName": "Tomato",
              "total": 180000
            }
          ],
          "subtotal": 180000,
          "deliveryFee": 60,
          "total": 180060,
          "notes": "Please deliver in the morning"
        },
        "status": "pending",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### 3. Get Order Details API

**Endpoint:** `GET /api/v1/orders/:orderId`

**Description:** Retrieves detailed information about a specific order

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Order details retrieved successfully",
  "data": {
    "order": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "orderId": "ORD-2024-001",
      "customerId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "customerInfo": {
        "name": "John Doe",
        "phone": "+8801234567890",
        "email": "john@example.com"
      },
      "shippingInfo": {
        "address": "123 Main Street",
        "division": "Dhaka",
        "district": "Dhaka City",
        "upazila": "Dhanmondi",
        "postCode": "1209"
      },
      "paymentInfo": {
        "method": "cash_on_delivery",
        "status": "pending"
      },
      "orderInfo": {
        "items": [
          {
            "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
            "quantity": 2,
            "price": 90000,
            "productName": "Tomato",
            "total": 180000
          }
        ],
        "subtotal": 180000,
        "deliveryFee": 60,
        "total": 180060,
        "notes": "Please deliver in the morning"
      },
      "status": "pending",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2024-01-15T10:30:00.000Z",
          "note": "Order created"
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 4. Update Order Status API

**Endpoint:** `PUT /api/v1/orders/status/:orderId`

**Description:** Updates the status of an order (admin/seller only)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "confirmed", // pending, confirmed, processing, shipped, delivered, cancelled
  "note": "Order confirmed and will be processed soon"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "order": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "orderId": "ORD-2024-001",
      "status": "confirmed",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2024-01-15T10:30:00.000Z",
          "note": "Order created"
        },
        {
          "status": "confirmed",
          "timestamp": "2024-01-15T11:00:00.000Z",
          "note": "Order confirmed and will be processed soon"
        }
      ],
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 5. Cancel Order API

**Endpoint:** `PUT /api/v1/orders/cancel/:orderId`

**Description:** Cancels an order (customer can only cancel pending orders)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Changed my mind" // Optional
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "order": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "orderId": "ORD-2024-001",
      "status": "cancelled",
      "cancellationReason": "Changed my mind",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2024-01-15T10:30:00.000Z",
          "note": "Order created"
        },
        {
          "status": "cancelled",
          "timestamp": "2024-01-15T11:30:00.000Z",
          "note": "Order cancelled by customer"
        }
      ],
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  }
}
```

## Database Schema

### Order Collection
```javascript
{
  _id: ObjectId,
  orderId: String, // Auto-generated unique order ID (e.g., ORD-2024-001)
  customerId: ObjectId, // Reference to User collection
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  shippingInfo: {
    address: String,
    division: String,
    district: String,
    upazila: String,
    postCode: String
  },
  paymentInfo: {
    method: String, // "cash_on_delivery", "bkash", etc.
    status: String, // "pending", "paid", "failed"
    transactionId: String // For online payments
  },
  orderInfo: {
    items: [
      {
        productId: ObjectId,
        quantity: Number,
        price: Number,
        productName: String,
        total: Number
      }
    ],
    subtotal: Number,
    deliveryFee: Number,
    total: Number,
    notes: String
  },
  status: String, // "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"
  statusHistory: [
    {
      status: String,
      timestamp: Date,
      note: String
    }
  ],
  cancellationReason: String, // If order is cancelled
  createdAt: Date,
  updatedAt: Date
}
```

## Business Logic Requirements

### 1. Order Creation Process
1. **Validate cart items** - Ensure all items exist and are available
2. **Calculate totals** - Verify subtotal, delivery fee, and total calculations
3. **Generate order ID** - Create unique order identifier
4. **Create order record** - Save order to database
5. **Clear cart** - Remove ordered items from user's cart
6. **Send notifications** - Notify customer and admin about new order

### 2. Order Status Flow
```
pending → confirmed → processing → shipped → delivered
    ↓
cancelled
```

### 3. Payment Processing
- **Cash on Delivery**: Mark as pending, update when delivered
- **bKash**: Integrate with bKash API for payment processing

### 4. Validation Rules
- Customer can only cancel pending orders
- Only admin/seller can update order status
- Order total must match calculated total
- All required fields must be provided

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

### Error Codes
- `INVALID_ORDER_DATA` - Missing or invalid order information
- `CART_EMPTY` - No items in cart
- `PRODUCT_NOT_FOUND` - Product doesn't exist
- `INSUFFICIENT_STOCK` - Not enough product stock
- `ORDER_NOT_FOUND` - Order doesn't exist
- `UNAUTHORIZED_STATUS_UPDATE` - Cannot update order status
- `ORDER_ALREADY_CANCELLED` - Order is already cancelled
- `INVALID_PAYMENT_METHOD` - Unsupported payment method

## Security Considerations

1. **Authentication** - All endpoints require valid JWT token
2. **Authorization** - Users can only access their own orders
3. **Input Validation** - Validate all input data
4. **Rate Limiting** - Prevent abuse of order creation
5. **Data Sanitization** - Clean user input to prevent injection attacks

## Testing Requirements

### Test Cases
1. Create order with valid data
2. Create order with invalid data
3. Create order with empty cart
4. Get user orders
5. Get specific order details
6. Update order status (admin)
7. Cancel order (customer)
8. Cancel order (admin)
9. Handle payment processing
10. Error handling scenarios

## Implementation Notes

1. **Order ID Generation**: Use timestamp + random string or auto-increment
2. **Cart Clearing**: Clear cart items after successful order creation
3. **Notifications**: Send email/SMS notifications for order updates
4. **Inventory Management**: Update product stock when order is confirmed
5. **Payment Integration**: Integrate with payment gateways for online payments
6. **Order Tracking**: Implement order tracking system
7. **Reports**: Generate order reports for admin dashboard

## Additional Features (Optional)

1. **Order Tracking**: Real-time order status updates
2. **Order History**: Detailed order history with filters
3. **Order Reviews**: Allow customers to review completed orders
4. **Order Returns**: Handle order returns and refunds
5. **Bulk Orders**: Support for bulk order processing
6. **Order Analytics**: Order statistics and analytics
7. **Order Notifications**: Push notifications for order updates 