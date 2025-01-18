# Dating App

A modern dating application built using Next.js, React, PostgreSQL, and Tailwind CSS. This app allows users to sign up, log in, like/dislike other users, and view potential matches in real-time.

## Features

- **User Authentication**: Secure login and sign-up using email and password.
- **User Profiles**: Users can set up and update their profiles with photos, bios, and other details.
- **Matching System**: Users can like/dislike other users, and potential matches are shown based on mutual interests.
- **Real-time Chat**: Messaging functionality allows users to chat once they match with each other.
- **Responsive Design**: The app is fully responsive and optimized for both desktop and mobile views.

## Technologies Used

- **Frontend**:
  - [Next.js](https://nextjs.org/) - React-based framework for building modern web applications.
  - [React](https://reactjs.org/) - JavaScript library for building user interfaces.
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for fast UI development.
  - [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript for building more robust and maintainable code.

- **Backend**:
  - [Node.js](https://nodejs.org/) - JavaScript runtime built on Chrome's V8 engine.
  - [Express.js](https://expressjs.com/) - Minimal and flexible Node.js web application framework for building APIs.
  - [PostgreSQL](https://www.postgresql.org/) - Open-source relational database system for storing user and match data.
  - [Prisma](https://www.prisma.io/) - ORM to interact with the PostgreSQL database.

- **Authentication**:
  - Secure authentication using JWT (JSON Web Tokens) for login and session management.

## Setup and Installation

To get started with the app locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/joshua-onley/dating-app.git
cd dating-app
```
### 2. Install dependencies
make sure you have Node.js installed. Then run: npm install

### 3. Setup local SQL database
For this project i used a local PostgreSQL server running on my machine. Make sure you have PostgreSQL installed by following the instructions on the official PostgreSQL website: <a>https://www.postgresql.org/download/</a>

### 4. Create database tables

### 4. Setup environment variables
create a .env.local file in the root of the project and set up your database URL.
