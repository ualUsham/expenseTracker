import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, sendEmailVerification, deleteUser, signInWithEmailAndPassword } from "firebase/auth";
import axios from "axios";

const RegisterMember = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectTeam, setSelectTeam] = useState("");//new team
  const [teams, setTeams] = useState([]);//fetched team
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    //if Already login, go to member/approve page
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

    unsubscribe();

    // Fetch available teams to display to member
    const fetchTeams = async () => {
      try {
        const res = await axios.get("https://expensetracker-7uaa.onrender.com/teams");
        setTeams(res.data);
      } catch (err) {
        toast.error("Failed to load teams. Try again later!!", { position: "top-center" });
      }
    };
    fetchTeams();
  }, []);


  //Registration process
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      //Check if email exists, then bypass Firebase signup (team is being checked backend)
      const resp = await axios.get("https://expensetracker-7uaa.onrender.com/check-email", { params: { email } });
      if (resp.data.exists) {

        //login and get uid
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        //create Member of new team
        try {
          await axios.post("https://expensetracker-7uaa.onrender.com/register", {
            email: user.email,
            name: name,
            uid: user.uid,
            team: selectTeam,
            role: "member",
          });
        } catch (error) {
          toast.error(`Failed registration and storing.${error}`, { position: "top-center" });
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return;
        }

        sessionStorage.setItem("team", selectTeam);// useful for next route
        sessionStorage.setItem("role", "member");// useful for next route
        navigate("/member");
        return;
      }

      //Create New User
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      if (user) {
        await sendEmailVerification(user);

        toast.info("Verification email sent!! Please verify within 5 minutes.", { position: "top-center", autoClose: 300000 });

        let attempts = 0;
        while (attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 30000)); // 30 sec
          await user.reload();

          if (user.emailVerified) {
            toast.success("Email verified! Redirecting...", { position: "top-center" });
            await new Promise((res) => setTimeout(res, 3000));

            //store at backend
            try {
              const res = await axios.post("https://expensetracker-7uaa.onrender.com/register", {
                email: user.email,
                name: name,
                uid: user.uid,
                team: selectTeam,
                role: "member",
              });

              toast.success(res.data.message || "Registration successful", { position: "top-center" });
              await new Promise((res) => setTimeout(res, 2000));

              sessionStorage.setItem("team", selectTeam);// useful for next route
              sessionStorage.setItem("role", "member");// useful for next route
              navigate("/member");

            } catch (err) {
              const msg = err.response?.data?.message || "Registration failed. Please try again.";
              toast.error(msg, { position: "top-center" });
              await deleteUser(user);//delete firebase user if failed storing
            }

            return;
          }

          attempts++;
        }

        await deleteUser(user);
        toast.error("Unverified account deleted after 5 minutes.", { position: "top-center" });
      }

    } catch (error) {
      toast.error(error.code.replace("auth/", ""), { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-flex d-lg-flex justify-content-center">
      <form className="border rounded-3 m-3 mt-5 p-3  position-relative" onSubmit={handleSubmit} style={{ minWidth: "315px" }}>

        <ToastContainer />
        <div className="position-absolute top-0 start-50 translate-middle-x fs-3 fw-bold text-nowrap mt-2" style={{ whiteSpace: "nowrap" }}>Register as <span style={{ color: '#0d6efd' }}>Member</span></div>
        <br />
        <div className="mb-4 mt-5">
          <label className="form-label fs-5">Member Name</label>
          <input type="text" className="form-control border" placeholder="Member Name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="my-4">
          <label className="form-label fs-5">Select Team</label>
          <select className="form-control border" value={selectTeam} onChange={(e) => setSelectTeam(e.target.value)} required>
            <option value="">Choose your team</option>
            {teams.map((teamObj, idx) => (
              <option key={idx} value={teamObj.name || teamObj}> {teamObj.name || teamObj} </option>
            ))}
          </select>
        </div>

        <div className="my-4">
          <label className="form-label fs-5">Email</label>
          <input type="email" className="form-control border" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="my-4">
          <label className="form-label fs-5">Password</label>
          <input type="password" className="form-control border" placeholder="Choose a new password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="btn btn-primary mb-4" disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm" /> : "Submit"}
        </button>

        <div>* Already registered? <Link to="/login" style={{ textDecoration: 'none' }}> Login</Link> here.</div>
        <div>* Want to Check Out this App ?? <Link to='/about' style={{ textDecoration: 'none' }}>Read Guidelines</Link></div>
      </form>
    </div>
  );
};

export default RegisterMember;
