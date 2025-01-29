import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { updateUser } from '../services/AdminServices';
import axios from 'axios';

import {
  getAdminProfile,
  deleteAdminAccount,
  getUsers,
  deleteUser,
} from "../services/AdminServices";

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminProfile, setAdminProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editMode, setEditMode] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profile = await getAdminProfile();
      setAdminProfile(profile);
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your admin account? This action cannot be undone.")) {
      try {
        await deleteAdminAccount();
        localStorage.clear();
        navigate("/login");
      } catch (error) {
        console.error("Error deleting admin account:", error);
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setEditMode("edit");
  };

  const handleSaveChanges = async () => {
    if (!editingUser) return;
  
    const payload = {
      name: editingUser.name,
      email: editingUser.email,
      passwordHash: editingUser.password,
    };
  
    try {
      await updateUser(editingUser.id, payload);
      await fetchData();
      setEditingUser(null);
      setEditMode("");
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error.response?.data || error.message || error);
      alert(error.response?.data?.message || "Failed to save changes. Please try again.");
    }
  };
  

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(userId);
        await fetchData();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleGenerateNewKey = async () => {
    try {
      const newKey = Math.random().toString(36).slice(2, 64); // Generate a random key
      const expirationTime = 60; 

      const token = localStorage.getItem("token");
      await axios.put(`https://localhost:7050/api/Admin/update-key`, {
        key: newKey,
        expiresIn: expirationTime
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`New registration key generated: ${newKey}. Valid for ${expirationTime} minutes.`);
    } catch (error) {
      console.error("Error generating new key:", error);
      alert(error.response?.data?.message || "Failed to generate new key. Please try again.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="admin-logo">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h1>Admin Panel</h1>
        </div>

        {adminProfile && (
          <div className="admin-profile">
            <div className="admin-avatar">
              <span>{adminProfile.name[0].toUpperCase()}</span>
            </div>
            <div className="admin-info">
              <h2>{adminProfile.name}</h2>
              <p>{adminProfile.email}</p>
            </div>
          </div>
        )}

        <div className="sidebar-menu">
          <button className="menu-item active">
            <i className="fas fa-users"></i>
            <span>User Management</span>
          </button>
          <button className="menu-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
          <button className="menu-item danger" onClick={handleDeleteAccount}>
            <i className="fas fa-user-times"></i>
            <span>Delete Account</span>
          </button>
          <button onClick={handleGenerateNewKey} className="btn-primary">Generate New Registration Key</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h2>User Management</h2>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <tr>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          <span>{user.name[0].toUpperCase()}</span>
                        </div>
                        <span className="user-name">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-primary"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingUser?.id === user.id && (
                    <tr className="edit-row">
                      <td colSpan="3">
                        <div className="edit-form">
                          <div className="form-group">
                            <label>Name:</label>
                            <input
                              type="text"
                              value={editingUser.name}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Email:</label>
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Password:</label>
                            <input
                              type="password"
                              placeholder="Enter new password"
                              value={editingUser.password || ""}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  password: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="edit-actions">
                            <button
                              className="btn-secondary"
                              onClick={() => {
                                setEditingUser(null);
                                setEditMode("");
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-primary"
                              onClick={handleSaveChanges}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;