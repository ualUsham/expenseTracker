import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Approver = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);//to track selected expense
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [userEmail, setUserEmail] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const team = sessionStorage.getItem("team");
      if (!team) {
        navigate('/');
        return;
      }
      setSelectedTeam(team);

      const myRole = sessionStorage.getItem("role");
      if (myRole === "member") {
        toast.error("You are not a part of this team !!");
        await new Promise((res) => setTimeout(res, 1500)); // 1.5 sec delay
        navigate("/login");
        return;
      }


      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user && team) {
          setUserEmail(() => user.email);
          try {
            //incase filter is there
            if (filterStatus) {
              const filterData = async () => {
                try {
                  const auth = getAuth();
                  const user = auth.currentUser;

                  if (user && selectedTeam) {
                    const res = await axios.get('https://expensetracker-7uaa.onrender.com/getTeamExpenses', { params: { uid: user.uid, team: selectedTeam } });

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
            // Get expenses of all members for the team on login
            const res = await axios.get(
              "https://expensetracker-7uaa.onrender.com/getTeamExpenses",
              { params: { team } }
            );
            setExpenses(res.data);
          } catch (err) {
            toast.error("Failed to fetch team expenses", {
              position: "top-center",
            });
          }
        }
      });

      return () => unsubscribe(); // Cleanup on unmount
    };

    fetchData();
  }, [navigate, filterStatus, selectedTeam]);

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
    const filterData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user && selectedTeam) {
          const res = await axios.get('https://expensetracker-7uaa.onrender.com/getTeamExpenses', { params: { uid: user.uid, team: selectedTeam } });

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

  return (
    <div className="d-flex flex-column align-items-center">

      <ToastContainer />
      <div className="text-center fst-italic p-2 mb-2 mt-4 border-2 border-bottom ">
        < h4 >Team - <span className="text-primary fw-bold ">{selectedTeam}</span></h4 >
      </div >

      <h5 className="text-primary fw-semi-bold border rounded-3 py-2 px-3 my-3">{userEmail}</h5>

      <div className="text-center text-bg-primary shadow fw-bold my-4 p-2 fs-5 rounded-3">You are the Approver !!</div>

      <div className="container mt-2 d-flex flex-column flex-wrap" style={{ maxWidth: "800px" }}>
        <hr /><hr /><hr />
        <h4 className="fw-bold mb-3 text-center">Team Expenses</h4>

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
        {/* filter status */}
        <span className={`text-center w-auto rounded-2 fw-bold fs-5 text-capitalize pb-1 mb-2 ${filterStatus === "approved" ? "text-bg-success" : filterStatus === "rejected" ? "text-bg-danger" : filterStatus === "pending" ? "text-bg-warning text-white" : "text-dark"}`}>{filterStatus}</span>

        {/* Display Expenses */}
        {expenses.length === 0 ? (
          <div className="text-center border rounded-3 py-3">Team <strong>{selectedTeam}</strong> have no {filterStatus} expenses.</div>
        ) : (
          expenses.map((exp) => (
            <div key={exp._id} className={`border px-3 py-2 mb-3 rounded shadow d-flex justify-content-between align-items-center ${exp.status === "pending" ? "border-warning" : exp.status === "approved" ? "border-success" : "border-danger"}`}>

              <div>
                <p className="mb-1"> <span className={`badge text-capitalize ${exp.status === "approved" ? "bg-success" : exp.status === "rejected" ? "bg-danger" : "bg-warning text-white"}`}>{exp.status}</span></p>
                <p className="fw-bold border rounded-3 p-2 text-capitalize fs-4 mt-3">{exp.description} </p>
                <p className="fst-italic border border-1 rounded-3 px-2 py-1 text secondary text-capitalize fs-5 bg-white">{'\u20B9'} {exp.amount} </p>
                <p className="fw-bold border rounded-2 px-2 text-secondary">By <span className="text-primary">{exp.mail}</span></p>
              </div>

              <div className="d-flex justify-content-end flex-wrap ">
                <button className="btn btn-secondary m-2 shadow " onClick={() => handleView(exp)}><i className="fa-solid fa-magnifying-glass"></i></button>
                {exp.status === "pending" && <button className="btn btn-success m-2 shadow" onClick={() => handleApprove(exp)}><i className="fa-solid fa-check-double"></i></button>}
                {exp.status === "pending" && <button className="btn btn-danger m-2 shadow" onClick={() => handleReject(exp)}><i className="fa-solid fa-skull-crossbones"></i></button>}
                {exp.status !== "pending" && <button className="btn btn-warning m-2 shadow" onClick={() => handlePending(exp)}><i className="fa-solid fa-hourglass-half text-white"></i></button>}
                <button className="btn btn-outline-danger m-2 shadow" onClick={() => handleDelete(exp)}><i className="fa-solid fa-trash"></i></button>
              </div>

            </div>
          ))
        )}
        {/* Total Amount Display */}
        <div className="fs-3 border border-secondary rounded-2 shadow text-center py-2 mt-3">Total <span className={`text-capitalize ${filterStatus === "approved" ? "text-success" : filterStatus === "rejected" ? "text-danger" : filterStatus === "pending" ? "text-warning" : "text-dark"}`}>{filterStatus} </span>: <span className="fst-italic fw-bold">{'\u20B9'} {totalAmount} </span></div>

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
                <p><strong>Created:</strong> {new Date(selectedExpense.createdAt).toLocaleDateString()}</p>
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
