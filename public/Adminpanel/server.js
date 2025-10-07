






const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Enable JSON parsing for POST/DELETE requests

// Path to your shared folder
const folderPath = '\\\\192.168.140.154\\share\\54321'; // Shared folder path

// Ensure the upload folder exists and has write permissions
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
}

// Serve static files from the shared folder
const staticFolderPath = path.join(folderPath.replace(/\\/g, '/'));
app.use('/images', express.static(staticFolderPath));

// Define storage location
const uploadFolder = folderPath;  // Shared folder path

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the folder exists
        if (!fs.existsSync(uploadFolder)) {
            fs.mkdirSync(uploadFolder, { recursive: true });
        }
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        // Generate a unique file name using the current timestamp and the original extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// File upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }
    res.json({ message: "File uploaded successfully!" });
});





// Endpoint to get image files from the shared folder
app.get('/images-list', (req, res) => {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading shared folder:', err);
            return res.status(500).send('Error reading shared folder');
        }

        // Filter for image files based on extensions
        const imageFiles = files.filter(file => ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase()));

        // Generate URLs for each image (using the /images URL path to serve images)
        const imageUrls = imageFiles.map(file => `/images/${file}`);

        // Return the image URLs as JSON
        res.json(imageUrls);
    });
});

// Endpoint to handle image deletion
app.delete('/delete-image', (req, res) => {
    console.log("Received delete request body:", req.body); // Debugging log

    if (!req.body || !req.body.imageName) {
        console.error("Error: No imageName received.");
        return res.status(400).json({ error: "Image name is required" });
    }

    const { imageName } = req.body;
    const imagePath = path.join(folderPath, imageName);

    // Check if file exists
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`File not found: ${imagePath}`);
            return res.status(404).json({ error: "File not found" });
        }

        // Delete the file
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(`Error deleting image: ${err}`);
                return res.status(500).json({ error: "Error deleting image" });
            }
            console.log(`Successfully deleted: ${imagePath}`);
            res.json({ message: "Image deleted successfully" });
        });
    });
});















// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
