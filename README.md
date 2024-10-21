# Split_And_Pay

## Overview
This project is a backend implementation for a Daily Expenses Sharing Application. It allows users to add expenses and split them based on three different methods: equal amounts, exact amounts, and percentage splits. Users can create or join groups, manage their expenses, and generate downloadable balance sheets.

## Features

### User Management
- Create users with email, name, mobile number, and username.
- User authentication using JWT for secure routes.

### Group Management
- Users can create or join groups using a passcode.
- Groups have participants and expenses that are tracked.

### Expense Management
- Users can add expenses to a group.
- Expenses can be split using the following methods:
  - **Equal Split**: Divides the total amount equally among all participants.
  - **Exact Split**: Specify the exact amount each participant owes.
  - **Percentage Split**: Specify the percentage each participant owes, ensuring the percentages add up to 100%.

### Balance Management
- Track how much each participant owes or is owed by others within a group.
- Generate downloadable balance sheets for both users and groups in PDF format.

## Setup Instructions

### Prerequisites
Ensure you have the following installed:
- Node.js
- MongoDB Compass

### Steps

1. Clone the Repository.
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```
2. Install Dependencies.
    ```bash
    npm install
    ```
3. Set up MongoDB Compass and connect to the database.
    ```perl
    mongodb+srv://aadityamta:am123@splitshare.2m0kl.mongodb.net/
    ```
4. Run the Server.
    ```bash
    node server.js
    ```
The server will run on `http://localhost:3000`.

## API Endpoints

### User Endpoints

- **Sign Up**  
  `POST /user/signup`  
  Creates a new user.
  - **Body**:
    ```json
    {
      "name": "Aarav Singh",
      "email": "aarav.singh@example.com",
      "mobile": "9876543210",
      "username": "aarav_singh",
      "password": "StrongPassword123"
    }
    ```

- **Sign In**  
  `POST /user/signin`  
  Logs in a user and returns a JWT token.
  - **Body**:
    ```json
    {
      "username": "aarav_singh",
      "email": "aarav.singh@example.com",
      "password": "StrongPassword123"
    }
    ```

### Group Endpoints

- **Create Group**  
  `POST /group/creategroup`  
  Create a new group with a passcode.
  - **Body**:
    ```json
    {
      "name": "Vacation Group",
      "passcode": "vacation2024"
    }
    ```

- **Join Group**  
  `POST /group/enter`  
  Enter an existing group using a passcode.
  - **Body**:
    ```json
    {
      "name": "Vacation Group",
      "passcode": "vacation2024"
    }
    ```

### Transaction Endpoints

- **Add Expense**  
  `POST /transaction/addExpense`  
  Add a new expense to a group using Equal Split, Exact Split, or Percentage Split methods.
  - **Body (Equal Split)**:
    ```json
    {
      "groupName": "Vacation Group",
      "totalAmount": 2000,
      "splitMethod": "equal"
    }
    ```
  - **Body (Exact Split)**:
    ```json
    {
      "groupName": "Vacation Group",
      "totalAmount": 2000,
      "splitMethod": "exact",
      "splitDetails": [
        { "user": "aarav_singh", "amount": 1000 },
        { "user": "priya_kapoor", "amount": 500 },
        { "user": "rahul_verma", "amount": 500 }
      ]
    }
    ```
  - **Body (Percentage Split)**:
    ```json
    {
      "groupName": "Vacation Group",
      "totalAmount": 2000,
      "splitMethod": "percentage",
      "splitDetails": [
        { "user": "aarav_singh", "percentage": 50 },
        { "user": "priya_kapoor", "percentage": 25 },
        { "user": "rahul_verma", "percentage": 25 }
      ]
    }
    ```

### Balance Sheet Endpoints

- **Download User Balance Sheet**  
  `GET /balance/user/download/pdf`  
  Download a PDF showing the balance details of the logged-in user.

- **Download Group Balance Sheet**  
  `GET /balance/group/:groupName/download/pdf`  
  Download a PDF showing the balance details for the specified group.

## Middlewares

- **JWT Authentication Middleware**:  
  Ensures users accessing certain routes are authenticated via JWT tokens.

- **Input Validation Middlewares**:  
  Validates user credentials during registration and login to ensure proper format and uniqueness (using Zod).

## Technologies Used

- **Node.js** for the backend runtime environment.
- **Express.js** as the web application framework.
- **MongoDB** as the database for storing users, groups, and expenses.
- **JWT** for secure authentication.
- **Zod** for input validation.
- **Bcrypt.js** for password hashing.
- **PDF.co API** for generating PDF balance sheets.

## How to Use

1. **Sign up and log in**: Users need to sign up and log in to manage their groups and expenses. After logging in, a JWT token is provided which is used for accessing secure routes.
2. **Create or join a group**: A user can create a group or join an existing group by providing a passcode.
3. **Add an expense**: The user can add an expense to a group. The expense can be split equally, by exact amounts, or by percentages.
4. **Check and download balance sheets**: Users can check their balances or the group's balances and download them as PDF files.

## Error Handling and Validation

- **Input Validation**:  
  All inputs, such as usernames, emails, and expense details, are validated using the Zod library to ensure they are in the correct format.

- **Authentication and Authorization**:  
  JWT is used to secure routes, and the jwtchecker middleware ensures that only authenticated users can access specific endpoints.

- **Error Handling**:  
  Proper error messages and status codes are returned for scenarios such as incorrect passwords, non-existent groups, or invalid split amounts.

## Bonus Features

- Secure JWT-based authentication via the `jwtchecker.js` middleware for secure API access.
- Input validation using Zod with middlewares like `register.js` and `login.js` for validating user inputs during registration and login.
- Password hashing using bcrypt.js to securely store user credentials.
- PDF generation for both individual and group balance sheets using PDF.co API.

