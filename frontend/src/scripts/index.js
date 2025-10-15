import $ from "jquery"
import { initNavbar, Modal, isAuthenticated, getValidAccessToken } from "blr-shared-frontend"
import { navbarConfig } from "../config/navbar-config.js"
import { API_URL } from "./shared.js"

// Load matchups when page loads (only on index page)
$(function() {
  initNavbar(navbarConfig);

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

});

// Function to create a matchup card
function createMatchupCard(matchup) {
  const totalScore = calculateTotalScore(matchup);
  const verdict = determineVerdict(totalScore);
  const winnerRank = matchup.winner_rank ? `#${matchup.winner_rank}` : '';
  const loserRank = matchup.loser_rank ? `#${matchup.loser_rank}` : '';
  const year = matchup.date.split('-')[0];
  const matchupDisplay = `${winnerRank} ${matchup.winner} over ${loserRank} ${matchup.loser}`;
  const commentCount = matchup.comments ? matchup.comments.length : 0;
  
  // Only show comment text if there are comments
  const commentText = commentCount > 0 ? `
    <div class="position-absolute bottom-0 start-0 p-2">
      <small class="text-muted">${commentCount} Comment${commentCount !== 1 ? 's' : ''}</small>
    </div>
  ` : '';
  
  const cardHtml = `
    <div class="col">
      <div class="card shadow-sm h-100 position-relative" data-matchup="${btoa(JSON.stringify(matchup))}" style="cursor: pointer;">
        <div class="position-absolute bottom-0 end-0 p-2">
          <small class="text-muted">${year}</small>
        </div>
        ${commentText}
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
    const response = await fetch(API_URL.matchups);
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

// Store current matchup being viewed
let currentMatchup = null;

// Function to show matchup modal
function showMatchupModal(matchup) {
  currentMatchup = matchup; // Store current matchup
  
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
  
  // Populate comments section
  const commentCount = matchup.comments ? matchup.comments.length : 0;
  document.getElementById('accordion-comments-count').textContent = commentCount;
  populateComments(matchup.comments || []);
  
  // Show/hide add comment button based on login status
  const addCommentSection = document.getElementById('add-comment-section');
  if (isAuthenticated()) {
    addCommentSection.classList.remove('d-none');
  } else {
    addCommentSection.classList.add('d-none');
  }
  
  // Reset comment form
  resetCommentForm();
  
  const modalElement = document.getElementById('matchupModal');
  const modal = new Modal(modalElement);
  modal.show();
}

// Function to populate comments
function populateComments(comments) {
  const commentsList = document.getElementById('comments-list');
  
  if (comments.length === 0) {
    commentsList.innerHTML = '<p class="text-muted text-center">No comments yet. Be the first to comment!</p>';
    return;
  }
  
  // Sort comments by date (most recent first)
  const sortedComments = [...comments].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });
  
  commentsList.innerHTML = sortedComments.map(comment => {
    const date = new Date(comment.created_at);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <div class="card mb-2 comment-card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <strong class="text-primary">${escapeHtml(comment.user_id)}</strong>
            <small class="text-muted">${formattedDate}</small>
          </div>
          <p class="mb-0">${escapeHtml(comment.comment_text)}</p>
        </div>
      </div>
    `;
  }).join('');
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Function to reset comment form
function resetCommentForm() {
  document.getElementById('comment-form-container').classList.add('d-none');
  document.getElementById('comment-text-input').value = '';
  document.getElementById('comment-char-count').textContent = '0';
}

// Event listener for Add Comment button
$(document).on('click', '#add-comment-btn', function() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return;
  }
  
  document.getElementById('comment-form-container').classList.remove('d-none');
  document.getElementById('comment-text-input').focus();
});

// Event listener for Cancel button
$(document).on('click', '#cancel-comment-btn', function() {
  resetCommentForm();
});

// Event listener for character count
$(document).on('input', '#comment-text-input', function() {
  const length = this.value.length;
  document.getElementById('comment-char-count').textContent = length;
});

// Event listener for Submit Comment button
$(document).on('click', '#submit-comment-btn', async function() {
  const commentText = document.getElementById('comment-text-input').value.trim();
  
  if (!commentText) {
    alert('Please enter a comment');
    return;
  }
  
  if (!currentMatchup || !currentMatchup.id) {
    alert('Error: No matchup selected');
    return;
  }
  
  const submitBtn = this;
  const submitText = document.getElementById('submit-comment-text');
  const submitSpinner = document.getElementById('submit-comment-spinner');
  
  try {
    // Show loading state
    submitBtn.disabled = true;
    submitSpinner.classList.remove('d-none');
    submitText.textContent = 'Submitting...';
    
    // Get access token
    const accessToken = await getValidAccessToken();
    
    // Get user ID from user-menu button
    const userMenuButton = document.getElementById('user-menu');
    const userId = userMenuButton ? userMenuButton.textContent.trim() : 'Anonymous';

    // Submit comment
    const response = await fetch(API_URL.comment, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': accessToken
      },
      body: JSON.stringify({
        matchup_id: currentMatchup.id,
        comment_text: commentText,
        user_id: userId
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // Add comment to current matchup
      if (!currentMatchup.comments) {
        currentMatchup.comments = [];
      }
      currentMatchup.comments.push(result.comment);
      
      // Update UI
      populateComments(currentMatchup.comments);
      const commentCount = currentMatchup.comments.length;
      document.getElementById('accordion-comments-count').textContent = commentCount;
      
      // Reset form
      resetCommentForm();
      
      // Reload matchups to get updated data
      await fetchAllMatchups();
      displayMatchupsBySport(getCurrentSport());
      
    } else if (response.status === 403) {
      throw new Error('You must be logged in to comment');
    } else {
      throw new Error(`Failed to submit comment: ${response.status}`);
    }
    
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert(`Error: ${error.message}`);
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitSpinner.classList.add('d-none');
    submitText.textContent = 'Submit';
  }
});