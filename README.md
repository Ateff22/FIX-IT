# FixIt

FixIt is a home maintenance service platform that connects customers with technicians across multiple specialties (plumbing, electrical, AC repair, and more). Built as a final project for the iTi Node.js Bootcamp.

## Team

- Atef Mohamed
- Haidy Yousef

## Tech Stack

- Node.js / Express
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads
- Vanilla HTML/CSS/JS frontend

## Features

- Role-based accounts: customer, technician, admin
- Customers create service requests with title, description, specialty, location, and optional photo
- Technicians browse pending requests filtered by specialty, status, or title search
- Technicians submit offers (price + estimated time); customers accept one offer per request
- Atomic offer acceptance prevents race conditions when multiple technicians offer at once
- Technicians mark accepted jobs as completed (ownership-checked, only the assigned technician can complete)
- Customers rate technicians after a job is completed (one rating per request)
- Admin dashboard: manage users (ban/unban), view and delete requests, view and delete reviews
- Role-based visibility: customers only see their own requests, technicians see pending requests plus their own accepted/completed jobs, admins see everything
- File upload validation on request photos (type and size limits)

## Specialties

Plumber, Electrician, AC Technician, Carpenter, Painter, Mason, Appliance Technician, Locksmith, Glass & Aluminum Technician, Cleaning Technician, Gardener, Electronics Technician

## Project Structure

```
controllers/    business logic (auth, serviceRequest, offer, rating, admin)
middleware/      auth (protect, authorize), validators, upload, error handler
models/          Mongoose schemas (user, serviceRequest, offer, rating)
routes/          Express route definitions
HTML/            frontend pages (login, register, dashboards, request detail)
uploads/         uploaded request photos
server.js        app entry point, wires all routes together
```

## Setup

1. Clone the repo and install dependencies:
   ```
   npm install
   ```
2. Create a `.env` file with:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret
   PORT=5000
   ```
3. Start the server:
   ```
   node server.js
   ```
4. Open `HTML/index.html` in a browser, or serve the `HTML` folder statically.

## API Overview

- `POST /api/auth/register` — create an account
- `POST /api/auth/login` — get a JWT
- `GET /api/auth/me` — get current user
- `GET /api/requests` — list requests (supports `?specialty=&status=&search=` query params)
- `POST /api/requests` — create a request (customer only)
- `PUT /api/requests/:id/complete` — mark completed (assigned technician only)
- `DELETE /api/requests/:id` — delete a request and its related offers/ratings (admin)
- `POST /api/offers` — submit an offer (technician)
- `PUT /api/offers/:id/accept` — accept an offer (customer, request owner)
- `POST /api/ratings` — rate a technician after job completion
- `GET /api/admin/users`, `PUT /api/admin/users/:id/ban` — manage users
- `GET /api/admin/ratings`, `DELETE /api/admin/ratings/:id` — manage reviews

## API Documentation

Full request/response details are available in `swagger.json` and the Postman collection `FixIt.postman_collection.json`.
