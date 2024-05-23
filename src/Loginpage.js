import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function LoginPage({onLogin}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !password) {
      return toast.error('Name and password are required');
    }

    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    });
    const data = await response.json();

    if (data.status === 'success') {
      toast.success(data.message);
        onLogin(name)
        navigate('/dashboard');
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div>
      <Header />
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input type="text" className="form-control" id="name" onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input type="password" className="form-control" id="password" onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
          <p className="text-center">New here? <a href="/signup">Sign up</a></p>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}

export default LoginPage;