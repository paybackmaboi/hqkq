// This function runs when the entire HTML document is loaded and ready.
document.addEventListener('DOMContentLoaded', function() {

    // --- PAGE-SPECIFIC INITIALIZERS ---
    // This approach checks which page is open and runs only the necessary code.
    if (document.getElementById('typhoon-alert-card')) {
        initializeDashboard();
    }
    if (document.getElementById('map')) {
        initializeMap();
    }
    if (document.querySelector('.prep-kit-grid')) {
        initializePrepKit();
    }
});


// =================================================================
// INITIALIZATION FUNCTIONS
// =================================================================

/**
 * Fetches data and sets up the main dashboard alerts.
 */
function initializeDashboard() {
    fetchMockTyphoonData();
    fetchLiveEarthquakeData();
}

/**
 * Creates the interactive map and adds markers.
 */
async function initializeMap() {
    // ... (map initialization code remains the same as before)
    const map = L.map('map').setView([10.675, 122.95], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    const evacIcon = L.icon({ iconUrl: 'https://img.icons8.com/office/40/000000/building.png', iconSize: [40, 40] });
    const quakeIcon = L.icon({ iconUrl: 'https://img.icons8.com/fluency/48/000000/earthquake.png', iconSize: [48, 48] });
    const evacCenters = [
        { name: "Bacolod City Government Center", lat: 10.644, lon: 122.961 },
        { name: "University of St. La Salle", lat: 10.680, lon: 122.953 },
        { name: "STI West Negros University", lat: 10.666, lon: 122.949 }
    ];
    evacCenters.forEach(center => L.marker([center.lat, center.lon], { icon: evacIcon }).addTo(map).bindPopup(`<b>${center.name}</b><br>Evacuation Center.`));
    try {
        const response = await fetch('https://earthquake.phivolcs.dost.gov.ph/api/v1/earthquakes?limit=1');
        const responseData = await response.json();
        const latestQuake = responseData.data[0];
        L.marker([latestQuake.latitude, latestQuake.longitude], { icon: quakeIcon }).addTo(map).bindPopup(`<b>Recent Quake: M ${latestQuake.magnitude.value}</b><br>${latestQuake.location}.`);
    } catch (error) {
        console.error("Could not fetch earthquake data for map:", error);
    }
}

/**
 * Initializes all functionality for the Prep-Kit page.
 */
function initializePrepKit() {
    initializeChecklists();
    initializeAIAdvisor(); // Initialize the new Gemini feature
}

/**
 * Adds functionality to save checklist progress using localStorage.
 */
function initializeChecklists() {
    const checkboxes = document.querySelectorAll('.checklist-card input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (localStorage.getItem(checkbox.id) === 'true') {
            checkbox.checked = true;
        }
        checkbox.addEventListener('change', function() {
            localStorage.setItem(this.id, this.checked);
        });
    });
}

/**
 * Sets up the event listener for the AI Advisor button.
 */
function initializeAIAdvisor() {
    const getAdviceBtn = document.getElementById('get-advice-btn');
    const promptInput = document.getElementById('ai-prompt-input');
    const responseArea = document.getElementById('ai-response-area');

    getAdviceBtn.addEventListener('click', async () => {
        const userPrompt = promptInput.value;
        if (!userPrompt) {
            responseArea.textContent = "Please enter a question first.";
            return;
        }

        // Show loading indicator
        responseArea.innerHTML = `<div class="ai-loader">Getting advice...</div>`;

        // Call the function to get advice from Gemini
        const advice = await getAIAdvice(userPrompt);
        responseArea.textContent = advice;
    });
}


// =================================================================
// GEMINI API FUNCTION
// =================================================================

/**
 * Calls the Gemini API to get disaster preparedness advice.
 * @param {string} userPrompt - The user's question.
 * @returns {Promise<string>} - The AI-generated advice.
 */
async function getAIAdvice(userPrompt) {
    // IMPORTANT: This is a simplified context for the AI.
    const fullPrompt = `As a disaster preparedness expert in the Philippines, provide clear, concise, and actionable advice for the following question: "${userPrompt}". The advice should be practical for someone living in a city like Bacolod. Do not use markdown.`;

    const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = ""; // Leave blank, Canvas will provide it.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            return "Sorry, I couldn't generate a response. The API returned an unexpected format. Please try again.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, I'm having trouble connecting to the AI service. Please check your internet connection and try again later.";
    }
}


// =================================================================
// DASHBOARD DATA FETCHING AND UI UPDATING FUNCTIONS
// =================================================================
function fetchMockTyphoonData() {
    const typhoonCard = document.getElementById('typhoon-alert-card');
    if (!typhoonCard) return;
    const scenario = 0;
    let data;
    if (scenario === 1) data = { active: true, name: "Sample Typhoon", signal: 1, message: "Be prepared for strong winds." };
    else if (scenario === 2) data = { active: true, name: "Sample Typhoon", signal: 2, message: "Take shelter. Damaging winds expected." };
    else data = { active: false };
    updateTyphoonUI(data);
}

function updateTyphoonUI(data) {
    const typhoonCard = document.getElementById('typhoon-alert-card');
    typhoonCard.className = 'alert-card-large';
    if (data.active) {
        let statusClass = data.signal >= 2 ? 'status-danger' : 'status-warning';
        typhoonCard.classList.add(statusClass);
        typhoonCard.innerHTML = `<h2><i class="fas fa-wind"></i>Typhoon Signal #${data.signal}</h2><p><strong>Name:</strong> ${data.name}</p><p>${data.message}</p>`;
    } else {
        typhoonCard.classList.add('status-safe');
        typhoonCard.innerHTML = `<h2><i class="fas fa-sun"></i>Currently Safe</h2><p>No active typhoon bulletin.</p>`;
    }
}

async function fetchLiveEarthquakeData() {
    const earthquakeCard = document.getElementById('earthquake-alert-card');
    if (!earthquakeCard) return;
    const apiUrl = 'https://earthquake.phivolcs.dost.gov.ph/api/v1/earthquakes?limit=1';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const responseData = await response.json();
        const latestQuake = responseData.data[0];
        const processedData = {
            magnitude: latestQuake.magnitude.value,
            location: latestQuake.location,
            time: new Date(latestQuake.time.utc)
        };
        updateEarthquakeUI(processedData);
    } catch (error) {
        console.error('Failed to fetch live earthquake data:', error);
        earthquakeCard.innerHTML = `<div class="content"><p>Could not load live earthquake data.</p></div>`;
    }
}

function updateEarthquakeUI(data) {
    const earthquakeCard = document.getElementById('earthquake-alert-card');
    const now = new Date();
    const diffMinutes = Math.round((now - data.time) / (1000 * 60));
    let timeAgo = `${diffMinutes} minutes ago`;
    if (diffMinutes >= 60) timeAgo = `${Math.floor(diffMinutes / 60)} hour(s) ago`;
    earthquakeCard.innerHTML = `
        <div class="icon" style="color: #c0392b;"><i class="fas fa-broadcast-tower"></i></div>
        <div class="content">
            <p><strong>Recent Quake: M ${data.magnitude}</strong></p>
            <p>${data.location} &bull; ${timeAgo}</p>
        </div>`;
}
