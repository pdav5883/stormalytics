import "../styles/custom.css"
import $ from "jquery"
import "bootstrap/dist/css/bootstrap.min.css"
import * as bootstrap from "bootstrap"

const API_ENDPOINT = 'https://' + SUB_ApiId + '.execute-api.us-east-1.amazonaws.com/matchups';

// Function to create a matchup card
function createMatchupCard(matchup) {
  const totalScore = calculateTotalScore(matchup);
  const verdict = determineVerdict(totalScore);
  const winnerRank = matchup.winner_rank ? `#${matchup.winner_rank}` : '';
  const loserRank = matchup.loser_rank ? `#${matchup.loser_rank}` : '';
  const year = matchup.date.split('-')[0];
  const matchupDisplay = `${winnerRank} ${matchup.winner} over ${loserRank} ${matchup.loser}`;
  
  
  const cardHtml = `
    <div class="col">
      <div class="card shadow-sm h-100 position-relative" data-matchup="${btoa(JSON.stringify(matchup))}" style="cursor: pointer;">
        <div class="position-absolute bottom-0 end-0 p-2">
          <small class="text-muted">${year}</small>
        </div>
        <div class="card-body text-center d-flex flex-column justify-content-center">
          <h5 class="card-title mb-3">${matchupDisplay}</h5>
          <div class="h3 text-dark fw-bold mb-3">${formatScore(totalScore)}</div>
          <div class="d-inline-block">
            <span class="badge ${getVerdictBadgeClass(totalScore)} fs-6">${verdict}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  return cardHtml;
}

// Function to calculate total score
function calculateTotalScore(matchup) {
  return matchup.upset_score + matchup.impact_score + matchup.excitement_score;
}

// Function to determine verdict based on total score
function determineVerdict(totalScore) {
  if (totalScore >= 4.0) {
    return "Witness History";
  } else if (totalScore >= 3.0) {
    return "Absolutely Yes";
  } else if (totalScore >= 2.5) {
    return "Get Out There"
  } else if (totalScore >= 2.0) {
    return "So Close";
  } else if (totalScore >= 1.5) {
    return "Absolutely Not";
  } else if (totalScore > 1.0) {
    return "Embarassing";
  } else {
    return "Disgraceful";
  }
}

// Function to get text color class based on verdict
function getVerdictTextClass(totalScore) {
  if (totalScore >= 2.5) {
    return "text-success";
  } else if (totalScore >= 2.0) {
    return "text-warning";
  } else {
    return "text-danger";
  }
}

// Function to get badge class based on total score
function getVerdictBadgeClass(totalScore) {
  if (totalScore >= 2.5) {
    return "bg-success";
  } else if (totalScore >= 2.0) {
    return "bg-warning";
  } else {
    return "bg-danger";
  }
}

// Function to format score with smart decimal places
function formatScore(score) {
  const rounded = Math.round(score * 100) / 100; // Round to 2 decimal places
  const secondDecimal = Math.floor((rounded * 100) % 10);
  
  // If second decimal is 0, show 1 decimal place, otherwise show 2
  return secondDecimal === 0 ? rounded.toFixed(1) : rounded.toFixed(2);
}

// Function to get current sport selection
function getCurrentSport() {
  const footballRadio = document.getElementById('football');
  return footballRadio && footballRadio.checked ? 'football' : 'basketball';
}

// Function to update sport text
function updateSportText(sport) {
  const sportTextElement = document.getElementById('sport-text');
  if (sportTextElement) {
    sportTextElement.textContent = sport === 'football' ? 'field' : 'court';
  }
}

// Global variable to store all matchups
let allMatchups = [];

// Function to fetch all matchups from API
async function fetchAllMatchups() {
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    allMatchups = data.matchups || [];
  } catch (error) {
    console.error('Error fetching matchups:', error);
    throw error;
  }
}

// Function to filter and display matchups by sport
function displayMatchupsBySport(sport = 'football') {
  const container = document.getElementById('matchup-cards');
  
  // Filter matchups by sport
  const filteredMatchups = allMatchups.filter(matchup => matchup.sport === sport);
  
  if (filteredMatchups && filteredMatchups.length > 0) {
    // Clear container
    container.innerHTML = '';
    
    // Create cards for each matchup
    filteredMatchups.forEach(matchup => {
      container.insertAdjacentHTML('beforeend', createMatchupCard(matchup));
    });
  } else {
    // Show no data message
    container.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-info">
          <h5>No ${sport} matchups available</h5>
          <p class="mb-0">Check back later for new matchup data.</p>
        </div>
      </div>
    `;
  }
}

