const mongoose = require('mongoose');

const DB_URL = 'mongodb+srv://meetgoti07:Itsmg.07@cluster0.nr24cb3.mongodb.net/attendance';

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
            { subjectID: 'Ds101', attendance: [] },
            { subjectID: 'DE101', attendance: [] },

        ]
    },
    {
        username: '22BCE101',
        subjects: [
            { subjectID: 'Math100', attendance: [] },
            { subjectID: 'Ds101', attendance: [] },
            { subjectID: 'DE101', attendance: [] },

        ]
    },
    {
        username: '22BCE102',
        subjects: [
            { subjectID: 'Math100', attendance: [] },
            { subjectID: 'Ds101', attendance: [] },
            { subjectID: 'DE101', attendance: [] },

        ]
    },
    {
        username: '22BCE103',
        subjects: [
            { subjectID: 'Math100', attendance: [] },
            { subjectID: 'Ds101', attendance: [] },
            { subjectID: 'DE101', attendance: [] },

        ]
    },
    {
        username: '22BCE104',
        subjects: [
            { subjectID: 'Math100', attendance: [] },
            { subjectID: 'Ds101', attendance: [] },
            { subjectID: 'DE101', attendance: [] },

        ]
    },
    {
        username: '22BCE105',
        subjects: [
            { subjectID: 'Math100', attendance: [] },
            { subjectID: 'Ds101', attendance: [] },
            { subjectID: 'DE101', attendance: [] },

        ]
    },
    {
        username: '22BCE106',
        subjects: [
            { subjectID: 'Math100', attendance: [] },
            { subjectID: 'Ds101', attendance: [] },
            { subjectID: 'DE101', attendance: [] },

        ]
    },
    {
        username: '22BCE107',
        subjects: [
            { subjectID: 'Math100', attendance: [] },
            { subjectID: 'Ds101', attendance: [] },
            { subjectID: 'DE101', attendance: [] },

        ]
    },
    {
        username: '22BCE108',
        subjects: [
            { subjectID: 'Math100', attendance: [] },
            { subjectID: 'Ds101', attendance: [] },
            { subjectID: 'DE101', attendance: [] },

        ]
    },
    {
        username: '22BCE109',
        subjects: [
            { subjectID: 'Math100', attendance: [] },
            { subjectID: 'Ds101', attendance: [] },
            { subjectID: 'DE101', attendance: [] },

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
