# BookMyShow Clone

This repository contains a simple BookMyShow clone with a Node/Express backend and a React frontend.

## Structure

- `backend/` - Express API with Mongoose models
- `frontend/` - React app (Create React App)

## Quick start (Windows PowerShell)

1. Backend

```powershell
cd 'D:\CS_Projects\BookMyShow_Clone\backend'
npm install
# create .env from .env.example and fill values
npm start
```

2. Frontend

```powershell
cd 'D:\CS_Projects\BookMyShow_Clone\frontend'
npm install
npm start
```

## Required environment variables (backend/.env.example)

- MONGODB_URI
- PORT (optional)
- JWT_SECRET
- EMAIL_USER, EMAIL_PASS (for nodemailer)
- FRONTEND_URL
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME (for file uploads)
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (for payments)

## Notes

- Some endpoints integrate with external services (email, AWS S3, Razorpay). For local testing you can stub/mock them or provide test credentials.
- The repository includes basic validation and role-based middleware. Review `backend/middleware/auth.js` and route protection for admin/partner-only routes.

# BookMyShow Clone - MERN Stack Application

A full-stack movie ticket booking application built with MongoDB, Express.js, React, and Node.js.

## Features

- User Authentication & Authorization
  - User registration and login
  - Password reset functionality
  - Email verification
  - Protected routes
- Admin Dashboard
  - Movie management
  - Theater management
  - User management
  - Partner approval system
- Theater Management
  - Add/Edit theaters
  - Manage show timings
  - Seating layout management
- Movie Booking
  - Browse movies
  - View show timings
  - Seat selection
  - Online payment integration
- Email Notifications
  - Booking confirmation
  - E-tickets
  - Password reset links

## Tech Stack

- Frontend: React.js, Redux, Material-UI
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- Payment Gateway: Razorpay
- Email Service: Nodemailer
- Cloud Storage: AWS S3 (for movie posters)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository

```bash
git clone [repository-url]
```

2. Install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create a .env file in the backend directory with the following variables:

```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=your_bucket_name
```

4. Start the development servers

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm start
```

## Deployment

The application is deployed on:

- Frontend: [Vercel Deployment Link]
- Backend: [Render Deployment Link]

## Security Measures

- JWT-based authentication
- Password hashing using bcrypt
- Rate limiting for API endpoints
- Input validation and sanitization
- CORS configuration
- Secure HTTP headers
- Environment variable protection

## API Documentation

[API Documentation Link]

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
