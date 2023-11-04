const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/auth', authRoutes);

// MongoDB URL
const DB_URL = 'mongodb+srv://meetgoti07:Itsmg.07@cluster0.nr24cb3.mongodb.net/attendance';

// Connect to MongoDB using Mongoose
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.log('Error connecting to MongoDB:', error));

// Student Schema and Model
const StudentSchema = new mongoose.Schema({
    username: String,
    subjects: [{
        subjectID: String,
        attendance: [{
            date: Date,
            status: String
        }]
    }]
});

const Student = mongoose.model('Student', StudentSchema, 'studattens')

app.post('/recordAttendance', async (req, res) => {
    try {
        const { username, subjectID, status } = req.body;

        const student = await Student.findOne({ username, 'subjects.subjectID': subjectID });

        if (student) {
            const subject = student.subjects.find(sub => sub.subjectID === subjectID);
            subject.attendance.push({ date: new Date().toISOString(), status });

            await student.save();

            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Student or subject not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.get('/getAttendance/:username', async (req, res) => {
    try {
        const student = await Student.findOne({ username: req.params.username });
        console.log(student);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });

    }
});

app.get('/getSubjectAttendance/:username/:subjectID', async (req, res) => {
    try {
        const student = await Student.findOne({ username: req.params.username });
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const subject = student.subjects.find(s => s.subjectID === req.params.subjectID);
        
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        res.json(subject.attendance);
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Assuming you want to use the port 3010 for the merged server
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
