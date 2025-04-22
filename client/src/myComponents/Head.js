import React from "react";
import { Link } from "react-router-dom";

const Head = () => {


    return (
        <nav className="navbar navbar-light bg-light shadow border-bottom rounded-5 py-5 position-sticky top-0 z-3">
            <div className="container position-relative">

                <Link className="navbar-brand fw-bold h1 fs-2 position-absolute top-50 start-50 translate-middle pb-4" to="/"> Expense<span style={{ color: '#0d6efd' }}>Tracker</span> </Link>
                
                <div>
                    <Link to="/" className='text-secondary position-absolute top-50 start-0 translate-middle-y mt-4 ps-3 ' style={{ textDecoration: 'none' }} >Home</Link>
                    <Link to="/about" className='text-secondary position-absolute top-50 end-0 translate-middle-y mt-4 pe-3 ' style={{ textDecoration: 'none' }} >About Us</Link>
                </div>

            </div>
        </nav>
    );
};

export default Head;
