const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const User = require("./models/User"); //mongodb collection
const Expense = require("./models/Expense"); //mongodb collection

const app = express();
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);
app.use(express.json());

const PORT = process.env.PORT || 5000;

//Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

//Registration
app.post("/register", async (req, res) => {
    const { email, name, uid, team, role } = req.body;

    try {
        let user = await User.findOne({ uid });

        if (!user) {
            // New user
            user = new User({
                uid,
                name,
                email,
                roles: [{ team, role }],
            });

        } else {
            // Old user (check if already in the team)
            const teamExists = user.roles.find(r => r.name === team);

            if (teamExists) {
                return res.status(400).json({ error: `You are already registered as ${teamExists.role} in this team.` });
            }else{
            // Add new team and role
            user.roles.push({ team, role });
        }
        }

        await user.save();
        return res.status(200).json({ message: `Registered successfully`, user });

    } catch (err) {
        return res.status(500).json({ error: "Registration failed" });
    }
});


// Get expenses of a Member
app.get("/getMemExpenses", async (req, res) => {
    const { uid, team } = req.query;

    try {
        const expenses = await Expense.find({ uid, team }).sort({ createdAt: -1 });
        res.status(200).json(expenses);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});
//Get All expenses of a Team
app.get("/getTeamExpenses", async (req, res) => {
    const { team } = req.query;
  
    try {
      const expenses = await Expense.find({ team });
      res.json(expenses);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

// Add new expense
app.post("/newExpenses", async (req, res) => {
    const { uid, mail,team, description, amount, remarks } = req.body;

    try {
        const expense = new Expense({
            uid,
            mail,
            team,
            description,
            amount,
            remarks,
        });

        await expense.save();
        res.status(201).json({ message: "Expense added", expense }); //returning new expenses
    } catch (err) {
        res.status(500).json({ error: "Failed to add expense at backend" });
    }
});

//Update Expense details
app.put("/updateExpenses", async (req, res) => {
    const { _id, description, amount, remarks, status } = req.body;

    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            _id,
            {
                description,
                amount,
                remarks,
                updatedAt: new Date(),
                status,
            },
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.json(updatedExpense);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//Fetch teams (i need fetching all teams & checking also)
app.get("/teams", async (req, res) => {
    try {
        const users = await User.find({}, "roles");

        const allTeams = [
            ...new Set(users.flatMap((user) => user.roles.map((r) => r.team)))
        ];

        res.status(200).json(allTeams);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch teams from MongoDB" });
    }
});

//Check unique email
app.get("/check-email", async (req, res) => {
    const { email } = req.query;

    try {
        const user = await User.findOne({ email });

        if (user) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

//Check Role
app.get("/check-role", async (req, res) => {
    const { user: uid } = req.query;

    try {
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ roles: user.roles }); // array of { team, role }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user roles" });
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
