const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB URL for the first part of the code
const DB_URL = 'mongodb+srv://meetgoti07:Itsmg.07@cluster0.nr24cb3.mongodb.net/attendance';

// Connect to MongoDB using Mongoose
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.log('Error connecting to MongoDB:', error));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema for storing face descriptors in MongoDB
const faceDescriptorSchema = new mongoose.Schema({
  username: String,
  facedescriptor: [Number],
});
const FaceDescriptor = mongoose.model('FaceDescriptor', faceDescriptorSchema, 'users');

// Set up the storage for uploaded photos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

// Define Student Schema and Model
const StudentSchema = new mongoose.Schema({
  username: String,
  subjects: [{
    subjectID: String,
    attendance: [{
      date: Date,
      status: String,
    }],
  }],
});

const Student = mongoose.model('Student', StudentSchema, 'studattens');

// Initialize Face-API.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Endpoint to fetch the stored face descriptor by username
app.get('/get-face-descriptor/:username', async (req, res) => {
  const username = req.params.username;
  FaceDescriptor.findOne({ username }, (err, faceDesc) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching face descriptor' });
    }

    if (!faceDesc) {
      return res.status(404).json({ success: false, message: 'Face descriptor not found' });
    }

    const savedFaceDescriptor = faceDesc.facedescriptor;
    res.json({ success: true, faceDescriptor: savedFaceDescriptor });
  });
});

// Endpoint to receive and verify a photo
app.post('/verify-face', upload.single('photo'), async (req, res) => {
  const uploadedPhoto = req.file;
  if (!uploadedPhoto) {
    return res.status(400).json({ success: false, message: 'No photo uploaded' });
  }

  // Read the uploaded photo data
  const photoData = uploadedPhoto.buffer;

  const username = req.body.username; // Extract the username from the request

  try {
    // Fetch the saved face descriptor from MongoDB by username
    const faceDesc = await FaceDescriptor.findOne({ username });

    if (!faceDesc) {
      return res.status(404).json({ success: false, message: 'Face descriptor not found' });
    }

    // Load the photo and detect faces using face-api.js
    const photo = await canvas.loadImage(photoData);
    const detections = await faceapi.detectAllFaces(photo)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length === 0) {
      return res.status(401).json({ success: false, message: 'No faces detected in the photo' });
    }

    const detectedFaceDescriptor = detections[0].descriptor;
    const savedFaceDescriptor = faceDesc.facedescriptor;

    // Calculate the Euclidean distance between the detected face descriptor and the saved descriptor
    const distance = faceapi.euclideanDistance(savedFaceDescriptor, detectedFaceDescriptor);

    // You can set a threshold to determine if the face is a match or not
    const threshold = 0.6;

    if (distance < threshold) {
      return res.json({ success: true, message: 'Face verified successfully' });
    } else {
      return res.status(401).json({ success: false, message: 'Face verification failed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error during face verification' });
  }
});

// Student-related routes
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

// Port
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
