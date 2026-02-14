# Jimoh Axion - School Management System API

A RESTful API for managing schools, classrooms, students, and administrative users.

## Api deployed version
- Visit the deployed version of this api at https://jimoh-axion-main-production.up.railway.app
- View the Swagger api documentation at https://jimoh-axion-main-production.up.railway.app/api/docs
- View the Database ER Diagram at https://drive.google.com/file/d/1TjFnJx6fD4CTRGQjvq4r4Du16pevLxV1/view?usp=sharing
- Visit the Github repo at https://github.com/johadi/jimoh-axion-main

## Technology Stack

### Backend Framework & Runtime
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM

### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt** - Password hashing
- **express-rate-limit** - API rate limiting
- **cors** - Cross-origin resource sharing

### Caching & Performance
- **Redis** - In-memory data structure store
- **rate-limit-redis** - Redis-based rate limiting

### Development & Testing
- **Mocha** - Test framework
- **Chai** - Assertion library
- **Supertest** - HTTP testing library
- **dotenv** - Environment variable management

### API Documentation
- **Swagger UI** - API documentation
- Visit the url `{API_BASE_URL}/api/docs` to view the swagger generated documentation. For example on local is at `http://localhost:{PORT}/api/docs`
- Visit the online documentation at https://jimoh-axion-main-production.up.railway.app/api/docs

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v5.0 or higher)
- **Redis Server** (v6.0 or higher)
- **npm** (should come with Node.js)

## Development Setup

This project uses environments controlled by a single variable:
- `ENV` (`development`, `test`, `production`). When `ENV=test`, the app uses `TEST_MONGO_URI` automatically.

### 1. Clone the repository
```
git clone <this-repo-url>
cd jimoh-axion-main
```

### 2. Install dependencies
```
npm install
```

### 3. Start required services
- MongoDB running locally (default URI: `mongodb://localhost:27017/axion`)
- Redis running locally (default URI: `redis://127.0.0.1:6379`)

You can override these using a `.env` file; start from `.env.sample`.

### 4. Configure environment (development)
Use the sample env file as your starting point:
```
cp .env.sample .env
```
Then edit `.env`:
- Set `ENV=development` for local development.
- Populate all required secrets (see the "Required secrets" section in `.env.sample`).
- Adjust any URIs/ports only if you don't need the default.

Notes:
- When `ENV=test`, the app automatically uses `TEST_MONGO_URI` as defined in `.env.sample`.
- Do not commit your `.env`. Keep `.env.sample` updated whenever new variables are introduced.

### 5. Run the API (development)
```
npm start
```
The user API server listens on `USER_PORT` (default `5111`). Ensure MongoDB and Redis are running.

---

##  Deployment Setup (Production)

- Set `ENV=production`.
- Provide production values for MongoDB, Redis, and all required secrets.

### Configure environment (production)
Use the sample env file as your starting point:
```
cp .env.sample .env
```
Then edit `.env` for production:
- Set `ENV=production`.
- Provide production values for MongoDB/Redis URIs and all required secrets.
- Set the `API_BASE_URL` to your domain base url. 
- Set ports, and prefixes as needed.

Refer to `.env.sample` for the full list of variables and comments.

### Start in production
- With Node directly:
```
ENV=production npm start
```

---

##  Test Setup

This project uses Mocha, Chai, and Supertest. When running tests, `ENV=test` is set by the npm scripts and the app will use `TEST_MONGO_URI`.

### Prerequisites for tests
- MongoDB reachable at `TEST_MONGO_URI` (defaults to `mongodb://localhost:27017/axion_test`).
- Redis reachable at `REDIS_URI` (defaults to local Redis).
- The same required secrets present in `.env`.

### Run all tests
```
npm test
```

### Watch mode
```
npm run test:watch
```

### Run a single file
```
npm run test:single -- test/student.test.js
```

### Notes
- Ensure MongoDB and Redis are running before tests.
- Tests are located under the `test/` directory.
- Console output may include debug logs depending on configuration.

---
