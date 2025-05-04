// API utility functions
const API = {
  // Get all records
  getRecords: async () => {
    try {
      const response = await fetch("http://localhost:3000/api/records");
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error fetching records:", error);
      return [];
    }
  },

  // Save new record
  saveRecord: async (record) => {
    try {
      const response = await fetch("http://localhost:3000/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error saving record:", error);
      throw error;
    }
  },

  // Update record
  updateRecord: async (id, record) => {
    try {
      const response = await fetch(`http://localhost:3000/api/records/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error updating record:", error);
      throw error;
    }
  },

  // Delete record
  deleteRecord: async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/records/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return true;
    } catch (error) {
      console.error("Error deleting record:", error);
      throw error;
    }
  },
};

// Date formatting utility
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Calculate days between two dates
const daysBetween = (date1, date2) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Export data to CSV
const exportToCSV = (data, filename) => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    data.map((row) => Object.values(row).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export data to PDF (using jsPDF library - you'll need to include it)
const exportToPDF = (data, filename) => {
  // This is a placeholder - you'll need to implement actual PDF generation
  console.log("PDF export functionality would be implemented here");
};

// Search utility
const searchRecords = (records, searchTerm) => {
  if (!searchTerm) return records;
  const term = searchTerm.toLowerCase();
  return records.filter(
    (record) =>
      record.patientName.toLowerCase().includes(term) ||
      record.disease.toLowerCase().includes(term)
  );
};

// Filter records by date range
const filterByDateRange = (records, startDate, endDate) => {
  if (!startDate && !endDate) return records;
  return records.filter((record) => {
    const recordDate = new Date(record.visitDate);
    if (startDate && recordDate < new Date(startDate)) return false;
    if (endDate && recordDate > new Date(endDate)) return false;
    return true;
  });
};
