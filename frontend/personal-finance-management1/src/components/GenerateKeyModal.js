import React, { useState } from 'react';
import axios from 'axios';
import './GenerateKeyModal.css';

const GenerateKeyModal = ({ isOpen, onClose, onGenerateKey }) => {
  const [newKey, setNewKey] = useState('');
  const [creationTime, setCreationTime] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateKey = async () => {
    setLoading(true);
    setSuccessMessage('');
    setNewKey('');
    try {
      // Generate random key
      const key = Math.random().toString(36).slice(2, 64);
      const createdAt = new Date().toLocaleString();
      setCreationTime(createdAt);

      // Simulating sending to server
      const expirationTime = 30; // expiration time in minutes
      const token = localStorage.getItem("token");
      
      await axios.put('https://localhost:7050/api/Admin/update-key', 
        {
          key: key,
          expiresIn: expirationTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewKey(key);
      setSuccessMessage('Key created and updated successfully!');
    } catch (error) {
      console.error("Error generating new key:", error);
      setSuccessMessage("Failed to generate new key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="generate-key-overlay">
      <div className="generate-key-modal">
        <h2>Generate New Registration Key</h2>
        <button onClick={handleGenerateKey} disabled={loading}>
          {loading ? "Generating..." : "Generate Key"}
        </button>
        {newKey && <p>New Key: {newKey} (Valid for 30 minutes)</p>}
        {creationTime && <p>Created at: {creationTime}</p>}
        {successMessage && <p className={successMessage.includes('success') ? 'success-message' : 'error-message'}>{successMessage}</p>}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default GenerateKeyModal;
