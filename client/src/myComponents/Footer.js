import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-5" >
      <div className="container-fluid text-center fw-bold bg-light pb-5 pt-3 " style={{marginTop:"200px"}}>
        <p className="mb-0">&copy; {new Date().getFullYear()} Team<span style={{ color: '#20c997' }}>Xpense</span>. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
