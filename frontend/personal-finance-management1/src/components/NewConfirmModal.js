import React from 'react';
import './NewConfirmModal.css';

const NewConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="new-modal-overlay">
      <div className="new-modal">
        <h2>Confirmation</h2>
        <p>{message}</p>
        <div className="new-modal-actions">
          <button className="cancel" onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default NewConfirmModal;
