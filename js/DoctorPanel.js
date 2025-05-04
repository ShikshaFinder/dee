class DoctorPanel {
  constructor() {
    this.form = document.getElementById("patient-form");
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Get form data
    const formData = {
      patientName: document.getElementById("patient-name").value,
      contactInfo: document.getElementById("contact-info").value,
      visitDate: document.getElementById("visit-date").value,
      symptoms: Array.from(
        document.getElementById("symptoms").selectedOptions
      ).map((option) => option.value),
      disease: document.getElementById("disease").value,
      severity: document.getElementById("severity").value,
      diagnosis: document.getElementById("diagnosis").value,
      treatment: document.getElementById("treatment").value,
      healingDuration: parseInt(
        document.getElementById("healing-duration").value
      ),
      fees: parseFloat(document.getElementById("fees").value),
      timestamp: new Date().toISOString(),
    };

    try {
      // Save to API
      await API.saveRecord(formData);

      // Reset form
      this.form.reset();

      // Show success message
      this.showSuccessMessage();
    } catch (error) {
      this.showErrorMessage("Error saving patient record. Please try again.");
    }
  }

  showSuccessMessage() {
    const message = document.createElement("div");
    message.className = "alert alert-success mt-3";
    message.textContent = "Patient record saved successfully!";

    this.form.appendChild(message);

    // Remove message after 3 seconds
    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  showErrorMessage(text) {
    const message = document.createElement("div");
    message.className = "alert alert-danger mt-3";
    message.textContent = text;

    this.form.appendChild(message);

    // Remove message after 3 seconds
    setTimeout(() => {
      message.remove();
    }, 3000);
  }
}

// Initialize DoctorPanel when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DoctorPanel();
});
