# Travel and Tour Booking System

This is a robust and scalable backend application for managing travel tours, user authentication, bookings, and payments. It's built with Node.js, Express, and MongoDB, incorporating best practices for security, error handling, and API design.

## Features

*   **User Authentication:** Secure user registration, login, and session management using JWT.
*   **Tour Management:** Create, read, update, and delete tour information.
*   **Booking System:** Facilitate tour bookings with payment integration.
*   **Payment Gateway Integration:** Handles payment processing (e.g., Stripe, though specific gateway details would be configured).
*   **Enquiry Management:** Allows users to send inquiries about tours.
*   **Role-Based Access Control:** Differentiates between user roles (e.g., admin, regular user) for access to specific functionalities.
*   **Image Uploads:** Securely upload and manage tour images using Cloudinary.
*   **Email Notifications:** Send booking confirmations, inquiry responses, and other transactional emails.
*   **Robust Error Handling:** Centralized error handling and logging.
*   **Security Best Practices:** Implements rate limiting, XSS protection, HPP prevention, and secure password hashing.
*   **Data Validation:** Comprehensive input validation for all user and tour data.

## Technologies Used

*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.
*   **MongoDB:** NoSQL database for flexible data storage.
*   **Mongoose:** MongoDB object data modeling (ODM) for Node.js.
*   **JWT (JSON Web Tokens):** For secure authentication and authorization.
*   **Bcryptjs:** For hashing passwords securely.
*   **Cloudinary:** Cloud-based image and video management.
*   **Multer:** Node.js middleware for handling `multipart/form-data`, primarily used for uploading files.
*   **Nodemailer:** Module for Node.js applications to allow easy email sending.
*   **Dotenv:** Loads environment variables from a `.env` file.
*   **Helmet:** Helps secure Express apps by setting various HTTP headers.
*   **Express-Rate-Limit:** Basic rate-limiting middleware for Express.
*   **XSS:** Cross-site scripting protection.
*   **Slugify:** Generates URL-friendly slugs from strings.
*   **Validator:** A library of string validators and sanitizers.
*   **Axios:** Promise-based HTTP client for the browser and Node.js.
*   **CORS:** Node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

## Installation

To set up the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Ishwor.stha/modified-travel-and-tour.git
    cd modified-travel-and-tour
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a file named `.env` in the root directory and add your environment variables.
    Example `.env` content with explanations:
    ```
    local=true                              # Indicates if the environment is local
    NODE_ENV=development                    # Environment mode (e.g., development, production)
    company_email=your_company_email@example.com # Company email address
    copyright=Your Company Name. All rights reserved. # Copyright notice for the application
    PORT=6000                               # Port on which the server will run
    DATABASE=your_mongodb_connection_string # MongoDB connection string
    URL=http://localhost:6000               # Base URL for the application
    SECRETKEY=your_application_secret_key   # Secret key for general application security
    jwtExpires=1h                           # JWT expiration time (e.g., 1 hour)

    # Cloudinary Credentials
    CLOUDNARY_SECRET=your_cloudinary_secret # Cloudinary API Secret
    CLOUDNARY_API_KEY=your_cloudinary_api_key # Cloudinary API Key
    CLOUDNARY_CLOUD_NAME=your_cloudinary_cloud_name # Cloudinary Cloud Name


    company_name=Your Company Name          # Company name
    SessionSecret=your_session_secret       # Secret for Express session management

    # Nodemailer Credentials (for direct SMTP)
    NODEMAILER_USER=your_nodemailer_user@gmail.com # Email address for Nodemailer (e.g., Gmail account)
    NODEMAILER_USER_PASSWORD=your_nodemailer_app_password # App password for Nodemailer email account
    NAME=Your App Name                      # Name to appear as sender in Nodemailer emails

    # Esewa Payment Gateway Configuration
    BASE_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form # Esewa payment initiation URL (sandbox/production)
    STATUS_CHECK=https://rc.esewa.com.np/api/epay/transaction/status/ # Esewa transaction status check URL (sandbox/production)
    PRODUCT_CODE=EPAYTEST                   # Esewa product code (for testing/production)
    SECRET_KEY=your_esewa_secret_key        # Esewa secret key for signature generation
    SUCCESS_URL=http://localhost:6000/api/tour # URL for successful payment callback
    FAILURE_URL=http://localhost:6000/api/tour/payment-failure # URL for failed payment callback
    ```
    *(Note: Adjust these values according to your specific setup and service providers. Ensure `NODEMAILER_USER_PASSWORD` is an app-specific password if using Gmail.)*

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The server will start on the port specified in your `.env` file (e.g., `http://localhost:5000`).

