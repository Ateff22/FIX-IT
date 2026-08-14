# FixIt

FixIt is a backend REST API for a home maintenance service platform. Customers post a service request when something breaks at home (washing machine, AC, plumbing, etc), technicians in that specialty send offers, the customer picks one, and after the job is done the customer rates the technician.

This is our final project for the iTi Node.js Bootcamp.

## Team

- Atef Mohamed
- Haidy Yousef
- Aya Ehab
- Malak Waleed
- Sherif Ahmed

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Multer for file uploads
- express-validator for input validation
- dotenv for environment variables

## Roles

There are 3 roles: customer, technician and admin. What each one can do:

**Customer**
- register / login
- create a service request (can attach a photo of the problem)
- view requests
- accept an offer from a technician
- rate the technician after the request is completed

**Technician**
- register / login
- view requests
- submit an offer on a request
- mark a request as completed

**Admin**
- view all users
- ban / unban a user

## Setup

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your own values (Mongo URI, JWT secret, port)
4. Run `npm start` (or `npm run dev` to auto restart on changes)

Server runs on `http://localhost:5000` by default.

## Environment Variables

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Project Structure

```
controllers/   route logic
models/        mongoose schemas
routes/        express routers
middleware/    auth, validation, upload, error handling
uploads/       uploaded photos (not committed)
server.js      app entry point
```

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | register a new user |
| POST | /api/auth/login | Public | login, returns JWT |
| GET | /api/auth/me | Logged in | returns current user info from token |

### Service Requests
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/requests | Customer | create a request, photo optional |
| GET | /api/requests | Logged in | list requests, supports `?specialty=`, `?status=`, `?search=` |
| PUT | /api/requests/:id/complete | Technician | mark request as completed |

### Offers
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/offers | Technician | submit an offer on a request |
| PUT | /api/offers/:id/accept | Customer | accept an offer, rejects the rest automatically |

### Ratings
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/ratings | Customer | rate the technician, only if request is completed |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/admin/users | Admin | list all users |
| PUT | /api/admin/users/:id/ban | Admin | ban or unban a user |

All protected routes need this header:
```
Authorization: Bearer <token>
```
Token comes from the login response.

## Notes

- Password validation and error handling is currently only on the register endpoint, not every endpoint yet.
- Search & filter is on the GET requests endpoint only.
- Uploaded photos are stored locally in the `uploads` folder, not on cloud storage.
