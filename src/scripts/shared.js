import "../styles/custom.css"
import $ from "jquery"
import "bootstrap/dist/css/bootstrap.min.css"
import * as bootstrap from "bootstrap"
import { basketballMatchups, footballMatchups } from "../test-data.js"

// Hardcoded endpoint - replace with your actual API endpoint
const API_ENDPOINT = 'https://your-api-endpoint.com/api/matchups';

// Test endpoint for development
const TEST_ENDPOINT = './test.json';

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
          <div class="h3 text-dark fw-bold mb-3">${totalScore.toFixed(1)}</div>
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

// Function to get current sport selection
function getCurrentSport() {
  const basketballRadio = document.getElementById('basketball');
  return basketballRadio && basketballRadio.checked ? 'basketball' : 'football';
}

// Function to update sport text
function updateSportText(sport) {
  const sportTextElement = document.getElementById('sport-text');
  if (sportTextElement) {
    sportTextElement.textContent = sport === 'basketball' ? 'court' : 'field';
  }
}

// Function to load matchup data
async function loadMatchups(sport = 'basketball') {
  try {
    // Use test data for development - change to API_ENDPOINT for production
    let matchups;
    
    // For development, use imported test data based on sport
    if (sport === 'basketball') {
      matchups = basketballMatchups;
    } else {
      matchups = footballMatchups;
    }
    
    // Uncomment this block for production API:
    /*
    const response = await fetch(`${API_ENDPOINT}?sport=${sport}`);
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
            <h5>No ${sport} matchups available</h5>
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
  document.getElementById('modal-upset-score').textContent = matchup.upset_score.toFixed(1);
  document.getElementById('modal-impact-score').textContent = matchup.impact_score.toFixed(1);
  document.getElementById('modal-excitement-score').textContent = matchup.excitement_score.toFixed(1);
  document.getElementById('modal-total-score').textContent = totalScore.toFixed(1);
  
  // Set verdict badge
  const verdictElement = document.getElementById('modal-verdict');
  verdictElement.innerHTML = `<span class="badge ${getVerdictBadgeClass(totalScore)} fs-6">${verdict}</span>`;
  
  // Populate rationale fields
  document.getElementById('modal-overall-discussion').textContent = matchup.overall_discussion;
  document.getElementById('modal-upset-rationale').textContent = matchup.upset_rationale;
  document.getElementById('modal-impact-rationale').textContent = matchup.impact_rationale;
  document.getElementById('modal-excitement-rationale').textContent = matchup.excitement_rationale;
  
  // Show modal using Bootstrap 5 native API
  const modalElement = document.getElementById('matchupModal');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// Load matchups when page loads (only on index page)
$(document).ready(function() {
  if (document.getElementById('matchup-cards')) {
    // Load initial data (basketball by default)
    loadMatchups('basketball');
    updateSportText('basketball');
    
    // Add event listeners for sport toggle
    $('#basketball, #football').on('change', function() {
      const selectedSport = getCurrentSport();
      loadMatchups(selectedSport);
      updateSportText(selectedSport);
    });
    
    // Add event listener for card clicks (using event delegation)
    $(document).on('click', '.card[data-matchup]', function() {
      const matchupDataString = this.getAttribute('data-matchup');
      const matchupData = JSON.parse(atob(matchupDataString));
      showMatchupModal(matchupData);
    });
  }
});