## API Endpoints

The API follows a RESTful design. Here are some of the key endpoints:

*   **Authentication:**
    *   `POST /api/v1/users/signup` - Register a new user
    *   `POST /api/v1/users/login` - Log in a user
    *   `GET /api/v1/users/logout` - Log out a user
    *   `GET /api/v1/users/me` - Get current user's profile
    *   `PATCH /api/v1/users/updatePassword` - Update user password
    *   `PATCH /api/v1/users/updateMe` - Update user details
    *   `DELETE /api/v1/users/deleteMe` - Delete current user account

*   **Tours:**
    *   `GET /api/v1/tours` - Get all tours
    *   `GET /api/v1/tours/:id` - Get a single tour by ID
    *   `POST /api/v1/tours` - Create a new tour (Admin only)
    *   `PATCH /api/v1/tours/:id` - Update a tour (Admin only)
    *   `DELETE /api/v1/tours/:id` - Delete a tour (Admin only)

*   **Bookings:**
    *   `POST /api/v1/bookings/checkout-session/:tourId` - Create a checkout session for a tour
    *   `GET /api/v1/bookings` - Get all bookings (Admin only)
    *   `GET /api/v1/bookings/my-bookings` - Get bookings for the current user

*   **Enquiries:**
    *   `POST /api/v1/enquiries` - Submit a new enquiry
    *   `GET /api/v1/enquiries` - Get all enquiries (Admin only)

## Folder Structure

```
.
├── app.js                  # Main Express application setup
├── server.js               # Server entry point
├── package.json            # Project dependencies and scripts
├── .gitignore              # Specifies intentionally untracked files to ignore
├── vercel.json             # Vercel deployment configuration
├── controller/
│   ├── authController.js   # Handles user and admin authentication (signup, password reset, profile updates, deletion, retrieval, logout).
│   ├── errorController.js  # Global error handling middleware for the application, providing consistent error responses.
│   ├── loginController.js  # Manages the login process, including checking user status and issuing JWTs.
│   ├── paymentController.js# Integrates with payment gateways (e.g., Esewa) for processing tour bookings and handling payment callbacks.
│   └── tourController.js   # Manages all tour-related operations (CRUD, image uploads, enquiries, booking initiation, filtering, sorting).
├── middlewares/
│   └── checkjwt.js         # JWT verification middleware
├── modles/                 # Mongoose models for database schemas
│   ├── descriptionModel.js # Schema for tour descriptions or similar
│   ├── ratingModel.js      # Schema for tour ratings
│   ├── tourModel.js        # Schema for tour data
│   └── userModel.js        # Schema for user data
├── public/                 # Static files (e.g., success/failure pages for payments)
│   ├── failure.html
│   └── sucess.html
├── route/                  # API route definitions
│   ├── adminRoute.js       # Routes specific to admin functionalities
│   ├── enquiryAndBookRoute.js # Routes for enquiries and bookings
│   └── tourRoute.js        # Routes for tour related operations
├── uploads/                # Directory for temporary file uploads (e.g., by Multer)
└── utils/                  # Utility functions and helpers
    ├── bookingMessageAdmin.js  # Email template/logic for admin booking notifications
    ├── bookingMessageUser.js   # Email template/logic for user booking confirmations
    ├── capitalizedFirstLetter.js # Utility for string manipulation
    ├── cloudinary.js           # Cloudinary configuration and upload helpers
    ├── databaseConnect.js      # Database connection setup
    ├── doValidations.js        # General validation functions
    ├── emailValidation.js      # Email specific validation
    ├── enquiryMessage.js       # Email template/logic for enquiry notifications
    ├── errorHandling.js        # Custom error classes or handlers
    ├── filter.js               # Data filtering utilities
    ├── isValidNumber.js        # Number validation utility
    ├── message.js              # General message utility
    ├── multer.js               # Multer configuration
    ├── nodemailer.js           # Nodemailer transporter setup
    ├── preventHpp.js           # HTTP Parameter Pollution prevention middleware
    ├── rateLimit.js            # Rate limiting configuration
    ├── sendMessage.js          # Generic message sending utility
    ├── sucessMessage.js        # Success message utility
    └── validatePhoneNumber.js  # Phone number validation utility
