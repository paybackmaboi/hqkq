// This function runs when the entire HTML document is loaded and ready.
document.addEventListener('DOMContentLoaded', function() {
    
    // Register the service worker for offline functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('Service Worker registered with scope:', registration.scope))
          .catch(error => console.log('Service Worker registration failed:', error));
    }

    // --- PAGE-SPECIFIC INITIALIZERS ---
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

function initializeDashboard() {
    fetchLiveWeatherData(); 
    fetchLiveEarthquakeData();
    fetchAqiData();
}

async function initializeMap() {
    // Map is centered on Cebu City's coordinates
    const map = L.map('map').setView([10.3157, 123.8854], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const crowdsourcedReports = [];
    crowdsourcedReports.forEach(report => {
        L.marker([report.lat, report.lon]).addTo(map).bindPopup(report.report);
    });

    try {
        const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
        const responseData = await response.json();
        const quakeIcon = L.icon({ iconUrl: 'https://img.icons8.com/fluency/48/000000/earthquake.png', iconSize: [48, 48] });
        const phQuake = responseData.features.find(q => q.properties.place.includes("Philippines"));
        if (phQuake) {
            const [lon, lat, depth] = phQuake.geometry.coordinates;
            L.marker([lat, lon], { icon: quakeIcon }).addTo(map).bindPopup(`<b>Recent Quake: M ${phQuake.properties.mag}</b><br>${phQuake.properties.place}.`);
        }
    } catch (error) {
        console.error("Could not fetch earthquake data for map:", error);
    }
}

function initializePrepKit() {
    initializeChecklists();
    initializeAIAdvisor(); 

    const safeBtn = document.getElementById('iam-safe-btn');
    if (safeBtn) {
        safeBtn.addEventListener('click', sendIAmSafeNotification);
    }
}

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
        responseArea.innerHTML = `<div class="ai-loader">Getting advice...</div>`;
        const advice = await getAIAdvice(userPrompt);
        responseArea.textContent = advice;
    });
}


// =================================================================
// NEW & UPDATED FEATURES
// =================================================================

function playSoundAlert() {
    const alertSound = new Audio('https://www.soundjay.com/buttons/beep-07a.mp3');
    alertSound.play().catch(error => console.log("Could not play sound:", error));
}

async function fetchAqiData() {
    const aqiCard = document.getElementById('aqi-alert-card');
    if (!aqiCard) return;

    const lat = 10.3157;
    const lon = 123.8854;
    const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        updateAqiUI(data.current.us_aqi);
    } catch (error) {
        console.error('Failed to fetch AQI data:', error);
        aqiCard.classList.add('status-error');
        aqiCard.innerHTML = `<p>Could not load AQI data.</p>`;
    }
}

function updateAqiUI(aqi) {
    const aqiCard = document.getElementById('aqi-alert-card');
    let level = "Good";
    let color = "#27ae60";

    if (aqi > 150) { level = "Unhealthy"; color = "#c0392b"; }
    else if (aqi > 100) { level = "Unhealthy for Sensitive Groups"; color = "#f39c12"; }
    else if (aqi > 50) { level = "Moderate"; color = "#f1c40f"; }

    aqiCard.innerHTML = `
        <div class="icon" style="color: ${color};"><i class="fas fa-smog"></i></div>
        <div class="content">
            <p><strong>Air Quality: ${aqi}</strong></p>
            <p>Level: ${level}</p>
        </div>`;
}

// --- UPDATED: sendIAmSafeNotification now calls the backend ---
async function sendIAmSafeNotification() {
    const safeBtn = document.getElementById('iam-safe-btn');
    safeBtn.disabled = true; // Disable button to prevent multiple clicks
    safeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        // This is the URL of your new backend server.
        const backendUrl = 'http://localhost:3000/api/safe';
        
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // You can send user data in the body if needed
            body: JSON.stringify({}) 
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Backend response:', result);
        
        safeBtn.innerHTML = '<i class="fas fa-check-circle"></i> Notification Sent!';
        
        // Use a more user-friendly notification than alert()
        setTimeout(() => {
            alert('Your "I Am Safe" notification has been sent (simulated).');
            safeBtn.innerHTML = '<i class="fas fa-check-circle"></i> Send "I Am Safe" Notification';
            safeBtn.disabled = false;
        }, 1000);

    } catch (error) {
        console.error('Failed to send "I am safe" notification:', error);
        alert('Could not send notification. Please check your connection or try again later.');
        safeBtn.innerHTML = '<i class="fas fa-times-circle"></i> Failed to Send';
        setTimeout(() => {
            safeBtn.innerHTML = '<i class="fas fa-check-circle"></i> Send "I Am Safe" Notification';
            safeBtn.disabled = false;
        }, 3000);
    }
}


// =================================================================
// DASHBOARD DATA FETCHING (Existing Functions)
// =================================================================

