document.addEventListener("DOMContentLoaded", () => {
  // Initialize components
  const doctorPanel = new DoctorPanel();
  const patientHistory = new PatientHistory();
  const symptomAnalysis = new SymptomAnalysis();
  const dashboard = new Dashboard();

  // Handle navigation
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all links and sections
      navLinks.forEach((l) => l.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      // Add active class to clicked link and corresponding section
      link.classList.add("active");
      const targetId = link.getAttribute("href").substring(1);
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Show doctor panel by default
  document.querySelector(".nav-link[href='#doctor-panel']").click();

  // Add export functionality
  const addExportButtons = () => {
    const patientHistorySection = document.getElementById("patient-history");
    const exportContainer = document.createElement("div");
    exportContainer.className = "export-buttons";
    exportContainer.innerHTML = `
            <button id="export-csv" class="export-btn">Export to CSV</button>
            <button id="export-pdf" class="export-btn">Export to PDF</button>
        `;
    patientHistorySection.insertBefore(
      exportContainer,
      patientHistorySection.firstChild
    );

    // Add event listeners for export buttons
    document.getElementById("export-csv").addEventListener("click", () => {
      const records = Storage.get("patientRecords") || [];
      exportToCSV(records, "patient_records.csv");
    });

    document.getElementById("export-pdf").addEventListener("click", () => {
      const records = Storage.get("patientRecords") || [];
      exportToPDF(records, "patient_records.pdf");
    });
  };

  // Add export buttons to the page
  addExportButtons();
});
