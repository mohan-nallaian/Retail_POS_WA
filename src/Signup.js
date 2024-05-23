import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.mobile) {
      toast.error('All fields must be filled');
    } else if (!form.email.includes('@')) {
      toast.error('Invalid email');
    } else if (form.mobile.length !== 10) {
      toast.error('Mobile number must be 10 characters');
    } else {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    }
  };


  return (
    <div>
      <Header />
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Mobile</label>
          <input type="text" className="form-control" name="mobile" value={form.mobile} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
      <ToastContainer />
      </div>
      <p className="text-center">Already have an account? <button className="link-button" onClick={() => navigate('/')}>Log in</button></p>
    </div>
  );
}

export default SignupPage;