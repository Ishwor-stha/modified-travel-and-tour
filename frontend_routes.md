# Frontend Routes Documentation

**Note:** The port number (e.g., `6000`) in the example URLs might vary based on your local environment configuration (e.g., `process.env.PORT` in `server.js`).

This document outlines the complete API routes available for frontend consumption, along with their descriptions.

## Admin Routes (`route/adminRoute.js`)

*   **GET /api/admin/get-admins**
    *   Description: Retrieves a list of all administrators.
    *   Example: `http://localhost:6000/api/admin/get-admins`
    *   Authentication: Required (JWT)
    *   Optional Query Parameters: `page` (e.g., `?page=1`), `isDeleted` (e.g., `?isDeleted=true`)

*   **GET /api/admin/get**
    *   Description: Retrieves an administrator by their email or name.
    *   Example: `http://localhost:6000/api/admin/get?email=admin@example.com` or `http://localhost:6000/api/admin/get?name=AdminName`
    *   Authentication: Required (JWT)
    *   Required Query Parameters: `email` OR `name`

*   **GET /api/admin/get-admin/:id**
    *   Description: Retrieves an administrator by their ID.
    *   Example: `http://localhost:6000/api/admin/get-admin/654321abcdef`
    *   Authentication: Required (JWT)
    *   Path Parameters: `id` (required)

