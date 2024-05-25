# Backend Server for TaskManagerApp

## Introduction
This server handles all backend logic for the TaskManagerApp, including user management, authentication, and task operations. It is built with Node.js and Express.

## Getting Started
To get the server running locally:
1. Clone the repository: `git clone https://github.com/yourrepo/backend.git`
2. Install dependencies: `npm install`
3. Start the server: `npm start`

## Environment Setup
Ensure you have the following environment variables set up in your `.env` file:
- `DB_HOST=localhost`
- `DB_USER=root`
- `DB_PASS=s1mpl3`

## API Documentation
Access the Swagger API documentation locally at `http://localhost:3000/docs` or view it online at `[deployed server URL]/docs`.

## Features
- User Authentication
- CRUD operations for tasks
- Task prioritization and categorization

## Dependencies
- express: Framework for handling server logic
- bcryptjs: Library for hashing and salting user passwords
- jsonwebtoken: Implements JSON Web Tokens for authentication

## How to Contribute
Contributions are welcome! Please read our [contribution guidelines](./CONTRIBUTING.md) for details on how to submit pull requests.

## Reporting Issues
Report issues and bugs on [GitHub Issues](https://github.com/yourrepo/backend/issues).

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
