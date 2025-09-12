import "../styles/custom.css"
import $ from "jquery"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import { testMatchups } from "../test-data.js"

// Hardcoded endpoint - replace with your actual API endpoint
const API_ENDPOINT = 'https://your-api-endpoint.com/api/matchups';

// Test endpoint for development
const TEST_ENDPOINT = './test.json';

// Function to create a matchup card
function createMatchupCard(matchup) {
  const cardHtml = `
    <div class="col">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white text-center">
          <h6 class="mb-0">${matchup.matchup}</h6>
        </div>
        <div class="card-body">
          <div class="row text-center mb-3">
            <div class="col-6">
              <small class="text-muted">Upset Score</small>
              <div class="h5 text-warning">${matchup.upset_score}</div>
            </div>
            <div class="col-6">
              <small class="text-muted">Impact Score</small>
              <div class="h5 text-info">${matchup.impact_score}</div>
            </div>
          </div>
          <div class="row text-center mb-3">
            <div class="col-6">
              <small class="text-muted">Excitement</small>
              <div class="h5 text-success">${matchup.excitement_score}</div>
            </div>
            <div class="col-6">
              <small class="text-muted">Total Score</small>
              <div class="h5 text-primary fw-bold">${matchup.total_score}</div>
            </div>
          </div>
          <div class="text-center">
            <span class="badge ${getVerdictBadgeClass(matchup.verdict)} fs-6">${matchup.verdict}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  return cardHtml;
}

// Function to get badge class based on verdict
function getVerdictBadgeClass(verdict) {
  const verdictLower = verdict.toLowerCase();
  if (verdictLower.includes('high') || verdictLower.includes('must')) {
    return 'bg-danger';
  } else if (verdictLower.includes('medium') || verdictLower.includes('good')) {
    return 'bg-warning';
  } else if (verdictLower.includes('low') || verdictLower.includes('skip')) {
    return 'bg-secondary';
  } else {
    return 'bg-primary';
  }
}

// Function to load matchup data
async function loadMatchups() {
  try {
    // Use test data for development - change to API_ENDPOINT for production
    let matchups;
    
    // For development, use imported test data
    // For production, uncomment the fetch code below
    matchups = testMatchups;
    
    // Uncomment this block for production API:
    /*
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    matchups = await response.json();
    */
    
    const container = document.getElementById('matchup-cards');
    
    if (matchups && matchups.length > 0) {
      // Clear loading spinner
      container.innerHTML = '';
      
      // Create cards for each matchup
      matchups.forEach(matchup => {
        container.insertAdjacentHTML('beforeend', createMatchupCard(matchup));
      });
    } else {
      // Show no data message
      container.innerHTML = `
        <div class="col-12 text-center">
          <div class="alert alert-info">
            <h5>No matchups available</h5>
            <p class="mb-0">Check back later for new matchup data.</p>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading matchups:', error);
    const container = document.getElementById('matchup-cards');
    container.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-danger">
          <h5>Error Loading Data</h5>
          <p class="mb-0">Unable to load matchup data. Please try again later.</p>
          <small class="text-muted">Error: ${error.message}</small>
        </div>
      </div>
    `;
  }
}

// Load matchups when page loads (only on index page)
$(document).ready(function() {
  if (document.getElementById('matchup-cards')) {
    loadMatchups();
  }
});
