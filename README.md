# Personal Finance Management Rest API

## Overview

This is a REST API designed for personal finance management. It includes features for user and admin registration, authentication, and management of user transactions.

## Features

- **User Authentication**: Register and login as a user or admin.
- **Admin Management**: Admins can manage users and their transactions.
- **User Self-Management**: Users can update their profiles and manage their accounts.
- **JWT Authentication**: Secure endpoints using JSON Web Tokens.

## Technologies Used

- **Backend**: ASP.NET Core
- **Database**: Microsoft SQL Server
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

Before running this project, ensure you have the following installed:

- .NET 6 SDK or later
- SQL Lite Server
- Visual Studio or Visual Studio Code

## Installation

1. **Clone the Repository**
   ```bash
   [git clone https://github.com/your-username/your-repository-name.git]
   cd PersonalFinanceManagement
2. Set Up the Database

Update the appsettings.json file with your database connection string under ConnectionStrings:DefaultConnection.
Apply the migrations to create the database:
dotnet ef database update

Run the Application
Start the application locally:
dotnet run
The API will be accessible at https://localhost:7050/swagger/index.html (or the default port configured).

