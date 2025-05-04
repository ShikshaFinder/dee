# Doctor-Patient Management System

A modern web application for managing patient records, analyzing symptoms, and tracking medical data.

## Features

- Patient record management (add, edit, delete)
- Symptom analysis and disease prediction
- Interactive dashboard with charts
- Data export (CSV, PDF)
- Responsive design with Bootstrap
- RESTful API backend

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd doctor-patient-management
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
doctor-patient-management/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── js/
│       ├── main.js
│       ├── DoctorPanel.js
│       ├── PatientHistory.js
│       ├── Dashboard.js
│       ├── SymptomAnalysis.js
│       └── utils.js
├── server.js
├── package.json
└── README.md
```

## Usage

1. **Doctor Panel**
   - Add new patient records
   - Fill in patient details, symptoms, and treatment information
   - Save records to the database

2. **Patient History**
   - View all patient records
   - Search and filter records
   - Edit or delete existing records
   - Export data in CSV or PDF format

3. **Dashboard**
   - View interactive charts and statistics
   - Analyze patient data trends
   - Monitor disease patterns

4. **Symptom Analysis**
   - Enter symptoms to get analysis
   - View matching diseases and treatments
   - Get severity distribution and healing duration statistics

## API Endpoints

- `GET /api/records` - Get all patient records
- `POST /api/records` - Add a new patient record
- `PUT /api/records/:id` - Update an existing record
- `DELETE /api/records/:id` - Delete a record

## Development

For development with auto-reload:
```bash
npm run dev
```

## License

MIT 