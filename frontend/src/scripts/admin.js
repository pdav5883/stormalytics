import $ from "jquery"
import { initNavbar, getValidAccessToken } from "blr-shared-frontend"
import { navbarConfig } from "../config/navbar-config.js"
import { API_URL } from "./shared.js"

// Global variable to store all matchups
let allMatchups = [];
let currentMode = 'create';

// Load matchups when page loads
$(function() {
  initNavbar(navbarConfig);
  
  // Setup mode selector
  document.getElementById('mode-select').addEventListener('change', handleModeChange);
  
  // Setup matchup selector
  document.getElementById('matchup-select').addEventListener('change', handleMatchupSelection);
  
  // Setup matchup form submission
  document.getElementById('matchup-form').addEventListener('submit', handleMatchupSubmission);
  
  // Set today's date as default
  document.getElementById('date').valueAsDate = new Date();
  
  // Load all matchups for edit mode
  fetchAllMatchups();
});


// Function to fetch all matchups from API
async function fetchAllMatchups() {
  try {
    const response = await fetch(API_URL.matchups);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    allMatchups = data.matchups || [];
    populateMatchupSelector();
  } catch (error) {
    console.error('Error fetching matchups:', error);
  }
}

// Function to populate matchup selector dropdown
function populateMatchupSelector() {
  const matchupSelect = document.getElementById('matchup-select');
  
  if (allMatchups.length === 0) {
    matchupSelect.innerHTML = '<option value="">No matchups available</option>';
    return;
  }
  
  // Sort matchups by date (most recent first)
  const sortedMatchups = [...allMatchups].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  // Create option elements
  matchupSelect.innerHTML = '<option value="">Select a matchup...</option>';
  sortedMatchups.forEach((matchup, index) => {
    const winnerRank = matchup.winner_rank ? `#${matchup.winner_rank} ` : '';
    const loserRank = matchup.loser_rank ? `#${matchup.loser_rank} ` : '';
    const displayText = `${matchup.date} - ${winnerRank}${matchup.winner} over ${loserRank}${matchup.loser} (${matchup.sport})`;
    const option = document.createElement('option');
    option.value = index;
    option.textContent = displayText;
    matchupSelect.appendChild(option);
  });
}

// Function to handle mode change
function handleModeChange(e) {
  currentMode = e.target.value;
  const matchupSelectorContainer = document.getElementById('matchup-selector-container');
  const pageTitle = document.getElementById('page-title');
  const submitText = document.getElementById('submit-text');
  const form = document.getElementById('matchup-form');
  
  if (currentMode === 'edit') {
    // Show matchup selector
    matchupSelectorContainer.style.display = 'block';
    pageTitle.textContent = 'Edit Verdict';
    submitText.textContent = 'Update Matchup';
    
    // Clear form
    form.reset();
  } else {
    // Hide matchup selector
    matchupSelectorContainer.style.display = 'none';
    pageTitle.textContent = 'Create New Verdict';
    submitText.textContent = 'Submit Matchup';
    
    // Clear form
    form.reset();
    document.getElementById('date').valueAsDate = new Date();
  }
}

// Function to handle matchup selection for editing
function handleMatchupSelection(e) {
  const selectedIndex = e.target.value;
  
  if (selectedIndex === '') {
    // Clear form
    document.getElementById('matchup-form').reset();
    return;
  }
  
  const matchup = allMatchups[selectedIndex];
  
  // Populate form with matchup data
  document.getElementById('sport-select').value = matchup.sport;
  document.getElementById('date').value = matchup.date;
  document.getElementById('winner').value = matchup.winner;
  document.getElementById('loser').value = matchup.loser;
  document.getElementById('winner_rank').value = matchup.winner_rank || '';
  document.getElementById('loser_rank').value = matchup.loser_rank || '';
  document.getElementById('upset_score').value = matchup.upset_score;
  document.getElementById('impact_score').value = matchup.impact_score;
  document.getElementById('excitement_score').value = matchup.excitement_score;
  document.getElementById('upset_rationale').value = matchup.upset_rationale;
  document.getElementById('impact_rationale').value = matchup.impact_rationale;
  document.getElementById('excitement_rationale').value = matchup.excitement_rationale;
  document.getElementById('overall_discussion').value = matchup.overall_discussion;
}

// Function to handle matchup form submission
async function handleMatchupSubmission(e) {
  e.preventDefault();
  
  const submitBtn = document.querySelector('button[type="submit"]');
  const submitText = document.getElementById('submit-text');
  const submitSpinner = document.getElementById('submit-spinner');
  const alertContainer = document.getElementById('alert-container');
  
  // Show loading state
  submitBtn.disabled = true;
  const originalText = submitText.textContent;
  submitText.textContent = currentMode === 'edit' ? 'Updating...' : 'Submitting...';
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
      } else if (value !== '') {
        matchupData[key] = value;
      }
    }
    
    // Add sport field from dropdown
    matchupData['sport'] = document.getElementById('sport-select').value;
    
    // Determine HTTP method based on mode
    const method = currentMode === 'edit' ? 'PATCH' : 'POST';
    
    // Get valid access token
    const accessToken = await getValidAccessToken();
    
    // Submit to API
    const response = await fetch(API_URL.matchups, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'authorization': accessToken
      },
      body: JSON.stringify(matchupData)
    });
    
    if (response.ok) {
      // Success
      const successMessage = currentMode === 'edit' ? 'Matchup updated successfully.' : 'Matchup submitted successfully.';
      alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success!</strong> ${successMessage}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
      
      // Refresh matchups list
      await fetchAllMatchups();
      
      if (currentMode === 'create') {
        // Reset form for create mode
        e.target.reset();
        document.getElementById('date').valueAsDate = new Date();
      }
      
    } else {
      // Handle 403 Forbidden with custom message
      if (response.status === 403) {
        throw new Error('You must be logged in as a BLR admin');
      }
      
      // Try to parse error response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response might not be JSON
      }
      
      throw new Error(errorMessage);
    }
    
  } catch (error) {
    console.error('Error submitting matchup:', error);
    alertContainer.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error!</strong> Failed to ${currentMode === 'edit' ? 'update' : 'submit'} matchup: ${error.message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitText.textContent = originalText;
    submitSpinner.classList.add('d-none');
  }
}

