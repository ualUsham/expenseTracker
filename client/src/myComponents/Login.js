import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { auth } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import axios from "axios";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]); // Storing fetched teams
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  //if Already login, go to member/approve page
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const role = sessionStorage.getItem('role');
        const team = sessionStorage.getItem('team');

        if (role && team) {
          if (role === "approver") {
            navigate("/approver");
          } else if (role === "member") {
            navigate("/member");
          }
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      const uid = user.uid;

      // Fetch user teams
      const resp = await axios.get("https://expensetracker-7uaa.onrender.com/myteams", { params: { user : uid } });
      setTeams(resp.data.teams);
      setShowModal(true);

    } catch (error) {
      toast.error("Login failed!! Try again later", { position: "top-center" });
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const handlePasswordChange = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent! Check your email.", { position: "top-center" });
      setEmail('');
    } catch (error) {
      toast.error(error.code);
    }
  };

  // Handle the team selection and Navigate
  const handleConfirm = async () => {
    sessionStorage.setItem('team', selectedTeam); //useful for next route

    try {
      const resp = await axios.get("https://expensetracker-7uaa.onrender.com/check-role", {
        params: { user: auth.currentUser.uid },
      });

      const userRoles = resp.data.roles;
      const selectedRole = userRoles.find((role) => role.team === selectedTeam); //finding role of this team
      sessionStorage.setItem('role', selectedRole.role); //useful for next route

      if (selectedRole.role === "approver") {
        navigate("/approver");
      } else if (selectedRole.role === "member") {
        navigate("/member");
      }

    } catch (error) {
      toast.error("Error checking user role: " + error.message);
    }

    setShowModal(false);
  };

  return (
    <div className="container-flex d-lg-flex justify-content-center">
      <form className="border rounded-3 m-3 mt-5 p-3 position-relative" onSubmit={handleSubmit} style={{ minWidth: "300px" }}>
        <ToastContainer />
        <div className="position-absolute top-0 start-50 translate-middle-x fs-3 fw-bold"> Sign In </div>

        <div className="mb-3 mt-5">
          <label className="form-label fs-5">Email</label>
          <input type="email" className="form-control border" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="my-4">
          <label className="form-label fs-5">Password</label>
          <input type="password" className="form-control border" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="btn btn-primary mb-4" disabled={loading}>
          {loading ? (
            <span className="spinner-border spinner-border-sm"></span>
          ) : (
            "Login"
          )}
        </button>

        <div>* Not registered already? <Link to='/' style={{ textDecoration: 'none' }}>Get Started</Link></div>
        <div>*<Link to='' onClick={handlePasswordChange} style={{ textDecoration: 'none' }}> Forgot Password?</Link></div>
        <div>* Want to Check Out this App ?? <Link to='/about' style={{ textDecoration: 'none' }}>Read Guidelines</Link></div>
      </form>

      {/* Team Selection Modal */}
      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }} >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Select Your Team</h5>
              </div>

              <div className="modal-body">
                <select className="form-select" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                  <option value="">-- Select a team --</option>
                  {teams.map((team, idx) => (
                    <option key={idx} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={!selectedTeam}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
