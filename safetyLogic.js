// Phase 2: Real API Logic

// Step 3: Safety Score Formula
// L=Lighting, C=Construction, R=Rain, V=Visibility (0 or 1)
function calcSafetyScore(L, C, R, V) {
    const penalty = (30 * L) + (40 * C) + (25 * R) + (40 * V);
    return Math.max(0, 100 - penalty);
}

// Get Badge Status
function getScoreStatus(score) {
    if (score >= 80) return 'safe';
    if (score >= 50) return 'moderate';
    return 'danger';
}

// Fetch Weather Data from OpenWeatherMap
async function fetchWeatherData(lat, lon) {
    // If no API key is provided, return dummy safe data
    if (!window.OPENWEATHER_API_KEY || window.OPENWEATHER_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
        console.warn("No OpenWeatherMap API Key. Using mock weather data.");
        return { R: 0, V: 0, raw: null };
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${window.OPENWEATHER_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        // R = 1 if it's raining (weather id 2xx, 3xx, 5xx)
        // V = 1 if visibility is less than 1000 meters
        let R = 0;
        if (data.weather && data.weather[0]) {
            const id = data.weather[0].id;
            if (id < 600) R = 1; // Thunderstorm, Drizzle, Rain
        }
        
        let V = 0;
        if (data.visibility !== undefined && data.visibility < 1000) {
            V = 1;
        }

        return { R, V, raw: data };
    } catch (error) {
        console.error("Error fetching weather:", error);
        return { R: 0, V: 0, raw: null };
    }
}

// Process a Google Maps Route to get safety score and hazards
async function processGoogleRoute(route, routeIndex) {
    const path = route.overview_path;
    // Sample a point in the middle of the route to check weather
    const midPoint = path[Math.floor(path.length / 2)];
    
    // Fetch weather for the midpoint
    const weather = await fetchWeatherData(midPoint.lat(), midPoint.lng());
    
    // For MVP, we assume L=0 (Daylight/lit) and C=0 (No construction) 
    // unless we specifically integrate Places API for road closures.
    // Let's add some randomness to simulate different conditions if API keys are missing
    let L = 0;
    let C = 0;
    let R = weather.R;
    let V = weather.V;

    // Simulate variations if keys are missing just for demo purposes
    if (!window.OPENWEATHER_API_KEY || window.OPENWEATHER_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
       if (routeIndex === 1) C = 1; // Simulate construction on second route
       if (routeIndex === 2) { L = 1; V = 1; } // Simulate dark and foggy on third route
    }

    const score = calcSafetyScore(L, C, R, V);
    const status = getScoreStatus(score);
    
    const hazards = [];
    if (L === 1) hazards.push("🌑 Dark Zone");
    if (C === 1) hazards.push("🚧 Construction");
    if (R === 1) hazards.push("🌧️ Rain");
    if (V === 1) hazards.push("🌫️ Low Visibility");

    return {
        id: routeIndex,
        name: route.summary || `Route ${routeIndex + 1}`,
        distance: route.legs[0].distance.text,
        time: route.legs[0].duration.text,
        score,
        status,
        hazards,
        googleRoute: route // Store the original route for map rendering
    };
}

// Fallback Mock Data for Demo Mode
function getMockRoutes() {
    return [
        {
            id: 'm1',
            name: "Main Highway Route",
            distance: "12.5 km",
            time: "25 mins",
            score: 100,
            status: 'safe',
            hazards: [],
            isMock: true
        },
        {
            id: 'm2',
            name: "City Center Shortcut",
            distance: "10.2 km",
            time: "32 mins",
            score: 60,
            status: 'moderate',
            hazards: ['🚧 Construction'],
            isMock: true
        },
        {
            id: 'm3',
            name: "Outer Ring Road (Night)",
            distance: "15.0 km",
            time: "28 mins",
            score: 30,
            status: 'danger',
            hazards: ['🌑 Dark Zone', '🌫️ Low Visibility'],
            isMock: true
        }
    ];
}

window.SafetyLogic = {
    calcSafetyScore,
    getScoreStatus,
    fetchWeatherData,
    processGoogleRoute,
    getMockRoutes
};
