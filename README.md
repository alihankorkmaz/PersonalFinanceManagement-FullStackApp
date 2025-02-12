# Personal Finance Management Full Stack App

## Description

`PersonalFinanceManagement-FullStackApp` is an application designed for personal finance management. This project helps users track their financial information, manage expenses, and plan their budget. The project is developed using modern web technologies and includes both backend and frontend.

### Technologies Used

- **Frontend:** React.js, HTML, CSS
- **Backend:** C# (.NET Core)
- **Database:** SQLite
- **Authentication:** JWT (JSON Web Token)
- **Version Control:** Git, GitHub
- **Deployment:** Web-accessible

## Features

- **User Login and Registration:** Secure user login and registration with JWT.
- **Budget Tracking:** Users can add their expenses and income.
- **Data Visualization:** Display expenses and income in graphical format.
- **Database Management:** Data securely stored using SQLite.

## Installation and Usage

### Requirements

- [Node.js](https://nodejs.org/)
- [Visual Studio](https://visualstudio.microsoft.com/) (for backend)
- [SQLite](https://www.sqlite.org/)
- [Git](https://git-scm.com/)

### Backend Setup

1. Go to the `backend\PersonalFinanceManagement-master\PersonalFinanceManagement` directory.
2. Run the following command to restore dependencies:
   ```bash
   dotnet restore
3. To run the project:
   ```bash
   dotnet run
### Frontend Setup
1. Go to the `frontend\personal-finance-management1` directory.
2. Run the following command to install dependencies:
   ```bash
   npm install
3. To start the frontend:
   ```bash
   npm start
## Project structure 
- **backend/**
API files and database operations

- **frontend/**
React.js based user interface

- **.gitignore**
Files and folders ignored by Git

- **README.md**
Information about the project

## Usage
After completing the installation steps, you can run both the backend and frontend servers. The application should be accessible at http://localhost:3000 for the front-end and http://localhost:5234 for the back-end.
