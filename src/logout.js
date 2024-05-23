import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login'); 
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default Logout;