import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Loginpage';
import SignupPage from './Signup';
import Dashboard from './Dashboard'; 
import { ToastContainer } from 'react-toastify';
import Logout from './logout';
import Navbar from './navbar';
import OrderPage from './order';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [username, setUsername] = useState(null);

  const handleLogin = (username) => {
    setUsername(username);
  };

  const handleLogout = () => {
    setUsername(null); 
  };

  return (
    <Router>
      <ToastContainer />
      {username && <Navbar username={username} onLogout={handleLogout} />}
      <Routes>
        <Route path="/logout" element={username ? <Logout onLogout={handleLogout} /> : <LoginPageWithProps onLogin={handleLogin} />} /> 
        <Route path="/order" element={username ? <OrderPage /> : <LoginPageWithProps onLogin={handleLogin} />} />
        <Route path="/dashboard" element={username ? <Dashboard /> : <LoginPageWithProps onLogin={handleLogin} />} /> {/* Add a route for the Dashboard */}
        <Route path="/" element={username ? <OrderPage /> : <LoginPageWithProps onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
}

function LoginPageWithProps(props) {
  return <LoginPage {...props} />;
}

export default App;