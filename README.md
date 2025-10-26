# Jewelry Management System

This project contains both **frontend** and **backend** applications that work together.  
Make sure to set up both before running the project.

## ⚙️ Prerequisites

Before running the project, ensure that you have:

- [Node.js](https://nodejs.org/) installed (v16 or higher recommended)
- [npm](https://www.npmjs.com/) installed
- The CSV files (`products.csv` and `sales.csv`) are present in the **root folder**

> ⚠️ Without the provided CSV files, the project **will not work correctly** and may throw errors.


## 🚀 Running the Frontend

1. Open your terminal and navigate to the `frontend` folder:

   cd frontend
Install all dependencies:

npm install
Start the frontend using nodemon:

npx nodemon
🧠 Running the Backend
Open a new terminal and navigate to the backend folder:

cd backend
Install backend dependencies:

npm install
Start the backend server with nodemon:

npx nodemon
🗃️ CSV Files
The project depends on these files for data:

products.csv
sales.csv

Make sure they are present in the root directory (the same folder as backend/ and frontend/).

If these files are missing or renamed, you may encounter an error when running the application.

💬 Notes
You can modify database.sql if you need to change your database structure.

If you face any issues with modules, try deleting the node_modules folder and reinstalling with npm install.

👨‍💻 Author
Adam Ansari
