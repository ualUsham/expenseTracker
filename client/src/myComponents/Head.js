import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from './firebase'; 

const Head = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to logout?");
        if (confirmLogout) {
            await auth.signOut();
            sessionStorage.clear();
            navigate("/");
        }
    };

    return (
        <nav className="navbar navbar-light bg-light shadow border-bottom rounded-5 py-5 position-sticky top-0 z-3">
            <div className="container position-relative">

                <Link className="navbar-brand fw-bold h1 fs-2 position-absolute top-50 start-50 translate-middle pb-4" to="/"> Expense<span style={{ color: '#0d6efd' }}>Tracker</span> </Link>
                
                <div>
                    <Link to="/" className='text-secondary position-absolute top-50 start-0 translate-middle-y mt-4 ps-3 ' style={{ textDecoration: 'none' }} >Home</Link>

                    {(location.pathname === "/member" || location.pathname === "/approver") && (
                        <button onClick={handleLogout} className="btn btn-link text-secondary position-absolute top-50 start-0 translate-middle-y mt-4 ps-5" style={{ marginLeft: "60px", textDecoration: 'none' }}>
                            <i class="fa-solid fa-power-off fs-5 me-1"></i> Logout
                        </button>
                    )}

                    <Link to="/about" className='text-secondary position-absolute top-50 end-0 translate-middle-y mt-4 pe-3 ' style={{ textDecoration: 'none' }} >About Us</Link>
                </div>

            </div>
        </nav>
    );
};

export default Head;
