'use strict';
import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from './middleware/authenticate.js';
import dotenv from 'dotenv';
import createToken from "./service/authenticate.service.js"
import { Doctors } from './models/doctors.model.js'
import { Patients } from './models/patients.model.js'
import { Appointments } from './models/appointment.model.js'
import bcrypt from "bcrypt"
import { validateAppointmentCredentails, validateLoginCredentails, validateRegisterCredentials } from './service/validate.service.js';
import cors from "cors";
import logger from './middleware/logging.js';


dotenv.config();
const port = 5000;
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json())

app.post('/login', logger, async (req, res) => {
    let body = req.body;
    console.log(body);
    if (!validateLoginCredentails(body)) {
        res.status(401).json({ error: "Wrong Credentials" });
    }

    let user;
    if (body.doctor) {
        user = await Doctors.findOne({ email: body.email });
    } else {
        user = await Patients.findOne({ email: body.email });
    }
    if (user === null) {
        res.status(401).json({ error: "Wrong Credentials" });
    }

    console.log({ sub: user._id, role: body.doctor ? "doctor" : "patient" })
    if (bcrypt.compare(body.password, user.password)) {
        let token = await createToken({ sub: user._id, role: body.doctor ? "doctor" : "patient" });
        res.status(200).json({ success: true, token });
    } else {
        res.status(401).json({ error: "Wrong Credentials" });
    }
});

app.post('/register', logger, async (req, res) => {
    const body = req.body;
    console.log("body", body);
    if (!validateRegisterCredentials(body)) {
        res.status(401).json({ error: "Wrong Credentials" });
    }

    let user;

    try {
        if (body.doctor) {
            user = await new Doctors(body).save();
        } else {
            user = await new Patients(body).save();
        }

        console.log("user", user);

        const token = createToken({ sub: user._id, role: body.doctor ? "doctor" : "patient" });

        res.status(201).json({
            success: true, token, user: {
                "id": user.id,
                "name": user.name,
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
});

app.get('/doctors', logger, async (_req, res) => {
    const user = await Doctors.find();
    if (user.length !== 0) {
        res.status(200).json({ "success": true, user: user })
    } else {
        res.status(404).json({ "error": "No doctors to fetch" })
    }
});

app.get('/doctor/:id', logger, async (req, res) => {
    const id = { id: req.params["id"] };
    const user = await Doctors.findOne({ id });

    if (user !== null) {
        res.status(200).json({ "success": true, user: user })
    } else {
        res.status(404).json({ "error": "404 Not Found" })
    }
});

app.get('/patients', logger, async (_req, res) => {
    const user = await Patients.find();
    if (user.length !== 0) {
        res.status(200).json({ "success": true, user: user })
    } else {
        res.status(404).json({ "error": "no patients to fetch" })
    }
});

app.get('/patient/:id', logger, async (req, res) => {
    const id = req.params["id"];
    const user = await Patients.findById({ _id: id });

    if (user !== null) {
        res.status(200).json({ "success": true, user: user })
    } else {
        res.status(404).json({ "error": "404 Not Found" })
    }
});


app.get('/appointments', authenticateToken, logger, async (req, res) => {
    try {
        let user = await new Appointments.find();

        res.status(201).json({
            success: true, user: {
                id: user._id,
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
});

app.post('/appointment', authenticateToken, logger, async (req, res) => {
    const body = req.body;
    console.log(body);
    if (!validateAppointmentCredentails(body)) {
        res.status(401).json({ error: "Wrong Credentials" });
    }


    try {
        let user = await new Appointments(req.body).save();

        res.status(201).json({
            success: true, user: {
                id: user._id,
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
});

app.delete('/appointment/:id', authenticateToken, async (req, res) => {
    const id = req.params["id"];

    try {
        let user = await Appointments.findByIdAndDelete(id)
        res.status(200).json({
            success: true
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

app.put('/appointment/:id', authenticateToken, async (req, res) => {
    const body = req.body;
    console.log(body);
    if (!validateAppointmentCredentails(body)) {
        res.status(401).json({ error: "Wrong Credentials" });
    }

    try {
        const id = req.params["id"];
        let user = await Appointments.findByIdAndUpdate(id, body)
        res.status(201).json({
            success: true, user: {
                id: user._id,
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }

});

app.get('/appointment/:id', authenticateToken, async (req, res) => {
    const id = { id: req.params["id"] };
    const user = await Appointments.findOne({ id });

    if (user !== null) {
        res.status(200).json({ "success": true, data: user })
    } else {
        res.status(404).json({ "error": "404 Not Found" })
    }
});

mongoose.connect("mongodb://127.0.0.1:27017/hospital").then(() => {
    console.log("connected to the database")

    app.listen(port, () => {
        console.log("server is running on port ", port);
    })
})

