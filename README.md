# Simple CRUD API

This is a RESTful API with CRUD (Create, Read, Update, Delete) functionality for managing products and user authentication.

## Features

- System Authentication (JWT)
- CRUD operations for users
- User login functionality
- Search users by username/ID

## Technologies Used

- Node.js (https://nodejs.org/)
- Express.js (https://expressjs.com/)
- MySQL (https://www.mysql.com/)
- JSON Web Tokens (JWT) (https://jwt.io/)

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- Node.js installed on your local machine
- MySQL installed on your local machine

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/JoshyV/CRUD-RESTful-API.git
2. Install NPM packages
   ```sh
   npm install
3. Set up your environment variables by creating a .env file in the root directory and adding the following:
   ```sh
   MYSQL_HOST=your_mysql_host
   MYSQL_USER=your_mysql_username
   MYSQL_PASS=your_mysql_password
   MYSQL_DATABASE=your_mysql_database
   ACCESS_TOKEN=your_secret_access_token
4. Run the server
   ```sh
   npm start

## Features
You can use tools like Postman to test the API endpoints.

## License

Distributed under the MIT License. See `LICENSE` for more information.