async function fetchLiveWeatherData() {
    const weatherCard = document.getElementById('typhoon-alert-card');
    if (!weatherCard) return;
    const lat = 10.3157;
    const lon = 123.8854;
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,wind_speed_10m`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        updateWeatherUI(data.current);
    } catch (error) {
        console.error('Failed to fetch live weather data:', error);
        weatherCard.innerHTML = `<div class="content"><p>Could not load live weather data.</p></div>`;
    }
}

function updateWeatherUI(currentWeather) {
    const weatherCard = document.getElementById('typhoon-alert-card');
    weatherCard.className = 'alert-card-large';
    let statusClass = 'status-safe', icon = 'fa-sun', title = 'Currently Safe';
    let message = `Wind Speed: ${currentWeather.wind_speed_10m} km/h.`;

    if (currentWeather.wind_speed_10m > 61) {
        statusClass = 'status-danger'; icon = 'fa-wind'; title = 'High Alert: Strong Winds';
        message = `Dangerous wind speeds of ${currentWeather.wind_speed_10m} km/h detected. Take shelter.`;
        playSoundAlert();
    } else if (currentWeather.wind_speed_10m > 39) {
        statusClass = 'status-warning'; icon = 'fa-wind'; title = 'Warning: Strong Winds';
        message = `Strong winds of ${currentWeather.wind_speed_10m} km/h detected. Secure loose objects.`;
    }
    
    const weatherMessage = getWeatherMessageFromCode(currentWeather.weather_code);
    if (weatherMessage) {
        message += `<br>${weatherMessage}`;
        if ((currentWeather.weather_code >= 95 || currentWeather.weather_code === 18) && statusClass === 'status-safe') {
            statusClass = 'status-warning';
        }
    }
    
    weatherCard.classList.add(statusClass);
    weatherCard.innerHTML = `<h2><i class="fas ${icon}"></i> ${title}</h2><p>${message}</p>`;
}

function getWeatherMessageFromCode(code) {
    const weatherCodes = {
        18: "Thunderstorm in vicinity", 29: "Thunderstorm", 61: "Slight rain reported.",
        63: "Moderate rain reported.", 65: "Heavy rain reported.", 80: "Slight rain showers.",
        81: "Moderate rain showers.", 82: "Violent rain showers.", 95: "Thunderstorm with slight hail.",
        96: "Thunderstorm with moderate or heavy hail."
    };
    return weatherCodes[code] || null;
}

async function fetchLiveEarthquakeData() {
    const earthquakeCard = document.getElementById('earthquake-alert-card');
    if (!earthquakeCard) return;

    earthquakeCard.classList.remove('status-error');
    earthquakeCard.innerHTML = `<div class="loader">Fetching seismic data...</div>`;

    const apiUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const responseData = await response.json();
        
        if (responseData.features.length > 0) {
            const latestQuake = responseData.features[0];
            const processedData = {
                magnitude: latestQuake.properties.mag,
                location: latestQuake.properties.place,
                time: new Date(latestQuake.properties.time)
            };
            updateEarthquakeUI(processedData);
        } else {
            earthquakeCard.innerHTML = `
                <div class="icon" style="color: #27ae60;"><i class="fas fa-check-circle"></i></div>
                <div class="content">
                    <p><strong>No significant quakes</strong></p>
                    <p>No earthquakes reported in the past hour.</p>
                </div>`;
        }
    } catch (error) {
        console.error('Failed to fetch live earthquake data:', error);
        earthquakeCard.classList.add('status-error');
        earthquakeCard.innerHTML = `<p>Could not load live earthquake data.</p>`;
    }
}

function updateEarthquakeUI(data) {
    const earthquakeCard = document.getElementById('earthquake-alert-card');
    const now = new Date();
    const diffMinutes = Math.round((now - data.time) / (1000 * 60));
    let timeAgo = `${diffMinutes} minutes ago`;
    if (diffMinutes >= 60) timeAgo = `${Math.floor(diffMinutes / 60)} hour(s) ago`;
    
    const magnitude = data.magnitude ? data.magnitude.toFixed(1) : 'N/A';

    earthquakeCard.innerHTML = `
        <div class="icon" style="color: #c0392b;"><i class="fas fa-broadcast-tower"></i></div>
        <div class="content">
            <p><strong>Recent Quake: M ${magnitude}</strong></p>
            <p>${data.location} &bull; ${timeAgo}</p>
        </div>`;
}

async function getAIAdvice(userPrompt) {
    const fullPrompt = `As a disaster preparedness expert in the Philippines, provide clear, concise, and actionable advice for the following question: "${userPrompt}". The advice should be practical for someone living in a city like Cebu. Do not use markdown.`;
    const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = "AIzaSyC60G9hsu0LbKLnu_0IBE-aX0voyp3x7z0";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]) {
            return result.candidates[0].content.parts[0].text;
        } else {
            return "Sorry, I couldn't generate a response. The API returned an unexpected format.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, I'm having trouble connecting to the AI service.";
    }
}