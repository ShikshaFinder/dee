class SymptomAnalysis {
  constructor() {
    this.warningsContainer = document.getElementById("ai-warnings");
    this.analysisContainer = document.getElementById("patient-analysis");
    this.symptomsInput = document.getElementById('symptoms-input');
    this.analysisResult = document.getElementById('analysis-result');
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.symptomsInput.addEventListener('input', () => this.analyzeSymptoms());
  }

  async analyzeSymptoms() {
    const symptoms = this.symptomsInput.value.toLowerCase().split(',').map(s => s.trim());
    
    if (symptoms.length === 0 || symptoms[0] === '') {
      this.analysisResult.innerHTML = '<div class="alert alert-info">Please enter symptoms separated by commas.</div>';
      return;
    }

    try {
      const records = await API.getRecords();
      const matchingRecords = this.findMatchingRecords(records, symptoms);
      this.displayAnalysis(matchingRecords, symptoms);
    } catch (error) {
      this.analysisResult.innerHTML = '<div class="alert alert-danger">Error analyzing symptoms. Please try again.</div>';
    }
  }

  findMatchingRecords(records, symptoms) {
    return records.filter(record => {
      const recordSymptoms = record.symptoms.map(s => s.toLowerCase());
      return symptoms.some(symptom => 
        recordSymptoms.some(recordSymptom => recordSymptom.includes(symptom))
      );
    });
  }

  displayAnalysis(matchingRecords, symptoms) {
    if (matchingRecords.length === 0) {
      this.analysisResult.innerHTML = '<div class="alert alert-warning">No matching records found for these symptoms.</div>';
      return;
    }

    // Group records by disease
    const diseaseGroups = this.groupByDisease(matchingRecords);
    
    // Calculate statistics
    const stats = this.calculateStatistics(diseaseGroups);

    // Display results
    let html = '<div class="card">';
    html += '<div class="card-header"><h5 class="mb-0">Analysis Results</h5></div>';
    html += '<div class="card-body">';
    
    // Display most common diseases
    html += '<h6>Most Common Diseases:</h6>';
    html += '<ul class="list-group mb-3">';
    stats.mostCommonDiseases.forEach(disease => {
      html += `<li class="list-group-item d-flex justify-content-between align-items-center">
        ${disease.name}
        <span class="badge bg-primary rounded-pill">${disease.count} cases</span>
      </li>`;
    });
    html += '</ul>';

    // Display average healing duration
    html += `<h6>Average Healing Duration: ${stats.averageHealingDuration.toFixed(1)} days</h6>`;

    // Display severity distribution
    html += '<h6 class="mt-3">Severity Distribution:</h6>';
    html += '<div class="progress mb-3">';
    Object.entries(stats.severityDistribution).forEach(([severity, count]) => {
      const percentage = (count / matchingRecords.length) * 100;
      html += `<div class="progress-bar" role="progressbar" style="width: ${percentage}%" 
        aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
        ${severity}: ${count} (${percentage.toFixed(1)}%)
      </div>`;
    });
    html += '</div>';

    // Display suggested treatments
    html += '<h6 class="mt-3">Suggested Treatments:</h6>';
    html += '<ul class="list-group">';
    stats.suggestedTreatments.forEach(treatment => {
      html += `<li class="list-group-item">${treatment}</li>`;
    });
    html += '</ul>';

    html += '</div></div>';
    this.analysisResult.innerHTML = html;
  }

  groupByDisease(records) {
    const groups = {};
    records.forEach(record => {
      if (!groups[record.disease]) {
        groups[record.disease] = [];
      }
      groups[record.disease].push(record);
    });
    return groups;
  }

  calculateStatistics(diseaseGroups) {
    const stats = {
      mostCommonDiseases: [],
      averageHealingDuration: 0,
      severityDistribution: {},
      suggestedTreatments: new Set()
    };

    // Calculate most common diseases
    Object.entries(diseaseGroups).forEach(([disease, records]) => {
      stats.mostCommonDiseases.push({
        name: disease,
        count: records.length
      });
    });
    stats.mostCommonDiseases.sort((a, b) => b.count - a.count);

    // Calculate average healing duration
    const allRecords = Object.values(diseaseGroups).flat();
    const totalDuration = allRecords.reduce((sum, record) => sum + record.healingDuration, 0);
    stats.averageHealingDuration = totalDuration / allRecords.length;

    // Calculate severity distribution
    allRecords.forEach(record => {
      stats.severityDistribution[record.severity] = (stats.severityDistribution[record.severity] || 0) + 1;
    });

    // Collect suggested treatments
    allRecords.forEach(record => {
      stats.suggestedTreatments.add(record.treatment);
    });
    stats.suggestedTreatments = Array.from(stats.suggestedTreatments);

    return stats;
  }

  analyzeRecords() {
    const records = Storage.get("patientRecords") || [];
    const patientGroups = this.groupRecordsByPatient(records);
    this.displayAnalysis(patientGroups);
  }

  groupRecordsByPatient(records) {
    const groups = {};
    records.forEach((record) => {
      if (!groups[record.patientName]) {
        groups[record.patientName] = [];
      }
      groups[record.patientName].push(record);
    });
    return groups;
  }

  displayAnalysis(patientGroups) {
    this.analysisContainer.innerHTML = "";
    this.warningsContainer.innerHTML = "";

    Object.entries(patientGroups).forEach(([patientName, records]) => {
      const analysis = this.analyzePatientRecords(records);
      this.createPatientAnalysisElement(patientName, records, analysis);
    });
  }

  analyzePatientRecords(records) {
    const analysis = {
      repeatedSymptoms: this.findRepeatedSymptoms(records),
      timeGaps: this.calculateTimeGaps(records),
      warnings: [],
    };

    // Check for repeated symptoms within short intervals
    analysis.repeatedSymptoms.forEach(
      ({ symptom, count, lastOccurrence, firstOccurrence }) => {
        const daysBetween = daysBetween(firstOccurrence, lastOccurrence);
        if (count > 3 && daysBetween < 30) {
          analysis.warnings.push({
            type: "recurring_symptom",
            message: `Warning: ${symptom} has occurred ${count} times within ${daysBetween} days`,
            severity: "high",
          });
        }
      }
    );

    return analysis;
  }

  findRepeatedSymptoms(records) {
    const symptomCounts = {};
    records.forEach((record) => {
      record.symptoms.forEach((symptom) => {
        if (!symptomCounts[symptom]) {
          symptomCounts[symptom] = {
            count: 0,
            firstOccurrence: record.visitDate,
            lastOccurrence: record.visitDate,
          };
        }
        symptomCounts[symptom].count++;
        if (
          new Date(record.visitDate) >
          new Date(symptomCounts[symptom].lastOccurrence)
        ) {
          symptomCounts[symptom].lastOccurrence = record.visitDate;
        }
        if (
          new Date(record.visitDate) <
          new Date(symptomCounts[symptom].firstOccurrence)
        ) {
          symptomCounts[symptom].firstOccurrence = record.visitDate;
        }
      });
    });

    return Object.entries(symptomCounts)
      .map(([symptom, data]) => ({
        symptom,
        ...data,
      }))
      .filter((data) => data.count > 1);
  }

  calculateTimeGaps(records) {
    const sortedRecords = [...records].sort(
      (a, b) => new Date(a.visitDate) - new Date(b.visitDate)
    );

    const gaps = [];
    for (let i = 1; i < sortedRecords.length; i++) {
      const gap = daysBetween(
        sortedRecords[i - 1].visitDate,
        sortedRecords[i].visitDate
      );
      gaps.push(gap);
    }

    return gaps;
  }

  createPatientAnalysisElement(patientName, records, analysis) {
    const div = document.createElement("div");
    div.className = "patient-analysis-item";

    const symptomsList = this.getUniqueSymptoms(records).join(", ");
    const diseasesList = this.getUniqueDiseases(records).join(", ");

    div.innerHTML = `
            <h3>${patientName}</h3>
            <p><strong>Total Visits:</strong> ${records.length}</p>
            <p><strong>Unique Symptoms:</strong> ${symptomsList}</p>
            <p><strong>Diseases Treated:</strong> ${diseasesList}</p>
            <div class="warnings">
                ${analysis.warnings
                  .map(
                    (warning) => `
                    <div class="warning ${warning.severity}">
                        ${warning.message}
                    </div>
                `