*   **POST /api/admin/create-admin/**
    *   Description: Creates a new administrator account.
    *   Example: `http://localhost:6000/api/admin/create-admin/`
    *   Authentication: Required (JWT)
    *   Required Body Fields: `name`, `gender`, `phone`, `email`, `address`, `password`, `confirmPassword`
    *   Body: `{ "name": "New Admin", "gender": "Male", "phone": "1234567890", "email": "newadmin@example.com", "address": "123 Admin St", "password": "securepassword", "confirmPassword": "securepassword" }`

*   **POST /api/admin/login-admin/**
    *   Description: Authenticates an administrator and provides a login token.
    *   Example: `http://localhost:6000/api/admin/login-admin/`
    *   Authentication: Not Required
    *   Required Body Fields: `email`, `password`
    *   Body: `{ "email": "admin@example.com", "password": "yourpassword" }`

*   **DELETE /api/admin/logout-admin/**
    *   Description: Logs out the currently authenticated administrator.
    *   Example: `http://localhost:6000/api/admin/logout-admin/`
    *   Authentication: Required (JWT)

*   **PATCH /api/admin/update-admin/**
    *   Description: Updates the details of an existing administrator.
    *   Example: `http://localhost:6000/api/admin/update-admin/`
    *   Authentication: Required (JWT)
    *   Required Body Fields: `currentPassword`
    *   Optional Body Fields: `name`, `gender`, `phone`, `email`, `address`, `password`, `confirmPassword` (at least one of these must be provided for update)
    *   Body: `{ "currentPassword": "yourpassword", "name": "Updated Admin Name" }`

*   **DELETE /api/admin/remove-admin/:id**
    *   Description: Removes an administrator account by ID.
    *   Example: `http://localhost:6000/api/admin/remove-admin/654321abcdef`
    *   Authentication: Required (JWT)
    *   Path Parameters: `id` (required)

*   **DELETE /api/admin/delete-account**
    *   Description: Deletes the currently authenticated administrator's own account.
    *   Example: `http://localhost:6000/api/admin/delete-account`
    *   Authentication: Required (JWT)
    *   Required Body Fields: `currentPassword`
    *   Body: `{ "currentPassword": "yourpassword" }`

*   **POST /api/admin/forget-password**
    *   Description: Initiates the password reset process for an administrator.
    *   Example: `http://localhost:6000/api/admin/forget-password`
    *   Authentication: Not Required
    *   Required Body Fields: `email`
    *   Body: `{ "email": "admin@example.com" }`

*   **PATCH /api/admin/reset-password/:code**
    *   Description: Resets the password for an administrator using a provided reset code.
    *   Example: `http://localhost:6000/api/admin/reset-password/your_reset_code`
    *   Authentication: Not Required
    *   Required Body Fields: `password`, `confirmPassword`
    *   Path Parameters: `code` (required)
    *   Body: `{ "password": "newsecurepassword", "confirmPassword": "newsecurepassword" }`

## Enquiry and Booking Routes (`route/enquiryAndBookRoute.js`)

*   **POST /api/tour/first-book-tour**
    *   Description: Allows a user to book a tour.
    *   Example: `http://localhost:6000/api/tour/first-book-tour?tourName=amazing-adventure-tour`
    *   Authentication: Not Required
    *   Required Query Parameters: `tourName` (slug of the tour)
    *   Required Body Fields: `startingDate`, `endingDate`, `fullName`, `email`, `country`, `contactNumber`, `emergencyContact`, `NumberofParticipants`, `advancePayment`, `payLater`
    *   Optional Body Fields: `flightArrivalDate`, `flightDepartureDate`, `otherInformation`
    *   Body: `{ "startingDate": "2025-12-01", "endingDate": "2025-12-10", "fullName": "Jane Doe", "email": "jane@example.com", "country": "USA", "contactNumber": "9876543210", "emergencyContact": "9876543211", "NumberofParticipants": 2, "advancePayment": 500, "payLater": 1500, "flightArrivalDate": "2025-11-30", "flightDepartureDate": "2025-12-11", "otherInformation": "Vegetarian meals requested." }`

*   **POST /api/tour/enquiry**
    *   Description: Submits an enquiry form.
    *   Example: `http://localhost:6000/api/tour/enquiry?tourId=654321abcdef`
    *   Authentication: Not Required
    *   Required Query Parameters: `tourId`
    *   Required Body Fields: `fullName`, `startDate`, `email`, `country`, `contact`, `question`
    *   Body: `{ "fullName": "John Doe", "startDate": "2025-10-15", "email": "john@example.com", "country": "Canada", "contact": "1234567890", "question": "What is included in the tour package?" }`

*   **POST /api/tour/pay-with-esewa**
    *   Description: Initiates a payment process using Esewa. This route uses data from the previous `first-book-tour` session.
    *   Example: `http://localhost:6000/api/tour/pay-with-esewa`
    *   Authentication: Not Required
    *   Required Session Data (from `first-book-tour`): `bookingData` (containing `advancePayment`)

*   **GET /api/tour/:transactionId/payment-success**
    *   Description: Callback route for successful Esewa payments. The `:transactionId` is provided by Esewa.
    *   Example: `http://localhost:6000/api/tour/your_transaction_id/payment-success?data=encoded_esewa_data`
    *   Authentication: Not Required
    *   Path Parameters: `transactionId` (required)
    *   Required Query Parameters: `data` (base64 encoded JSON string from Esewa)

*   **GET /api/tour/payment-failure**
    *   Description: Callback route for failed Esewa payments.
    *   Example: `http://localhost:6000/api/tour/payment-failure`
    *   Authentication: Not Required

## Tour Routes (`route/tourRoute.js`)

*   **GET /api/get-tours**
    *   Description: Retrieves a list of all available tours. Supports pagination and filtering.
    *   Example: `http://localhost:6000/api/get-tours?page=1&limit=10&sort=price&fields=name,price&country=Nepal&activity=Trekking`
    *   Authentication: Not Required
    *   Optional Query Parameters: `page` (number), `originalPrice` (`asc` or `desc`), `popularity` (`asc` or `desc`), `country` (string), `activity` (string), `grade` (string)

*   **GET /api/get-tour/:id**
    *   Description: Retrieves details of a single tour by its ID.
    *   Example: `http://localhost:6000/api/get-tour/654321abcdef`
    *   Authentication: Not Required
    *   Path Parameters: `id` (required)

*   **POST /api/tour-admin/post-tour**
    *   Description: Creates a new tour entry (admin only). Requires `thumbnail` file upload.
    *   Example: `http://localhost:6000/api/tour-admin/post-tour`
    *   Authentication: Required (JWT)
    *   Required Body Fields: `tourName`, `country`, `grade`, `activity`, `originalPrice`, `accomodation`, `region`, `distance`, `startPoint`, `discount`, `endPoint`, `duration`, `maxAltitude`, `mealsIncluded`, `groupSize`, `natureOfTour`, `bestSeason`, `activityPerDay`, `transportation`
    *   Required File: `thumbnail` (single file upload)
    *   Body: `multipart/form-data` with fields like `tourName: "Everest Base Camp Trek"`, `country: "Nepal"`, `grade: "Moderate"`, `activity: "Trekking"`, `originalPrice: 2000`, `accomodation: "Teahouse"`, `region: "Everest"`, `distance: "130km"`, `startPoint: "Lukla"`, `discount: 10`, `endPoint: "Lukla"`, `duration: "14 days"`, `maxAltitude: "5364m"`, `mealsIncluded: "Breakfast, Lunch, Dinner"`, `groupSize: "1-15"`, `natureOfTour: "Adventure"`, `bestSeason: "Spring, Autumn"`, `activityPerDay: "6-8 hours"`, `transportation: "Flight, Jeep"`, and `thumbnail` (file)

*   **PATCH /api/tour-admin/update-tour/:id**
    *   Description: Updates the details of an existing tour by its ID (admin only). Requires `thumbnail` file upload.
    *   Example: `http://localhost:6000/api/tour-admin/update-tour/654321abcdef`
    *   Authentication: Required (JWT)
    *   Path Parameters: `id` (required)
    *   Optional Body Fields: `tourName`, `country`, `grade`, `activity`, `originalPrice`, `accomodation`, `region`, `distance`, `startPoint`, `discount`, `endPoint`, `duration`, `maxAltitude`, `mealsIncluded`, `groupSize`, `natureOfTour`, `bestSeason`, `activityPerDay`, `transportation` (at least one of these must be provided for update)
    *   Optional File: `thumbnail` (single file upload, if updating thumbnail)
    *   Body: `multipart/form-data` with fields to update, e.g., `tourName: "Updated Everest Trek"`, `price: 2200`, and optionally `thumbnail` (file)

*   **POST /api/create-description/:tourId**
    *   Description: Creates a description for a specific tour.
    *   Example: `http://localhost:6000/api/create-description/654321abcdef`
    *   Authentication: Required (JWT)
    *   Path Parameters: `tourId` (required)
    *   Required Body Fields: `shortDescription`, `detailedDescription`, `highlights`
    *   Body: `{ "shortDescription": "A brief overview.", "detailedDescription": "A very detailed description of the tour.", "highlights": ["Scenic views", "Cultural immersion"] }`

*   **PATCH /api/update-description/:tourId**
    *   Description: Updates the description for a specific tour.
    *   Example: `http://localhost:6000/api/update-description/654321abcdef`
    *   Authentication: Required (JWT)
    *   Path Parameters: `tourId` (required)
    *   Optional Body Fields: `shortDescription`, `detailedDescription`, `highlights` (at least one of these must be provided for update)
    *   Body: `{ "detailedDescription": "An even more updated description." }`

*   **GET /api/get-description/:tourId**
    *   Description: Retrieves the description for a specific tour by its ID.
    *   Example: `http://localhost:6000/api/get-description/654321abcdef`
    *   Authentication: Required (JWT)
    *   Path Parameters: `tourId` (required)

*   **DELETE /api/tour-admin/delete-tour/:id**
    *   Description: Deletes a tour entry by its ID (admin only).
    *   Example: `http://localhost:6000/api/tour-admin/delete-tour/654321abcdef`
    *   Authentication: Required (JWT)
    *   Path Parameters: `id` (required)

*   **GET /api/get-tour-by-slug/:slug**
    *   Description: Retrieves details of a single tour by its slug.
    *   Example: `http://localhost:6000/api/get-tour-by-slug/amazing-adventure-tour`
    *   Authentication: Not Required
    *   Path Parameters: `slug` (required)

*   **POST /api/tours/:id/images**
    *   Description: Uploads multiple images for a specific tour (admin only). Accepts up to 10 images.
    *   Example: `http://localhost:6000/api/tours/654321abcdef/images`
    *   Authentication: Required (JWT)
    *   Path Parameters: `id` (required)
    *   Required Files: `images` (array of files, max 10)
    *   Body: `multipart/form-data` with `images` (multiple file inputs)

*   **DELETE /api/delete/:tourId/images/:publicId**
    *   Description: Deletes a specific image associated with a tour (admin only).
    *   Example: `http://localhost:6000/api/delete/654321abcdef/images/public_id_of_image`
    *   Authentication: Required (JWT)
    *   Path Parameters: `tourId` (required), `publicId` (required)
