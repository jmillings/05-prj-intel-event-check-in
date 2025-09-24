// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCountElem = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const teamCounters = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"),
  power: document.getElementById("powerCount"),
};
const maxCount = 50;

// Helper: Load state from localStorage
function loadState() {
  let state = localStorage.getItem("attendanceState");
  if (state) {
    state = JSON.parse(state);
    // Reset team attendance to 0 on load
    state.teams = { water: 0, zero: 0, power: 0 };
    state.count = 0;
    state.attendees = [];
    saveState(state);
    return state;
  }
  return {
    count: 0,
    teams: { water: 0, zero: 0, power: 0 },
    attendees: [],
  };
}

// Helper: Save state to localStorage
function saveState(state) {
  localStorage.setItem("attendanceState", JSON.stringify(state));
}

// Helper: Update all UI elements
function updateUI(state) {
  attendeeCountElem.textContent = state.count;
  teamCounters.water.textContent = state.teams.water;
  teamCounters.zero.textContent = state.teams.zero;
  teamCounters.power.textContent = state.teams.power;
  let percent = Math.round((state.count / maxCount) * 100);
  progressBar.style.width = `${percent}%`;

  // Show attendee list (names and teams)
  let attendeeList = document.getElementById("attendeeList");
  if (!attendeeList) {
    attendeeList = document.createElement("div");
    attendeeList.id = "attendeeList";
    attendeeList.style.marginTop = "18px";
    attendeeList.style.textAlign = "left";
    form.parentNode.insertBefore(attendeeList, form.nextSibling);
  }
  if (state.attendees.length > 0) {
    let html = `<strong>Checked-in Attendees:</strong><ul style="margin:8px 0 0 18px;">`;
    for (let i = 0; i < state.attendees.length; i++) {
      let a = state.attendees[i];
      html += `<li>${a.name} (${a.teamName})</li>`;
    }
    html += `</ul>`;
    attendeeList.innerHTML = html;
  } else {
    attendeeList.innerHTML = "";
  }

  // Remove highlight from all teams
  for (let key in teamCounters) {
    teamCounters[key].parentNode.style.boxShadow = "";
    teamCounters[key].parentNode.style.border = "";
  }
}

// Helper: Show greeting
function showGreeting(message, isSuccess) {
  greeting.textContent = message;
  greeting.style.display = "block";
  greeting.className = isSuccess ? "success-message" : "";
}

// Helper: Hide greeting
function hideGreeting() {
  greeting.style.display = "none";
}

// Helper: Highlight winning team
function highlightWinningTeam(winningTeam) {
  for (let key in teamCounters) {
    if (key === winningTeam) {
      teamCounters[key].parentNode.style.boxShadow = "0 0 16px 4px #00c7fd";
      teamCounters[key].parentNode.style.border = "2px solid #00c7fd";
    } else {
      teamCounters[key].parentNode.style.boxShadow = "";
      teamCounters[key].parentNode.style.border = "";
    }
  }
}

// Helper: Find winning team
function getWinningTeam(teams) {
  let max = 0;
  let winner = "";
  for (let key in teams) {
    if (teams[key] > max) {
      max = teams[key];
      winner = key;
    }
  }
  return winner;
}

// Initialize state/UI on load
let state = loadState();
updateUI(state);

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  if (!name || !team) {
    showGreeting("Please enter your name and select a team.", false);
    return;
  }

  // Prevent over check-in
  if (state.count >= maxCount) {
    showGreeting("Attendance goal reached! No more check-ins allowed.", false);
    return;
  }

  // Add attendee
  state.count++;
  state.teams[team]++;
  state.attendees.push({ name: name, team: team, teamName: teamName });
  saveState(state);
  updateUI(state);

  // Show personalized greeting
  showGreeting(`🎉 Welcome, ${name} from ${teamName}!`, true);

  // Progress bar update handled in updateUI

  // Check for attendance goal
  if (state.count === maxCount) {
    let winner = getWinningTeam(state.teams);
    let winnerName = "";
    if (winner === "water") {
      winnerName = "🌊 Team Water Wise";
    } else if (winner === "zero") {
      winnerName = "🌿 Team Net Zero";
    } else if (winner === "power") {
      winnerName = "⚡ Team Renewables";
    }
    showGreeting(
      `🏆 Attendance goal reached! Congratulations, ${winnerName} has the most check-ins!`,
      true
    );
    highlightWinningTeam(winner);
  } else {
    highlightWinningTeam("");
  }

  form.reset();
});

// On page load, highlight winning team if goal reached
if (state.count >= maxCount) {
  let winner = getWinningTeam(state.teams);
  highlightWinningTeam(winner);
}