// Function to load matchup data (now just filters and displays)
async function loadMatchups(sport = 'football') {
  try {
    // If we don't have matchups yet, fetch them first
    if (allMatchups.length === 0) {
      await fetchAllMatchups();
    }
    
    // Display filtered matchups
    displayMatchupsBySport(sport);
    
  } catch (error) {
    console.error('Error loading matchups:', error);
    const container = document.getElementById('matchup-cards');
    container.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-danger">
          <h5>Error Loading Data</h5>
          <p class="mb-0">Unable to load ${sport} matchup data. Please try again later.</p>
          <small class="text-muted">Error: ${error.message}</small>
        </div>
      </div>
    `;
  }
}

// Function to show matchup modal
function showMatchupModal(matchup) {
  const totalScore = calculateTotalScore(matchup);
  const verdict = determineVerdict(totalScore);
  const winnerRank = matchup.winner_rank ? `#${matchup.winner_rank}` : '';
  const loserRank = matchup.loser_rank ? `#${matchup.loser_rank}` : '';
  const matchupDisplay = `${winnerRank} ${matchup.winner} over ${loserRank} ${matchup.loser}`;
  
  // Format date to mm/dd/yyyy
  const dateParts = matchup.date.split('-');
  const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
  
  // Populate modal with matchup data
  document.getElementById('modal-matchup-name').innerHTML = `
    <div>${matchupDisplay}</div>
    <small class="text-muted">${formattedDate}</small>
  `;
  document.getElementById('modal-upset-score').textContent = formatScore(matchup.upset_score);
  document.getElementById('modal-impact-score').textContent = formatScore(matchup.impact_score);
  document.getElementById('modal-excitement-score').textContent = formatScore(matchup.excitement_score);
  document.getElementById('modal-total-score').textContent = formatScore(totalScore);
  
  // Set verdict badge
  const verdictElement = document.getElementById('modal-verdict');
  verdictElement.innerHTML = `<span class="badge ${getVerdictBadgeClass(totalScore)} fs-6">${verdict}</span>`;
  
  // Populate rationale fields
  document.getElementById('modal-overall-discussion').textContent = matchup.overall_discussion;
  document.getElementById('modal-upset-rationale').textContent = matchup.upset_rationale;
  document.getElementById('modal-impact-rationale').textContent = matchup.impact_rationale;
  document.getElementById('modal-excitement-rationale').textContent = matchup.excitement_rationale;
  
  // Populate accordion score badges
  document.getElementById('accordion-upset-score').textContent = formatScore(matchup.upset_score);
  document.getElementById('accordion-impact-score').textContent = formatScore(matchup.impact_score);
  document.getElementById('accordion-excitement-score').textContent = formatScore(matchup.excitement_score);
  
  // Show modal using Bootstrap 5 native API
  const modalElement = document.getElementById('matchupModal');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
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

// Load matchups when page loads (only on index page)
$(document).ready(function() {
  if (document.getElementById('matchup-cards')) {
    // Load initial data (football by default)
    loadMatchups('football');
    updateSportText('football');
    
    // Add event listeners for sport toggle
    $('#basketball, #football').on('change', function() {
      const selectedSport = getCurrentSport();
      displayMatchupsBySport(selectedSport);
      updateSportText(selectedSport);
    });
    
    // Add event listener for card clicks (using event delegation)
    $(document).on('click', '.card[data-matchup]', function() {
      const matchupDataString = this.getAttribute('data-matchup');
      const matchupData = JSON.parse(atob(matchupDataString));
      showMatchupModal(matchupData);
    });
  }
  
  // Setup matchup form submission (only on new.html page)
  if (document.getElementById('matchup-form')) {
    document.getElementById('matchup-form').addEventListener('submit', handleMatchupSubmission);
    
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
  }
});
