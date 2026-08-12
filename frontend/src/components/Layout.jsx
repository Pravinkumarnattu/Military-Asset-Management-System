import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-content">
        <Navbar />
        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
