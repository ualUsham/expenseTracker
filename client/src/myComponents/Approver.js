import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Approver = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);//to track selected expense

  useEffect(() => {
    const team = sessionStorage.getItem("team");
    setSelectedTeam(team);

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && team) {
        try {//get expenses of all members first
          const res = await axios.get("https://expensetracker-7uaa.onrender.com/getTeamExpenses", { params: { team } });
          setExpenses(res.data);
        } catch (err) {
          toast.error("Failed to fetch team expenses", {
            position: "top-center",
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  //View Expense Button
  const handleView = (expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  //handle Approve
  const handleApprove = async (expense) => {

    try {
      const approvedExpense = { ...expense, status: 'approved' }
      const res = await axios.put('https://expensetracker-7uaa.onrender.com/updateExpenses', approvedExpense);
      toast.success("Expense Approved Successfully !!", { position: "top-center" });
      setExpenses(prev => prev.map(e => e._id === res.data._id ? res.data : e)); //update status at UI

    } catch (err) {
      toast.error("Failed to Approve expense", { position: "top-center" });
    }
  };

  //handle Reject
  const handleReject = async (expense) => {
    try {
      const rejectedExpense = { ...expense, status: 'rejected' }
      const res = await axios.put('https://expensetracker-7uaa.onrender.com/updateExpenses', rejectedExpense);
      toast.success("Expense Rejected Successfully !!", { position: "top-center" });
      setExpenses(prev => prev.map(e => e._id === res.data._id ? res.data : e)); //update status at UI

    } catch (err) {
      toast.error(`Failed to Reject expense ${err}`, { position: "top-center" });
    }
  };

  //handle Pending
  const handlePending = async (expense) => {
    try {
      const pendingExpense = { ...expense, status: 'pending' }
      const res = await axios.put('https://expensetracker-7uaa.onrender.com/updateExpenses', pendingExpense);
      toast.success("Expense in Pending !!", { position: "top-center" });
      setExpenses(prev => prev.map(e => e._id === res.data._id ? res.data : e)); //update status at UI

    } catch (err) {
      toast.error(`Failed to Pending status ${err}`, { position: "top-center" });
    }
  };

  return (
    <div className="d-flex flex-column align-items-center">

      <ToastContainer />
      <div className="text-center fst-italic p-2 mb-2 mt-4 border-2 border-bottom ">
        < h4 >Team - <span className="text-primary fw-bold ">{selectedTeam}</span></h4 >
      </div >

      <div className="text-center text-bg-primary shadow fw-bold my-4 p-2 fs-5 rounded-3">You are the Approver !!</div>

      {/* Display Expenses */}
      < div className="container mt-4 d-flex flex-column flex-wrap" style={{ maxWidth: "800px" }}>
        <hr /><hr /><hr />
        <h5 className="fw-bold mb-3 text-center">Team Expenses</h5>

        {
          expenses.length === 0 ? (
            <div className="text-center border rounded-3 py-3">No expenses added by members of team: {selectedTeam}</div>
          ) : (
            expenses.map((exp) => (
              <div key={exp._id} className={`border px-3 py-2 mb-3 rounded shadow d-flex justify-content-between align-items-center ${exp.status === "pending" ? "border-warning" : exp.status === "approved" ? "border-success" : "border-danger"}`}>

                <div>
                  <p className="mb-1"> <span className={`badge text-capitalize ${exp.status === "approved" ? "bg-success" : exp.status === "rejected" ? "bg-danger" : "bg-warning text-white"}`}>{exp.status}</span></p>
                  <p className="fw-bold border rounded-3 p-2 text-capitalize fs-4 mt-3">{exp.description} </p>
                  <p className="fw-bold border rounded-2 px-2 text-secondary">By <span className="text-primary">{exp.mail}</span></p>
                </div>

                <div className="d-flex justify-content-end flex-wrap ">
                  <button className="btn btn-secondary m-2 shadow " onClick={() => handleView(exp)}><i class="fa-solid fa-magnifying-glass"></i></button>
                  {exp.status === "pending" && <button className="btn btn-success m-2 shadow" onClick={() => handleApprove(exp)}><i class="fa-solid fa-check-double"></i></button>}
                  {exp.status === "pending" && <button className="btn btn-danger m-2 shadow" onClick={() => handleReject(exp)}><i class="fa-solid fa-skull-crossbones"></i></button>}
                  {exp.status !== "pending" && <button className="btn btn-warning m-2 shadow" onClick={() => handlePending(exp)}><i class="fa-solid fa-hourglass-half text-white"></i></button>}
                </div>

              </div>
            ))
          )
        }
      </div >

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
    </div >
  );
};

export default Approver;
