import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Member = () => {
    const [selectedTeam, setSelectedTeam] = useState("");
    const [expenses, setExpenses] = useState([]); //all expenses
    const [showAddModal, setShowAddModal] = useState(false);
    const initialExpenseState = { description: "", amount: "", remarks: "" };
    const [newExpense, setNewExpense] = useState(initialExpenseState);//to get new expense

    const [showViewModal, setShowViewModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);//to track selected expense
    const [updatedExpense, setUpdatedExpense] = useState({});//to store expenses to be updated
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const team = sessionStorage.getItem('team');
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
                    try {
                        // Fetch expenses of this member
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
    }, [navigate]);

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
            remarks: newExpense.remarks,
        };

        try {
            const res = await axios.post("https://expensetracker-7uaa.onrender.com/newExpenses", expenseToSubmit); //i am returning new expenses again
            toast.success("Expense Added Successfully!!", { position: "top-center" });
            setShowAddModal(false);
            setNewExpense(initialExpenseState);
            setExpenses(expenses => [...expenses, res.data]);

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
            setExpenses(prev => prev.map(exp =>exp._id === res.data._id ? res.data : exp )); //update UI as well
            setShowUpdateModal(false);

        } catch (err) {
            toast.error("Failed to update expense", { position: "top-center" });
        }
    };

    //set values of new expense
    const handleInputChange = (setter, field, value) => {
        setter(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="d-flex flex-column align-items-center ">

            <ToastContainer />
            <div className="text-center fst-italic p-2 mb-2 mt-4 border-2 border-bottom ">
                <h4>Team- <span className="text-primary fw-bold">{selectedTeam}</span></h4>
            </div>

            {/* Add New Expenses button*/}
            <div className="text-center my-4">
                <button className="btn btn-primary btn-lg fw-bold shadow" onClick={() => setShowAddModal(true)}>+ Add New Expenses</button>
            </div>

            {/*Display Expenses */}
            <div className="container mt-4 d-flex flex-column flex-wrap" style={{ maxWidth: "800px" }}>
                <hr /><hr /><hr />
                <h5 className="fw-bold mb-3 text-center">My Expenses</h5>

                {expenses.length === 0 ? (
                    <div className="text-center border rounded-3 py-3">I haven't added any Expenses yet.</div>
                ) : (
                    <> {/*Display Expenses */}
                        {expenses.map((exp) => (
                            <div key={exp._id} className={`border px-3 py-2 mb-3 rounded shadow d-flex justify-content-between align-items-center ${exp.status === "pending" ? "border-warning" : exp.status === "approved" ? "border-success" : exp.status === "rejected" ? "border-danger" : "border-secondary text-secondary"}`}>

                                <div>
                                    <p className="mb-3"> <span className={`badge text-capitalize ${exp.status === "approved" ? "bg-success" : exp.status === "rejected" ? "bg-danger" : "bg-warning text-white"}`}>{exp.status}</span></p>
                                    <p className="fw-bold border border-1 rounded-3 p-2 text-wrap text-capitalize fs-5 bg-white">{exp.description} </p>
                                    <p className="fst-italic border border-1 rounded-3 px-2 py-1 text secondary text-capitalize fs-5 bg-white">{'\u20B9'} {exp.amount} </p>
                                </div>

                                <div className="p-3 d-flex justify-content-end flex-wrap">
                                    <button className="btn btn-secondary m-2 shadow" onClick={() => handleView(exp)}><i class="fa-solid fa-magnifying-glass"></i></button>
                                    {exp.status === "pending" && <button className="btn btn-secondary m-2 shadow" onClick={() => handleUpdate(exp)}><i class="fa-solid fa-pen-to-square"></i></button>}
                                </div>

                            </div>
                        ))}

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
                    </>
                )}
            </div>

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
        </div>
    );
};

export default Member;
