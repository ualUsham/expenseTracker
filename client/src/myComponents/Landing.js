import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './landing.css';
import { auth } from './firebase';

const Landing = () => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleRoleSelection = (role) => {
        navigate(`/register${role}`);
    };

    const handleGetStarted = () => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {//already login
                const role = sessionStorage.getItem('role');
                const team = sessionStorage.getItem('team');

                if (role && team) {
                    if (role === "approver") {
                        navigate("/approver");
                    } else if (role === "member") {
                        navigate("/member");
                    }
                }
            } else {// not login
                setShowModal(true);
            }

            unsubscribe();
        });
    };


    return (
        <div className="container-fluid d-flex flex-column align-items-center justify-content-center">
            <i className="fa-solid fa-money-check-dollar mt-4"></i>

            <div className="container text-center mt-5">
                <h1 className="display-4 fw-bold mb-4 ">Track Your Expenses <br />With <span style={{ color: '#20c997' }}>Ease</span></h1>
                <p className="lead mb-4 text-secondary fw-normal">Submit, Approve and Manage Expenses effortlessly with our simple and secure platform.</p>

                <div className="d-flex justify-content-center gap-3 flex-wrap my-5">
                    <Link to="/login" className="btn btn-primary btn-lg shadow">Login</Link>
                    <button className="btn btn-outline-primary btn-lg border-2 shadow" onClick={handleGetStarted}>Get Started</button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">

                            <div className="modal-header d-flex justify-content-center ">
                                <h5 className="modal-title">Select Your Role</h5>
                                <button type="button" className="btn-close position-absolute top-0 end-0 m-2" onClick={() => setShowModal(false)}></button>
                            </div>

                            <div className="modal-body d-flex flex-column align-items-center gap-3">
                                <button className="btn btn-primary border-2 w-75" onClick={() => handleRoleSelection("approver")}>Register as Approver</button>
                                <button className="btn btn-primary border-2 w-75" onClick={() => handleRoleSelection("member")}>Register as Member</button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Landing;
