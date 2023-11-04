const mongoose = require('mongoose');

const DB_URL = 'mongodb://localhost:27017/attendance';

// Define your Mongoose models here (same as in server.js)
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
    date: String,
    status: String
});

const SubjectSchema = new Schema({
    subjectID: String,
    attendance: [AttendanceSchema]
});

const StudentSchema = new Schema({
    username: String,
    subjects: [SubjectSchema]
});

const Student = mongoose.model('Student', StudentSchema,'studatten');

const seedData = [
    {
        username: '22BCE100',
        subjects: [
            { subjectID: 'Math100', attendance: [] },
            { subjectID: 'Physics101', attendance: [] }

        ]
    },
];

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB via Mongoose.');


        // Insert seed data
        await Student.insertMany(seedData);

        console.log('Data seeded successfully!');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
