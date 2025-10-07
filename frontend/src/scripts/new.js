import $ from "jquery"
import { initNavbar } from "blr-shared-frontend"
import { navbarConfig } from "../config/navbar-config.js"
import { API_ENDPOINT } from "./shared.js"

// Load matchups when page loads (only on index page)
$(function() {
  initNavbar(navbarConfig);
  
  // Setup matchup form submission (only on new.html page)
  document.getElementById('matchup-form').addEventListener('submit', handleMatchupSubmission);
  
  // Set today's date as default
  document.getElementById('date').valueAsDate = new Date();
});


// Function to handle matchup form submission
async function handleMatchupSubmission(e) {
  e.preventDefault();
  
  const submitBtn = document.querySelector('button[type="submit"]');
  const submitText = document.getElementById('submit-text');
  const submitSpinner = document.getElementById('submit-spinner');
  const alertContainer = document.getElementById('alert-container');
  
  // Show loading state
  submitBtn.disabled = true;
  submitText.textContent = 'Submitting...';
  submitSpinner.classList.remove('d-none');
  
  // Clear previous alerts
  alertContainer.innerHTML = '';
  
  try {
    // Get form data
    const formData = new FormData(e.target);
    const matchupData = {};
    
    // Convert form data to object
    for (let [key, value] of formData.entries()) {
      if (key === 'upset_score' || key === 'impact_score' || key === 'excitement_score') {
        matchupData[key] = parseFloat(value);
      } else {
        matchupData[key] = value;
      }
    }
    
    // Add sport field from dropdown
    matchupData['sport'] = document.getElementById('sport-select').value;
    
    // Submit to API
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token') // Assuming token is stored
      },
      body: JSON.stringify(matchupData)
    });
    
    if (response.ok) {
      // Success
      alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success!</strong> Matchup submitted successfully.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
      
      // Reset form
      e.target.reset();
      
      // Set today's date as default
      document.getElementById('date').valueAsDate = new Date();
      
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('Error submitting matchup:', error);
    alertContainer.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error!</strong> Failed to submit matchup: ${error.message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitText.textContent = 'Submit Matchup';
    submitSpinner.classList.add('d-none');
  }
}
