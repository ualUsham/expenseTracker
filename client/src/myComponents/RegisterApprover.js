import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, sendEmailVerification, deleteUser, signInWithEmailAndPassword } from "firebase/auth";
import axios from "axios";

const RegisterApprover = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamName, setTeamName] = useState("");
  const [approverName, setApproverName] = useState("");
  const [loading, setLoading] = useState(false);
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

  //Registration process
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if team exists
      const res = await axios.get("https://expensetracker-7uaa.onrender.com/teams");
      const existingTeams = res.data;
      const exists = existingTeams.includes(teamName);
      if (exists) {
        toast.error("Team already exists!", { position: "top-center" });
        setLoading(false);
        return;
      }

      //Check if email exists, then bypass Firebase signup
      const resp = await axios.get("https://expensetracker-7uaa.onrender.com/check-email", { params: { email } });
      if (resp.data.exists) {

        //login and get uid
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        //create Approver of new team
        try {
          await axios.post("https://expensetracker-7uaa.onrender.com/register", {
            email: user.email,
            name: approverName,
            uid: user.uid,
            team: teamName,
            role: "approver",
          });
        } catch (error) {
          toast.error("Failed registration and storing", { position: "top-center" });
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return;
        }

        sessionStorage.setItem("team", teamName);// useful for next route
        sessionStorage.setItem("role", "approver");// useful for next route
        navigate("/approver");
        return;
      }

      //Create New User
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      if (user) {
        await sendEmailVerification(user);
        toast.info("Verification email sent!! Please verify within 5 minutes...", { position: "top-center", autoClose: 300000 });

        // Verification
        let attempts = 0;
        while (attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 30000));
          await user.reload();

          if (user.emailVerified) {
            toast.success("Email verified!! Redirecting...", { position: "top-center" });

            await new Promise((resolve) => setTimeout(resolve, 3000));
            //Send to backend to store in database
            try {
              await axios.post("https://expensetracker-7uaa.onrender.com/register", {
                email: user.email,
                name: approverName,
                uid: user.uid,
                team: teamName,
                role: "approver",
              });
            } catch (error) {
              toast.error("Failed registration and storing", error);
              await deleteUser(user);//delete user if backend fails storing 
              return;
            }

            sessionStorage.setItem("team", teamName);// useful for next route
            sessionStorage.setItem("role", "approver");// useful for next route
            navigate("/approver");
            return;
          }

          attempts++;
        }

        // Delete if unverified
        await deleteUser(user);
        toast.error("Unverified account deleted after 5 minutes.", { position: "top-center" });
      }

    } catch (error) {
      toast.error(`Registration error:${error}`, { position: "top-center" });
      console.log(error);

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container-flex d-lg-flex justify-content-center" >
      <form className="border rounded-3 m-3 mt-5 p-3 position-relative" onSubmit={handleSubmit} style={{ minWidth: "315px" }}>

        <ToastContainer />
        <div className="position-absolute top-0 start-50 translate-middle-x fs-3 fw-bold text-nowrap mt-2" style={{ whiteSpace: "nowrap" }}>Register as <span style={{ color: '#0d6efd' }}>Approver</span></div>
        <br />
        <div className="mt-5">
          <label className="form-label fs-5">Team Name</label>
          <input type="text" className="form-control border" placeholder="New Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} required /></div>

        <div className="my-4">
          <label className="form-label fs-5">Approver Name</label>
          <input type="text" className="form-control border" placeholder="Approver Name" value={approverName} onChange={(e) => setApproverName(e.target.value)} required /></div>

        <div className="my-4">
          <label className="form-label fs-5">Email</label>
          <input type="email" className="form-control border" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>

        <div className="my-4">
          <label className="form-label fs-5">Password</label>
          <input type="password" className="form-control border" placeholder="Choose a new password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>

        <button type="submit" className="btn btn-primary mb-4" disabled={loading}>
          {loading ? (
            <span className="spinner-border spinner-border-sm" ></span>
          ) : (
            "Submit"
          )}
        </button>

        <div>* If you have registered already, please <Link to='/login' style={{ textDecoration: 'none' }}>Login</Link> here.</div>
        <div>* Want to Check Out this App ?? <Link to='/about' style={{ textDecoration: 'none' }}>Read Guidelines</Link></div>
      </form>
    </div>
  );
};

export default RegisterApprover;
