const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');  // Import Mongoose
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');  // Import UUID generator
const Report = require('./models/report');  // Import the Mongoose model
const PORT = 3000;

// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/dyslexia_reports', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));

app.set('view engine', 'ejs');

// Directory setup
const imagesDirectory = path.join(__dirname, 'photos');
if (!fs.existsSync(imagesDirectory)) {
    fs.mkdirSync(imagesDirectory);
}

// Store child session info
const childrenNames = [];

// Main login endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login and session creation endpoint
app.post('/login', (req, res) => {
    const childName = req.body.childName;
    const sessionId = uuidv4();  // Generate a unique session ID

    // Add child name if it doesn't exist
    if (!childrenNames.includes(childName)) {
        childrenNames.push(childName);
    }

    // Directory paths for child and session
    const childDirectory = path.join(imagesDirectory, childName);
    const sessionDirectory = path.join(childDirectory, sessionId);

    // Create directories if they don't exist
    if (!fs.existsSync(childDirectory)) fs.mkdirSync(childDirectory, { recursive: true });
    fs.mkdirSync(sessionDirectory, { recursive: true });

    // Send response to store `childName` and `sessionId` in client’s localStorage
    res.send(`
        <script>
            localStorage.setItem('childName', '${childName}');
            localStorage.setItem('sessionId', '${sessionId}');
            alert("Login successful! Your session ID is ${sessionId}");
            window.location.href = "/childquiz";
        </script>
    `);
});

// Endpoint for uploading images and saving to MongoDB
app.post('/photos', async (req, res) => {
    const { image, filename, childName, sessionId, emotions } = req.body;

    if (!childName || !sessionId) {
        return res.status(400).json({ error: 'childName or sessionId is missing' });
    }

    // Directory path for the current session
    const sessionDirectory = path.join(imagesDirectory, childName, sessionId);

    if (!fs.existsSync(sessionDirectory)) {
        return res.status(400).json({ error: 'Session directory does not exist' });
    }

    // Decode base64 image and save to file
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(sessionDirectory, filename);

    fs.writeFile(filePath, base64Data, 'base64', async (err) => {
        if (err) {
            console.error("Error saving image:", err);
            return res.status(500).json({ error: 'Error saving image' });
        }

        try {
            // Define image entry with emotions
            const imageEntry = {
                imgpath: filePath,
                emotions: emotions,
                max_emotion_img: {
                    emotion: emotions.max_emotion,
                    score: emotions.max_score
                }
            };

            // Update or create a new session report in MongoDB
            await Report.updateOne(
                { childname: childName, sessionid: sessionId },
                {
                    $setOnInsert: { childname: childName, sessionid: sessionId, sessiondate: new Date() },
                    $push: {
                        "questionemotions": {
                            qno: req.body.qno,
                            Screenshotpath: filePath,
                            images: [imageEntry]
                        }
                    }
                },
                { upsert: true }
            );

            res.json({ success: true, message: 'Image saved and data stored in MongoDB' });
        } catch (dbError) {
            console.error("Database error:", dbError);
            res.status(500).json({ error: 'Error saving data to MongoDB' });
        }
    });
});

// Endpoint to get quiz view
app.get('/childquiz', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

// Endpoint to get report view
app.get('/reports', async (req, res) => {
    try {
        const reports = await Report.find();  // Fetch all reports
        res.json(reports);  // Send the reports as JSON data
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: 'Error fetching reports from MongoDB' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
