import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div />
      <div className="navbar-user">
        <div className="navbar-user-info">
          <p className="navbar-username">{user?.username}</p>
          <p className="navbar-role">{user?.role?.replace("_", " ")}</p>
        </div>
        <button onClick={handleLogout} className="navbar-logout">
          Log out
        </button>
      </div>
    </header>
  );
};

export default Navbar;
