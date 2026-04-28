Rams 360 Tech – Backend Service

This repository contains the Node.js backend service for the Rams 360 Tech platform.
It handles APIs, business logic, authentication, and database communication.

🚀 Tech Stack Details


Node.js

Express.js

Babel

Nodemon (development)

Database (configured via environment variables)

Session-based authentication

📂 Project Structure
.
├── server.js
├── src
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── services
│   ├── middlewares
│   └── utils
├── config
├── tests
├── .env.example
├── package.json
└── README.md

⚙️ Prerequisites

Ensure the following are installed:

Node.js (v16 or later)

npm

A supported database

🔧 Installation

Clone the repository:

git clone https://github.com/your-org/rams-360-tech-backend.git
cd rams-360-tech-backend


Install dependencies:

npm install


Create an environment file:

cp .env.example .env


Update the .env file with your credentials.

🔐 Environment Variables

Configure the following variables in your .env file:

NODE_ENV=development
PORT=8000

DATABASE=
DATABASE_PASSWORD=

SESSION_TOKEN=

Variable Description
Variable	Description
NODE_ENV	Application environment (development or production)
PORT	Port the server runs on
DATABASE	Database connection string
DATABASE_PASSWORD	Database password
SESSION_TOKEN	Secret used for session authentication

⚠️ Do not commit .env files. Always use .env.example as a reference.

▶️ Running the Application
Development Mode
npm run dev

Production Mode
npm start


The server will start at:

http://localhost:8000

🧪 Debugging
npm run debug


Uses ndb for debugging.

📦 NPM Scripts
"scripts": {
  "start": "node server.js",
  "dev": "nodemon --exec babel-node server.js --es-module-specifier-resolution=node",
  "debug": "ndb server.js"
}

📡 API Endpoints

All API routes are prefixed with:

/api


Refer to the src/routes directory for detailed endpoint definitions.

🧪 Testing
npm test

🚀 Deployment

Set NODE_ENV=production

Ensure environment variables are configured

Use PM2, Docker, or a cloud platform (AWS, Render, Railway, etc.)

🤝 Contributing

Fork the repository

Create a feature branch

Commit your changes

Open a pull request

📄 License

This project is licensed under the MIT License.


//karthi entered
