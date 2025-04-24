import React from "react";

const AboutUs = () => {
    return (
        <div className="container rounded-5 py-2 my-5 bg-light min-vh-100 d-flex flex-column justify-content-start align-items-center">

            <div className="text-center mb-4 position-relative">
                <h1 className="fw-bold mt-2">About Us</h1>
                <p className="lead my-5">
                    Welcome to <span className="fw-bold">Team</span><span className="text-primary fw-bold">Xpense !!</span>
                    <br />
                    Our goal is to help individuals and teams effortlessly track, manage and review their expenses.
                    <br />
                    Whether you're part of a startup, club or organization, you can track, submit
                    <br />
                    and approve expenses collaboratively — <span className="fw-bold">All in One Place !!</span>
                </p>
                <hr />
            </div>

            <div className="card shadow mb-5">
                <div className="card-body">

                    <h4 className="card-title mb-3 text-center border-bottom pb-3">Guidelines</h4>

                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            The App consists of multiple <strong>Teams.</strong> Each team has <strong>1 Approver</strong> and multiple <strong>Members.</strong>
                        </li>
                        <li className="list-group-item">
                            Only <strong>Approvers </strong>can create a <strong>New Team</strong> while registering.
                        </li>
                        <li className="list-group-item">
                            <strong>Members</strong> can only join an <strong>Existing Team.</strong>
                        </li>
                        <li className="list-group-item">
                            A<strong> User</strong> can join multiple teams but <strong>Cannot</strong> rejoin the same team with another Role.
                        </li>
                        <li className="list-group-item">
                            Each Team has <strong>unique </strong>Users.
                        </li>
                        <li className="list-group-item">
                            Members can <strong>Add</strong> new expenses, which goes to <span className="fw-bold text-warning">Pending </span>status.
                        </li>
                        <li className="list-group-item">
                            Members can <strong>Edit</strong> their expenses while in <span className="fw-bold text-warning">Pending </span>status <strong>Only.</strong>
                        </li>
                        <li className="list-group-item">
                            <strong>Approver </strong>has access to expenses for <strong>All</strong> members.
                        </li>
                        <li className="list-group-item">
                            An Approver can <span className="fw-bold text-success">Approve</span>, <span className="fw-bold text-danger">Reject </span>or put an expense to <span className="fw-bold text-warning">Pending </span>for any member.
                        </li>
                        <li className="list-group-item">
                            <span className="fw-bold text-primary">Testing this App</span>
                            <br />
                            To allow people to check out this app, I have made some accounts below :
                            <br /><br />
                            <strong>Team :</strong> <span className="fw-bold text-primary">Legends</span>
                            <br />
                            <strong>Approver :</strong> <span className="text-danger">2022mmb1392@iitrpr.ac.in</span> | <span className="text-primary">testing123</span>
                            <br />
                            <strong>Members :</strong> <span>ushamadhityaual@gmail.com</span> | <span className="text-primary">testing123</span>
                            <br />
                            <strong className="text-white">Members :</strong> <span>ushamaditya@gmail.com</span> | <span className="text-primary">testing123</span>
                            <br />
                            <strong className="text-white">Members :</strong> <span>ualusham2656@gmail.com</span> | <span className="text-primary">testing123</span>
                        </li>
                        <li className="list-group-item text-center text-success mt-3 fs-4">
                            <strong>Feel Free to Create a New Team or Join a Team !! 😊</strong>
                        </li>
                    </ul>
                </div>
            </div>
        </div>


    );
};

export default AboutUs;
