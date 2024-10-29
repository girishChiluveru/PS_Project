const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');  // Import UUID generator
const PORT = 3000;

// Static middleware for 'public' and root folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));  // Added to serve files from the root
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));

app.set('view engine', 'ejs');

const imagesDirectory = path.join(__dirname, 'photos');
if (!fs.existsSync(imagesDirectory)) {
    fs.mkdirSync(imagesDirectory);
}
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Ensure index.html is in 'public'
});

const childrenNames = [];

app.post('/login', (req, res) => {
    const childName = req.body.childName;
    const sessionId = uuidv4();  // Generate unique session ID

    // Add child name if it doesn't exist
    if (!childrenNames.includes(childName)) {
        childrenNames.push(childName);
    }

    // Define the directory path for storing images
    const childDirectory = path.join(__dirname, 'photos', childName);
    const sessionDirectory = path.join(childDirectory, sessionId);

    // Create directories if they don't exist
    if (!fs.existsSync(childDirectory)) {
        fs.mkdirSync(childDirectory, { recursive: true });
    }
    fs.mkdirSync(sessionDirectory, { recursive: true });

    // Send a response to store `childName` and `sessionId` in the client’s localStorage
    res.send(`
        <script>
            localStorage.setItem('childName', '${childName}');
            localStorage.setItem('sessionId', '${sessionId}');
            alert("Login successful! Your session ID is ${sessionId}");
            window.location.href = "/childquiz";
        </script>
    `);
});

// Handle image uploads
app.post('/photos', (req, res) => {
    const { image, filename, childName, sessionId } = req.body;

    if (!childName || !sessionId) {
        return res.status(400).json({ error: 'childName or sessionId is missing' });
    }

    // Define the directory path for the current session
    const sessionDirectory = path.join(__dirname, 'photos', childName, sessionId);

    if (!fs.existsSync(sessionDirectory)) {
        return res.status(400).json({ error: 'Session directory does not exist' });
    }

    // Decode base64 image and save it to the correct folder
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(sessionDirectory, filename);

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error("Error saving image:", err);
            return res.status(500).json({ error: 'Error saving image' });
        }
        res.json({ success: true, message: 'Image saved successfully' });
    });
});

app.get('/childquiz', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

app.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'report.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
