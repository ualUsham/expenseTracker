import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Member = () => {
    const [selectedTeam, setSelectedTeam] = useState("");
    const [expenses, setExpenses] = useState([]); //all expenses
    const [showAddModal, setShowAddModal] = useState(false);

    const initialExpenseState = { description: "", amount: "", remarks: "", createdAt: "" };
    const [newExpense, setNewExpense] = useState(initialExpenseState);//to get new expense

    const [showViewModal, setShowViewModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);//to track selected expense
    const [updatedExpense, setUpdatedExpense] = useState({});//to store expenses to be updated
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [userEmail, setUserEmail] = useState();

    useEffect(() => {
        const fetchData = async () => {
            const team = sessionStorage.getItem('team');
            if (!team) {
                navigate('/');
                return;
            }
            setSelectedTeam(team);

            //Do not allow Approver role
            const myRole = sessionStorage.getItem('role');
            if (myRole === 'approver') {
                toast.error('You are not a part of this team !!');
                await new Promise((res) => setTimeout(res, 1500)); // 1.5 sec delay
                navigate('/');
                return;
            }

            const auth = getAuth();
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user && team) {
                    setUserEmail(() => user.email);
                    try {
                        //incase filter is there filter it instead of fetching all
                        if (filterStatus) {
                            const filterData = async () => {
                                try {
                                    const auth = getAuth();
                                    const user = auth.currentUser;

                                    if (user && selectedTeam) {
                                        const res = await axios.get('https://expensetracker-7uaa.onrender.com/getMemExpenses', { params: { uid: user.uid, team: selectedTeam } });

                                        if (filterStatus) {
                                            const filtered = res.data.filter(exp => exp.status === filterStatus);
                                            setExpenses(() => filtered);
                                        } else {
                                            setExpenses(() => res.data);
                                        }
                                    }
                                } catch (error) {
                                    toast.error("Failed to filter", { position: "top-center" });
                                }
                            };
                            filterData();
                            return;
                        }
                        // Fetch expenses of this member after Login
                        const res = await axios.get('https://expensetracker-7uaa.onrender.com/getMemExpenses', { params: { uid: user.uid, team } });
                        setExpenses(res.data);
                    } catch (err) {
                        toast.error('Failed to fetch expenses', { position: 'top-center' });
                    }
                }
            });

            // Cleanup function for unsubscribe
            return () => unsubscribe();
        };

        fetchData();
    }, [navigate, filterStatus, selectedTeam]);

    //Add Expense Button
    const handleAddExpense = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        const expenseToSubmit = {
            uid: user.uid,
            mail: user.email,
            team: selectedTeam,
            description: newExpense.description,
            amount: newExpense.amount,
            createdAt: newExpense.createdAt || new Date(),
            updatedAt: new Date(),
            remarks: newExpense.remarks,
            status: "pending",
        };

        try {
            await axios.post("https://expensetracker-7uaa.onrender.com/newExpenses", expenseToSubmit);
            setExpenses(prev => [expenseToSubmit, ...prev]); //adding at beginning of list
            toast.success("Expense Added Successfully!!", { position: "top-center" });
            setShowAddModal(false);
            setNewExpense(initialExpenseState);

        } catch (err) {
            toast.error(`Failed to add expense ${err}`, { position: "top-center" });
        }
    };

    //View Expense Button
    const handleView = (expense) => {
        setSelectedExpense(expense);
        setShowViewModal(true);
    };

    //Update Button
    const handleUpdate = (expense) => {
        setSelectedExpense(expense);
        setUpdatedExpense({ ...expense });
        setShowUpdateModal(true);
    };

    //Save Update Button
    const handleSaveUpdate = async () => {

        try {
            const res = await axios.put('https://expensetracker-7uaa.onrender.com/updateExpenses', updatedExpense); //returning again to reflect updated time also
            toast.success("Expense Updated Successfully!!", { position: "top-center" });
            setExpenses(prev => prev.map(exp => exp._id === res.data._id ? res.data : exp)); //update UI as well
            setShowUpdateModal(false);

        } catch (err) {
            toast.error("Failed to update expense", { position: "top-center" });
        }
    };

    //set input values of new expense
    const handleInputChange = (setter, field, value) => {
        setter(prev => ({ ...prev, [field]: value }));
    };

    //delete Expense
    const handleDelete = async (expense) => {
        const confirmLogout = window.confirm("Do you want to permanently delete this Expense ?");
        if (confirmLogout) {
            try {
                await axios.delete('https://expensetracker-7uaa.onrender.com/deleteExpense', { data: { _id: expense._id } });
                toast.success("Expense Deleted Successfully!", { position: "top-center" });
                setExpenses(prev => prev.filter(exp => exp._id !== expense._id));
            } catch (err) {
                toast.error("Failed to delete expense", { position: "top-center" });
            }
        };
    };

    //filter by status
    useEffect(() => {
        const fetchData = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (user && selectedTeam) {
                    const res = await axios.get('https://expensetracker-7uaa.onrender.com/getMemExpenses', { params: { uid: user.uid, team: selectedTeam } });

                    if (filterStatus) {
                        const filtered = res.data.filter(exp => exp.status === filterStatus);
                        setExpenses(() => filtered);
                    } else {
                        setExpenses(() => res.data);
                    }
                }
            } catch (error) {
                toast.error("Failed to filter", { position: "top-center" });
            }
        };

        fetchData();

    }, [filterStatus, selectedTeam]);

    //calculate total expenses wrt expenses update
    useEffect(() => {
        let sum = 0;
        for (let i = 0; i < expenses.length; i++) {
            const amount = parseFloat(expenses[i].amount); //convert to proper number
            sum += amount;
        }
        setTotalAmount(sum);
    }, [expenses]);

    return (<>
        <div className="d-flex flex-column align-items-center ">

            <ToastContainer />
            <div className="text-center fst-italic p-2 mb-2 mt-4 border-2 border-bottom ">
                <h4>Team- <span className="text-primary fw-bold">{selectedTeam}</span></h4>
            </div>

            <h5 className="text-primary fw-semi-bold border rounded-3 py-2 px-3 my-3">{userEmail}</h5>

            {/* Add New Expenses button*/}
            <div className="text-center my-4">
                <button className="btn btn-primary btn-lg fw-bold shadow" onClick={() => setShowAddModal(true)}>+ Add New Expenses</button>
            </div>

            {/*Full Display Expenses */}
            <div className="container mt-4 d-flex flex-column flex-wrap" style={{ maxWidth: "800px" }}>
                <hr /><hr /><hr />
                <h4 className="fw-bold mb-3 text-center">My Expenses</h4>

                {/* Filter button */}
                <div className="dropdown mb-3">
                    <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Filter By</button>
                    <ul className="dropdown-menu">
                        <li className="dropdown-item fw-bold" onClick={() => setFilterStatus(null)}>All</li>
                        <li className="dropdown-item text-success fw-bold" onClick={() => setFilterStatus('approved')}>Approved</li>
                        <li className="dropdown-item text-warning fw-bold" onClick={() => setFilterStatus('pending')}>Pending</li>
                        <li className="dropdown-item text-danger fw-bold" onClick={() => setFilterStatus('rejected')}>Rejected</li>
                    </ul>
                </div>
                {/* filter status display*/}
                <span className={`text-center w-auto rounded-2 fw-bold fs-5 text-capitalize pb-1 mb-2 ${filterStatus === "approved" ? "text-bg-success" : filterStatus === "rejected" ? "text-bg-danger" : filterStatus === "pending" ? "text-bg-warning text-white" : "text-dark"}`}>{filterStatus}</span>

                {/*Display Expenses */}
                {expenses.length === 0 ? (
                    <div className="text-center border rounded-3 py-3">I have no {filterStatus} expenses yet.</div>
                ) : (
                    <>
                        {expenses.map((exp) => (
                            <div key={exp._id} className={`border px-3 py-2 mb-3 rounded shadow d-flex justify-content-between align-items-center ${exp.status === "pending" ? "border-warning" : exp.status === "approved" ? "border-success" : exp.status === "rejected" ? "border-danger" : "border-secondary text-secondary"}`}>

                                <div>
                                    <p className="mb-3"> <span className={`badge text-capitalize ${exp.status === "approved" ? "bg-success" : exp.status === "rejected" ? "bg-danger" : "bg-warning text-white"}`}>{exp.status}</span></p>
                                    <p className="fw-bold border border-1 rounded-3 p-2 text-wrap text-capitalize fs-5 bg-white">{exp.description} </p>
                                    <p className="fst-italic border border-1 rounded-3 px-2 py-1 text secondary text-capitalize fs-5 bg-white">{'\u20B9'} {exp.amount} </p>
                                </div>

                                <div className="p-3 d-flex justify-content-end flex-wrap">
                                    <button className="btn btn-secondary m-2 shadow" onClick={() => handleView(exp)}><i className="fa-solid fa-magnifying-glass"></i></button>
                                    {exp.status === "pending" && <button className="btn btn-secondary m-2 shadow" onClick={() => handleUpdate(exp)}><i className="fa-solid fa-pen-to-square"></i></button>}
                                    <button className="btn btn-danger m-2 shadow" onClick={() => handleDelete(exp)}><i className="fa-solid fa-trash"></i></button>
                                </div>

                            </div>
                        ))}
                    </>
                )}
                {/* Total Amount Display */}
                <div className="fs-3 border border-secondary rounded-2 shadow text-center py-2 mt-3">Total <span className={`text-capitalize ${filterStatus === "approved" ? "text-success" : filterStatus === "rejected" ? "text-danger" : filterStatus === "pending" ? "text-warning" : "text-dark"}`}>{filterStatus} </span>: <span className="fst-italic fw-bold">{'\u20B9'} {totalAmount} </span></div>


            </div>
        </div>

        {/* MODALS */}

        {/* Update Expense Modal */}
        {showUpdateModal && updatedExpense && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header d-flex justify-content-center">
                            <h5 className="modal-title text-primary fw-bold">Update Expenses</h5>
                        </div>

                        <div className="modal-body fw-bold">
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <input type="text" className="form-control" value={updatedExpense.description} onChange={(e) => handleInputChange(setUpdatedExpense, "description", e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Amount</label>
                                <input type="number" className="form-control" value={updatedExpense.amount} onChange={(e) => handleInputChange(setUpdatedExpense, "amount", e.target.value)} />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Remarks</label>
                                <textarea className="form-control" value={updatedExpense.remarks} onChange={(e) => handleInputChange(setUpdatedExpense, "remarks", e.target.value)}></textarea>
                            </div>

                        </div>

                        <div className="modal-footer d-flex justify-content-center">
                            <button className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveUpdate}>Update</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {/* View Expenses Modal */}
        {showViewModal && selectedExpense && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">

                        <div className="modal-header d-flex justify-content-center">
                            <h5 className="modal-title text-primary fw-bold">Expense Details</h5>
                        </div>

                        <div className="modal-body text-capitalize">
                            <p><strong>Description:</strong> {selectedExpense.description}</p>
                            <p><strong>Amount:</strong> ₹{selectedExpense.amount}</p>
                            <p><strong>Status:</strong> {selectedExpense.status}</p>
                            <p><strong>Created:</strong> {new Date(selectedExpense.createdAt).toLocaleString()}</p>
                            <p><strong>Updated:</strong> {new Date(selectedExpense.updatedAt).toLocaleString()}</p>
                            <p><strong>Remarks:</strong> {selectedExpense.remarks}</p>
                        </div>

                        <div className="modal-footer d-flex justify-content-center">
                            <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                        </div>

                    </div>
                </div>

            </div>
        )}
        {/* New Expenses Modal */}
        {showAddModal && (
            <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">

                        <div className="modal-header d-flex justify-content-center">
                            <h5 className="modal-title text-primary fw-bold">Add New Expenses</h5>
                        </div>

                        <div className="modal-body fw-bold">
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <input type="text" className="form-control" placeholder="Description" value={newExpense.description} onChange={(e) => handleInputChange(setNewExpense, "description", e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Amount</label>
                                <input type="number" className="form-control" placeholder="₹ Amount" value={newExpense.amount} onChange={(e) => handleInputChange(setNewExpense, "amount", e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Created At</label>
                                <input type="date" className="form-control" value={newExpense.createdAt ? newExpense.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)} onChange={(e) => handleInputChange(setNewExpense, "createdAt", e.target.value)}/>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Remarks (Optional)</label>
                                <textarea className="form-control" placeholder="Remarks" value={newExpense.remarks} onChange={(e) => handleInputChange(setNewExpense, "remarks", e.target.value)}></textarea>
                            </div>

                        </div>

                        <div className="modal-footer d-flex justify-content-center">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleAddExpense}>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
    );
};

export default Member;
