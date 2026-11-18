# 🎓 Student Management System (NoSQL Database Application)

A simple, full-stack Student Management System web application developed for the **College Web Technology Assignment**.

> **Assignment Objective:** Design, develop and deploy a web application to interact with a NoSQL database from a Node.js application, demonstrating working NoSQL (MongoDB) CRUD operations.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Project Directory Structure](#-project-directory-structure)
4. [NoSQL Database & Schema Design](#-nosql-database--schema-design)
5. [Prerequisites & Installation](#-prerequisites--installation)
6. [MongoDB Atlas Setup Guide](#-mongodb-atlas-setup-guide)
7. [Running the Application Locally](#-running-the-application-locally)
8. [REST API Documentation & Sample Requests](#-rest-api-documentation--sample-requests)
9. [Deployment Guide (Render & Vercel)](#-deployment-guide-render--vercel)
10. [Assignment Screenshot Checklist](#-assignment-screenshot-checklist)

---

## 🚀 Project Overview

The **Student Management System** is a responsive web application that provides complete student record management through NoSQL database operations.

### Key Features
- **Create (Add Student):** Add student records with Name, Roll No, Email, Department, and Academic Year.
- **Read (View & Search):** View all registered students in a formatted table; search students in real-time by Name, Roll No, or Department.
- **Update (Edit Student):** Seamless inline form loading and record update in MongoDB Atlas.
- **Delete (Remove Student):** Confirmation modal with permanent record deletion from MongoDB Atlas.
- **Health Check Endpoint:** Real-time health monitoring of backend and database connection status.
- **Beginner Friendly & Clean:** Built with vanilla HTML/CSS/JavaScript and Express without unnecessary framework complexity.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6) | Clean, responsive UI with `fetch()` API calls |
| **Backend** | Node.js & Express.js | RESTful API server handling HTTP requests |
| **Database** | MongoDB Atlas (Cloud NoSQL) | NoSQL document storage (`studentDB` database) |
| **Database ODM** | Mongoose | Schema definition, validation, and database queries |
| **Hosting (Backend)** | Render | Node.js web service hosting |
| **Hosting (Frontend)** | Vercel | Static frontend site hosting |

---

## 📂 Project Directory Structure

```text
StudentManagementSystem/
├── config/
│   └── db.js                 # MongoDB Atlas connection setup using Mongoose
├── models/
│   └── Student.js            # Mongoose Schema & Model for 'students' collection
├── routes/
│   └── studentRoutes.js      # REST API route handlers (POST, GET, PUT, DELETE)
├── public/                   # Static Frontend Files
│   ├── index.html            # Main UI layout, forms, and table
│   ├── style.css             # Responsive styling and CSS variables
│   └── script.js             # Client-side logic, fetch() calls, DOM manipulation
├── .env.example              # Template for environment variables
├── .gitignore                # Git ignore rules for node_modules and .env
├── package.json              # Node.js project metadata and dependencies
├── vercel.json               # Vercel configuration for static frontend hosting
└── README.md                 # Complete project documentation and guide
```

---

## 🍃 NoSQL Database & Schema Design

- **Database Name:** `studentDB`
- **Collection Name:** `students`

### Document Schema (`Student.js`)

```javascript
{
  "_id": ObjectId("..."),
  "name": "Alex Johnson",               // String, required, trim
  "rollNo": "2026CS101",                // String, required, unique, uppercase
  "email": "alex.j@college.edu",         // String, required, unique, lowercase
  "department": "Computer Science & Engineering", // String, required
  "year": "3rd Year",                   // String, required
  "createdAt": ISODate("..."),          // Date (automatic timestamp)
  "updatedAt": ISODate("...")           // Date (automatic timestamp)
}
```

---

## 📋 Prerequisites & Installation

### 1. Prerequisites
- **Node.js** installed (v16.x or newer recommended). Verify with:
  ```bash
  node -v
  npm -v
  ```
- A free **MongoDB Atlas** account (or local MongoDB).

### 2. Installation Steps
1. Navigate to the project root directory:
   ```bash
   cd StudentManagementSystem
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the template:
   - On Windows (PowerShell):
     ```powershell
     Copy-Item .env.example .env
     ```
   - On Linux/macOS:
     ```bash
     cp .env.example .env
     ```

---

## 🌐 MongoDB Atlas Setup Guide

1. **Sign Up / Log In:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in.
2. **Create a Free Cluster:**
   - Choose **M0 Free Tier** (Shared).
   - Select your preferred cloud provider and closest region (e.g., AWS / Mumbai).
   - Click **Create Deployment**.
3. **Set Up Database User:**
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Choose **Password** authentication.
   - Enter a username (e.g., `dbadmin`) and a strong password (e.g., `CollegePass123`).
   - Give role: **Read and write to any database**. Click **Add User**.
4. **Configure Network Access (IP Whitelist):**
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere (`0.0.0.0/0`)** so your local machine and Render backend can connect.
   - Click **Confirm**.
5. **Get Connection String:**
   - Go to **Database > Clusters > Connect**.
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Add `/studentDB` before the query parameter `?retryWrites=true`:
     ```text
     mongodb+srv://dbadmin:CollegePass123@cluster0.xxxxx.mongodb.net/studentDB?retryWrites=true&w=majority
     ```
6. **Paste into `.env` file:**
   Open your `.env` file and set:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://dbadmin:CollegePass123@cluster0.xxxxx.mongodb.net/studentDB?retryWrites=true&w=majority
   CLIENT_URL=http://localhost:5000
   ```

---

## 🏃 Running the Application Locally

### Start Backend Server:
```bash
npm start
```
*(Or use `npm run dev` for auto-reloading using nodemon).*

### Expected Console Output:
```text
===============================================
🎓 Student Management System Server Started
📡 URL: http://localhost:5000
🩺 Health Check: http://localhost:5000/api/health
===============================================
✅ MongoDB Atlas Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📁 Active Database: studentDB
```

### Accessing the Web Application:
Open your browser and navigate to:
```text
http://localhost:5000
```
The full application (frontend UI + backend API) is served directly!

---

## 📡 REST API Documentation & Sample Requests

### Base URL: `http://localhost:5000`

| Method | Endpoint | Description | NoSQL Operation |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Health status of API and MongoDB connection | Connection state check |
| **GET** | `/api/students` | Get all students (or `?search=keyword`) | `Student.find().sort()` |
| **GET** | `/api/students/:id` | Get single student record by MongoDB `_id` | `Student.findById(id)` |
| **POST** | `/api/students` | Create/Insert a new student document | `new Student().save()` |
| **PUT** | `/api/students/:id` | Update an existing student document | `Student.findByIdAndUpdate()` |
| **DELETE** | `/api/students/:id` | Delete a student document | `Student.findByIdAndDelete()` |

---

### Sample cURL Commands for Testing

#### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```
**Response:**
```json
{
  "status": "OK",
  "server": "Student Management System Backend",
  "database": "Connected (Healthy)",
  "databaseConnected": true,
  "timestamp": "2026-11-18T11:30:00.000Z"
}
```

#### 2. Create Student (POST)
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "rollNo": "2026CS102",
    "email": "jane.smith@college.edu",
    "department": "Computer Science & Engineering",
    "year": "3rd Year"
  }'
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student record added successfully!",
  "data": {
    "_id": "673b2cb1e4b0123456789abc",
    "name": "Jane Smith",
    "rollNo": "2026CS102",
    "email": "jane.smith@college.edu",
    "department": "Computer Science & Engineering",
    "year": "3rd Year",
    "createdAt": "2026-11-18T11:32:01.000Z",
    "updatedAt": "2026-11-18T11:32:01.000Z"
  }
}
```

#### 3. Get All Students (GET)
```bash
curl -X GET http://localhost:5000/api/students
```

#### 4. Search Students (GET with search query)
```bash
curl -X GET "http://localhost:5000/api/students?search=Jane"
```

#### 5. Update Student (PUT)
```bash
curl -X PUT http://localhost:5000/api/students/673b2cb1e4b0123456789abc \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "rollNo": "2026CS102",
    "email": "jane.smith@college.edu",
    "department": "Information Technology",
    "year": "4th Year"
  }'
```

#### 6. Delete Student (DELETE)
```bash
curl -X DELETE http://localhost:5000/api/students/673b2cb1e4b0123456789abc
```

---

## ☁️ Deployment Guide (Render & Vercel)

### Part A: Deploying Backend on Render (Free Tier)
1. Push your project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Student Management System"
   git branch -M main
   git remote add origin https://github.com/<your-username>/StudentManagementSystem.git
   git push -u origin main
   ```
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
3. Connect your GitHub repository.
4. Set the following build and start configurations:
   - **Name:** `student-management-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Under **Environment Variables**, add:
   - `MONGO_URI`: `your-mongodb-atlas-connection-string`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app` (or `*`)
6. Click **Deploy Web Service**.
7. Once deployed, note your Render backend URL (e.g., `https://student-management-backend.onrender.com`).
8. Test the health endpoint in browser: `https://student-management-backend.onrender.com/api/health`.

---

### Part B: Deploying Frontend on Vercel (Free Tier)
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Import your GitHub repository.
3. In project settings:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./` (or select `public` if preferred)
   - The included `vercel.json` automatically configures `public/` as the static output directory.
4. Click **Deploy**.
5. Once deployed, open your live Vercel URL.
6. Click the **⚙️ API Config** button in the header, paste your live Render Backend URL (e.g., `https://student-management-backend.onrender.com`), and click **Save URL**.
7. The live Vercel frontend will now seamlessly perform live CRUD operations against your deployed Render backend and MongoDB Atlas!

---

## 📸 Assignment Screenshot Checklist

For your college practical submission or lab record, capture the following screenshots:

- [ ] **Screenshot 1: MongoDB Atlas Cluster & Database**
  - Showing `studentDB` database and `students` collection in MongoDB Atlas Collection Browser.
- [ ] **Screenshot 2: Backend Terminal Startup**
  - Terminal showing `MongoDB Atlas Connected: ...` and `Server Started on port 5000`.
- [ ] **Screenshot 3: Health Check API Response**
  - Browser or Postman showing `GET http://localhost:5000/api/health` with `status: "OK"` and `databaseConnected: true`.
- [ ] **Screenshot 4: Frontend Home Page**
  - Clean view of the Student Management System with stats cards and database status badge (Green / Connected).
- [ ] **Screenshot 5: Create Operation (Adding a Student)**
  - Form filled out and success notification banner: *"Student record added successfully!"*.
- [ ] **Screenshot 6: Read Operation (Students Table)**
  - Table showing multiple inserted records with Roll No, Name, Email, Department, and Year.
- [ ] **Screenshot 7: Real-Time Search Operation**
  - Search bar filtered with a keyword (e.g. roll number or name) showing matching results.
- [ ] **Screenshot 8: Update Operation (Edit Mode)**
  - Student record loaded into edit mode, modified, and saved with update success notification.
- [ ] **Screenshot 9: Delete Operation (Confirmation Modal)**
  - Delete confirmation modal open with warning and student details, followed by successful deletion.
- [ ] **Screenshot 10: Validation Error Message**
  - Form submitted empty or with duplicate roll number showing clear error alert message.
- [ ] **Screenshot 11 (Bonus): Deployed Application**
  - Deployed Render backend dashboard and live Vercel URL.

