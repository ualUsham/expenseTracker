import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterApprover from './myComponents/RegisterApprover.js';
import RegisterMember from './myComponents/RegisterMember.js';
import Login from './myComponents/Login.js';
import Landing from "./myComponents/Landing.js";
import Head from './myComponents/Head.js';
import Footer from './myComponents/Footer.js';
import Approver from "./myComponents/Approver.js";
import Member from "./myComponents/Member.js";
import AboutUs from "./myComponents/About Us.js";
// import Profile from "./myComponents/profile.js";


function App() {
  return (
    <BrowserRouter>
      <Head />
      <Routes>

        <Route path="/" element={<> <Landing /><AboutUs /> </>} />;
        <Route path="/registerApprover" element={<RegisterApprover />} />
        <Route path="/registerMember" element={<RegisterMember />} />
        <Route path="/login" element={<Login />} />
        <Route path="/member" element={<Member />} />
        <Route path="/approver" element={<Approver />} />
        <Route path="/about" element={<AboutUs />} />
        {/* <Route path="/profile" element={<Profile/>}/> */}

      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;