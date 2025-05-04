const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "patientRecords.json");

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Get all patient records
app.get("/api/records", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error reading patient records" });
  }
});

// Add new patient record
app.post("/api/records", (req, res) => {
  try {
    const records = JSON.parse(fs.readFileSync(DATA_FILE));
    const newRecord = {
      ...req.body,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    records.push(newRecord);
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: "Error saving patient record" });
  }
});

// Update patient record
app.put("/api/records/:id", (req, res) => {
  try {
    const records = JSON.parse(fs.readFileSync(DATA_FILE));
    const index = records.findIndex((record) => record.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Record not found" });
    }
    records[index] = { ...records[index], ...req.body };
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
    res.json(records[index]);
  } catch (error) {
    res.status(500).json({ error: "Error updating patient record" });
  }
});

// Delete patient record
app.delete("/api/records/:id", (req, res) => {
  try {
    const records = JSON.parse(fs.readFileSync(DATA_FILE));
    const filteredRecords = records.filter(
      (record) => record.id !== req.params.id
    );
    fs.writeFileSync(DATA_FILE, JSON.stringify(filteredRecords, null, 2));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting patient record" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
