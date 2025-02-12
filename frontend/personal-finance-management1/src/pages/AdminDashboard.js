import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { updateUser } from '../services/AdminServices';
import NewConfirmModal from '../components/NewConfirmModal';
import GenerateKeyModal from '../components/GenerateKeyModal';

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
  const [isNewModalOpen, setNewModalOpen] = useState(false);
  const [isUserDeleteModalOpen, setUserDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [isGenerateKeyModalOpen, setGenerateKeyModalOpen] = useState(false);
  const [creationTime, setCreationTime] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleDeleteAccount = () => {
    setNewModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      await deleteAdminAccount();
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting admin account:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setEditMode("edit");
  };

  const handleSaveChanges = async () => {
    if (!editingUser) return;

    const payload = {
      id: editingUser.id,
      name: editingUser.name,
      email: editingUser.email,
      passwordHash: editingUser.password ? editingUser.password : editingUser.passwordHash,
    };

    try {
      await updateUser(editingUser.id, payload);
      await fetchData();
      setEditingUser(null);
      setEditMode('');
      setSuccessMessage('Edited Successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error("Error saving changes:", error.response?.data || error.message || error);
      alert(error.response?.data?.message || "Failed to save changes. Please try again.");
    }
  };
  

  const handleDeleteUser = (userId) => {
    setUserIdToDelete(userId);
    setUserDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await deleteUser(userIdToDelete);
      await fetchData();
      setUserDeleteModalOpen(false);
      setSuccessMessage('Deleted Successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleGenerateKey = () => {
    const creationTime = new Date().toLocaleString(); // Get current time
    setGenerateKeyModalOpen(true);
    setCreationTime(creationTime); // Set creation time state
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
            <span>{adminProfile?.name ? adminProfile.name[0].toUpperCase() : '?'}</span>
          </div>
          <h1>Admin Panel</h1>
        </div>
        <div className="admin-profile">
          <h5>{adminProfile?.name}</h5>
          <p>{adminProfile?.email}</p>
        </div>
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
          <button onClick={handleGenerateKey} className="btn-primary">Generate New Registration Key</button>
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
                          <span>{user.name ? user.name[0].toUpperCase() : '?'}</span>
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
          {successMessage && <p className='success-message'>{successMessage}</p>}
        </div>
      </div>
      <NewConfirmModal 
        isOpen={isNewModalOpen} 
        onClose={() => setNewModalOpen(false)} 
        onConfirm={confirmDeleteAccount} 
        message="Are you sure you want to delete your admin account? This action cannot be undone." 
      />
      <NewConfirmModal 
        isOpen={isUserDeleteModalOpen} 
        onClose={() => setUserDeleteModalOpen(false)} 
        onConfirm={confirmDeleteUser} 
        message="Are you sure you want to delete this user? This action cannot be undone." 
      />
      <GenerateKeyModal 
        isOpen={isGenerateKeyModalOpen} 
        onClose={() => setGenerateKeyModalOpen(false)}  
        creationTime={creationTime} // Pass creation time to modal
      />
    </div>
  );
}

export default AdminDashboard;