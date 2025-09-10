// Georgian locations data for search autocomplete
const georgianLocations = [
    // Major cities
    { name: 'თბილისი', type: 'ქალაქი', lat: 41.7151, lon: 44.8271 },
    { name: 'ბათუმი', type: 'ქალაქი', lat: 41.6168, lon: 41.6367 },
    { name: 'ქუთაისი', type: 'ქალაქი', lat: 42.2679, lon: 42.7014 },
    { name: 'რუსთავი', type: 'ქალაქი', lat: 41.5495, lon: 44.9994 },
    { name: 'გორი', type: 'ქალაქი', lat: 41.9847, lon: 44.1094 },
    { name: 'ზუგდიდი', type: 'ქალაქი', lat: 42.5088, lon: 41.8706 },
    { name: 'ფოთი', type: 'ქალაქი', lat: 42.2822, lon: 41.6736 },
    { name: 'ბორჯომი', type: 'ქალაქი', lat: 41.8406, lon: 43.3906 },
    { name: 'ახალციხე', type: 'ქალაქი', lat: 41.6394, lon: 43.0031 },
    { name: 'მცხეთა', type: 'ქალაქი', lat: 41.8459, lon: 44.7209 },
    
    // Rivers
    { name: 'მტკვარი', type: 'მდინარე', lat: 41.7151, lon: 44.8271 },
    { name: 'რიონი', type: 'მდინარე', lat: 42.2679, lon: 42.7014 },
    { name: 'ენგური', type: 'მდინარე', lat: 42.5088, lon: 41.8706 },
    { name: 'ალაზანი', type: 'მდინარე', lat: 41.9100, lon: 45.7300 },
    { name: 'იორი', type: 'მდინარე', lat: 41.5495, lon: 44.9994 },
    { name: 'ლიახვი', type: 'მდينარე', lat: 42.2300, lon: 43.9700 },
    { name: 'არაგვი', type: 'მდინარე', lat: 42.0500, lon: 44.7200 },
    { name: 'ჩოროხი', type: 'მდინარე', lat: 41.6168, lon: 41.6367 },
    
    // Lakes
    { name: 'რიწა', type: 'ტბა', lat: 42.3644, lon: 43.4806 },
    { name: 'პარავანი', type: 'ტბა', lat: 41.4500, lon: 43.8100 },
    { name: 'ბაზალეთი', type: 'ტბა', lat: 42.0300, lon: 44.6900 },
    { name: 'ტაბაწყური', type: 'ტბა', lat: 41.6900, lon: 43.6500 },
    { name: 'ლისი', type: 'ტბა', lat: 41.6800, lon: 44.8000 },
    
    // Coastal areas
    { name: 'ანაკლია', type: 'ზღვისპირა', lat: 42.3858, lon: 41.5736 },
    { name: 'კობულეთი', type: 'ზღვისპირა', lat: 41.8231, lon: 41.7714 },
    { name: 'შავი ზღვა', type: 'ზღვა', lat: 42.0000, lon: 41.5000 },
    { name: 'გონიო', type: 'ზღვისპირა', lat: 41.5700, lon: 41.6100 },
    
    // Mountain areas and reservoirs
    { name: 'ხუდონი', type: 'წყალსაცავი', lat: 42.7200, lon: 42.3400 },
    { name: 'ჟინვალი', type: 'წყალსაცავი', lat: 42.0700, lon: 44.7500 },
    { name: 'ტყვარჩელი', type: 'წყალსაცავი', lat: 42.8500, lon: 41.0200 }
];

// Import weather service configuration
// Note: In a real production environment, you would load this from config.js

// Moon phases in Georgian
const moonPhases = {
    'new': 'ახალმთვარე',
    'waxing_crescent': 'მზარდი ნახევარმთვარე',
    'first_quarter': 'პირველი მეოთხედი',
    'waxing_gibbous': 'მზარდი',
    'full': 'სავსემთვარე',
    'waning_gibbous': 'კლებადი',
    'last_quarter': 'ბოლო მეოთხედი',
    'waning_crescent': 'კლებადი ნახევარმთვარე'
};

// Fishing score descriptions in Georgian
const scoreDescriptions = {
    9: 'შესანიშნავი - იდეალური პირობები თევზაობისთვის!',
    8: 'ძალიან კარგი - ღირს გასვლა!',
    7: 'კარგი - მოსალოდნელია კარგი ნადავლი',
    6: 'საშუალო - შესაძლოა რამე დაიჭიროთ',
    5: 'საშუალო - სცადეთ ღირს',
    4: 'დამაკმაყოფილებელი - არ არის ყველაზე კარგი დრო',
    3: 'სუსტი - რთული იქნება რამის დაჭერა',
    2: 'ცუდი - უმჯობესია მეორე დღეს სცადოთ',
    1: 'ძალიან ცუდი - არ ღირს გასვლა'
};

class FishingForecast {
    constructor() {
        this.currentLocation = null;
        this.map = null;
        this.markers = [];
        this.selectedMarker = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.initializeMap();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('location-search');
        const suggestionsContainer = document.getElementById('search-suggestions');

        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const firstSuggestion = document.querySelector('.suggestion-item');
                if (firstSuggestion) {
                    this.selectLocation(firstSuggestion.dataset.location);
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-container')) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const georgianDate = now.toLocaleDateString('ka-GE', options);
        document.getElementById('current-date').textContent = georgianDate;
    }

    initializeMap() {
        // Initialize map centered on Georgia
        this.map = L.map('fishing-map').setView([42.0, 43.5], 7);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Add Georgian fishing locations as markers
        this.addLocationMarkers();

        // Handle map clicks for custom location selection
        this.map.on('click', (e) => {
            this.handleMapClick(e);
        });
    }

    addLocationMarkers() {
        georgianLocations.forEach(location => {
            const markerIcon = this.createCustomMarkerIcon(location.type);
            
            const marker = L.marker([location.lat, location.lon], {
                icon: markerIcon
            }).addTo(this.map);

            // Create popup content
            const popupContent = `
                <div class="popup-content">
                    <div class="popup-title">${location.name}</div>
                    <div class="popup-type">${location.type}</div>
                    <button class="popup-select-btn" onclick="window.fishingApp.selectLocationFromMap(${JSON.stringify(location).replace(/"/g, '&quot;')})">
                        ამ ლოკაციის არჩევა
                    </button>
                </div>
            `;

            marker.bindPopup(popupContent);
            this.markers.push({ marker, location });
        });
    }

    createCustomMarkerIcon(type) {
        let iconClass = 'marker-city';
        let iconSymbol = '🏙️';

        switch(type) {
            case 'მდინარე':
                iconClass = 'marker-river';
                iconSymbol = '🏞️';
                break;
            case 'ტბა':
                iconClass = 'marker-lake';
                iconSymbol = '🏔️';
                break;
            case 'ზღვისპირა':
            case 'ზღვა':
                iconClass = 'marker-coastal';
                iconSymbol = '🌊';
                break;
            case 'წყალსაცავი':
                iconClass = 'marker-reservoir';
                iconSymbol = '🏗️';
                break;
        }

        return L.divIcon({
            className: `custom-marker ${iconClass}`,
            html: iconSymbol,
            iconSize: [25, 25],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        });
    }

    handleMapClick(e) {
        const lat = e.latlng.lat.toFixed(4);
        const lon = e.latlng.lng.toFixed(4);
        
        // Create custom location
        const customLocation = {
            name: `კოორდინატები: ${lat}, ${lon}`,
            type: 'მომხმარებლის არჩევანი',
            lat: parseFloat(lat),
            lon: parseFloat(lon)
        };

        // Remove previous custom marker if exists
        if (this.selectedMarker) {
            this.map.removeLayer(this.selectedMarker);
        }

        // Add new custom marker
        this.selectedMarker = L.marker([lat, lon], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '📍',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(this.map);

        const popupContent = `
            <div class="popup-content">
                <div class="popup-title">პერსონალური ლოკაცია</div>
                <div class="popup-type">კოორდინატები: ${lat}, ${lon}</div>
                <button class="popup-select-btn" onclick="window.fishingApp.selectLocationFromMap(${JSON.stringify(customLocation).replace(/"/g, '&quot;')})">
                    ამ ლოკაციის არჩევა
                </button>
            </div>
        `;

        this.selectedMarker.bindPopup(popupContent).openPopup();
    }

    selectLocationFromMap(location) {
        this.selectLocation(location);
        this.map.closePopup();
    }

    handleSearch(query) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const filteredLocations = georgianLocations.filter(location =>
            location.name.toLowerCase().includes(query.toLowerCase()) ||
            location.type.toLowerCase().includes(query.toLowerCase())
        );

        this.displaySuggestions(filteredLocations, suggestionsContainer);
    }

    displaySuggestions(locations, container) {
        if (locations.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = locations
            .slice(0, 8)
            .map(location => `
                <div class="suggestion-item" data-location='${JSON.stringify(location)}'>
                    <strong>${location.name}</strong> <small>(${location.type})</small>
                </div>
            `)
            .join('');

        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const locationData = JSON.parse(item.dataset.location);
                this.selectLocation(locationData);
            });
        });

        container.style.display = 'block';
    }

    selectLocation(location) {
        this.currentLocation = location;
        document.getElementById('location-search').value = location.name;
        document.getElementById('search-suggestions').style.display = 'none';
        document.getElementById('current-location').textContent = location.name;
        
        this.showForecastSections();
        this.loadWeatherData(location);
    }

    showForecastSections() {
        document.getElementById('current-forecast').style.display = 'block';
        document.getElementById('forecast-section').style.display = 'block';
    }

    async loadWeatherData(location) {
        try {
            // For demo purposes, we'll use simulated data
            // In production, you would fetch from actual weather APIs
            const weatherData = await this.getWeatherData(location.lat, location.lon);
            this.updateCurrentForecast(weatherData);
            this.updateFiveDayForecast(location);
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showError('ამინდის მონაცემების ჩატვირთვისას მოხდა შეცდომა');
        }
    }

    async getWeatherData(lat, lon) {
        // Simulated weather data for demo
        // In production, replace with actual API calls
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    temperature: Math.round(Math.random() * 25 + 10), // 10-35°C
                    windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
                    pressure: Math.round(Math.random() * 30 + 1000), // 1000-1030 hPa
                    humidity: Math.round(Math.random() * 40 + 40), // 40-80%
                    uvIndex: Math.round(Math.random() * 10), // 0-10
                    precipitation: Math.round(Math.random() * 10), // 0-10mm
                    moonPhase: Object.keys(moonPhases)[Math.floor(Math.random() * 8)]
                });
            }, 1000);
        });
    }

    updateCurrentForecast(data) {
        // Update temperature
        document.getElementById('temperature').textContent = `${data.temperature}°C`;
        
        // Update wind
        document.getElementById('wind').textContent = `${data.windSpeed} კმ/სთ`;
        
        // Update moon phase
        document.getElementById('moon-phase').textContent = moonPhases[data.moonPhase];
        
        // Update pressure
        document.getElementById('pressure').textContent = `${data.pressure} hPa`;
        
        // Update UV index
        document.getElementById('uv-index').textContent = data.uvIndex;
        
        // Update precipitation
        document.getElementById('precipitation').textContent = `${data.precipitation} მმ`;
        
        // Update humidity
        document.getElementById('humidity').textContent = `${data.humidity}%`;
        
        // Calculate and update fishing score
        const fishingScore = this.calculateFishingScore(data);
        this.updateFishingScore(fishingScore);
        
        // Update best fishing time
        document.getElementById('best-time').textContent = this.getBestFishingTime();
    }

    calculateFishingScore(data) {
        let score = 5; // Base score
        
        // Temperature scoring (ideal 15-25°C)
        if (data.temperature >= 15 && data.temperature <= 25) {
            score += 2;
        } else if (data.temperature >= 10 && data.temperature <= 30) {
            score += 1;
        } else {
            score -= 1;
        }
        
        // Wind scoring (ideal 5-15 km/h)
        if (data.windSpeed >= 5 && data.windSpeed <= 15) {
            score += 1.5;
        } else if (data.windSpeed > 20) {
            score -= 1;
        }
        
        // Pressure scoring (stable pressure is good)
        if (data.pressure >= 1013 && data.pressure <= 1020) {
            score += 1;
        } else if (data.pressure < 1000 || data.pressure > 1030) {
            score -= 0.5;
        }
        
        // Moon phase scoring
        if (data.moonPhase === 'new' || data.moonPhase === 'full') {
            score += 1;
        }
        
        // UV scoring (lower is better for fishing)
        if (data.uvIndex <= 3) {
            score += 0.5;
        } else if (data.uvIndex >= 8) {
            score -= 0.5;
        }
        
        // Precipitation scoring (light rain can be good)
        if (data.precipitation >= 1 && data.precipitation <= 5) {
            score += 0.5;
        } else if (data.precipitation > 10) {
            score -= 1;
        }
        
        // Humidity scoring (40-70% is ideal)
        if (data.humidity >= 40 && data.humidity <= 70) {
            score += 0.5;
        }
        
        return Math.max(1, Math.min(10, Math.round(score)));
    }

    updateFishingScore(score) {
        document.getElementById('fishing-score').textContent = score;
        
        const description = scoreDescriptions[score] || scoreDescriptions[5];
        document.getElementById('score-description').textContent = description;
        
        // Update score circle color based on score
        const scoreCircle = document.querySelector('.score-circle');
        let gradient;
        
        if (score >= 8) {
            gradient = 'conic-gradient(from 0deg, #4ecdc4 0%, #6bcf7f 100%)';
        } else if (score >= 6) {
            gradient = 'conic-gradient(from 0deg, #6bcf7f 0%, #ffd93d 100%)';
        } else if (score >= 4) {
            gradient = 'conic-gradient(from 0deg, #ffd93d 0%, #ff9f43 100%)';
        } else {
            gradient = 'conic-gradient(from 0deg, #ff6b6b 0%, #ee5a52 100%)';
        }
        
        scoreCircle.style.background = gradient;
    }

    getBestFishingTime() {
        const now = new Date();
        const sunrise = new Date(now);
        sunrise.setHours(6, 30, 0); // Approximate sunrise
        
        const sunset = new Date(now);
        sunset.setHours(19, 0, 0); // Approximate sunset
        
        return `${sunrise.getHours()}:${sunrise.getMinutes().toString().padStart(2, '0')} - ${sunset.getHours()}:${sunset.getMinutes().toString().padStart(2, '0')}`;
    }

    updateFiveDayForecast(location) {
        const forecastGrid = document.getElementById('forecast-grid');
        const forecasts = [];
        
        // Generate 5-day forecast data
        for (let i = 1; i <= 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            const forecast = {
                date: date.toLocaleDateString('ka-GE', { weekday: 'long', day: 'numeric', month: 'short' }),
                score: Math.round(Math.random() * 6 + 4), // 4-10 range
                temperature: Math.round(Math.random() * 25 + 10),
                conditions: this.getRandomConditions(),
                wind: Math.round(Math.random() * 20 + 5),
                precipitation: Math.round(Math.random() * 10)
            };
            
            forecasts.push(forecast);
        }
        
        forecastGrid.innerHTML = forecasts.map(forecast => `
            <div class="forecast-card">
                <div class="forecast-date">${forecast.date}</div>
                <div class="forecast-score ${this.getScoreClass(forecast.score)}">${forecast.score}/10</div>
                <div class="forecast-weather">
                    <span class="weather-temp">${forecast.temperature}°C</span>
                    <span class="weather-icon">${forecast.conditions.icon}</span>
                </div>
                <div class="forecast-conditions">
                    <div>ქარი: ${forecast.wind} კმ/სთ</div>
                    <div>ნალექი: ${forecast.precipitation} მმ</div>
                    <div>${forecast.conditions.description}</div>
                </div>
            </div>
        `).join('');
    }

    getRandomConditions() {
        const conditions = [
            { icon: '☀️', description: 'მზიანი' },
            { icon: '⛅', description: 'ნაწილობრივ ღრუბლიანი' },
            { icon: '☁️', description: 'ღრუბლიანი' },
            { icon: '🌦️', description: 'მსუბუქი წვიმა' },
            { icon: '🌧️', description: 'წვიმა' },
            { icon: '⛈️', description: 'ქარიშხალი' }
        ];
        
        return conditions[Math.floor(Math.random() * conditions.length)];
    }

    getScoreClass(score) {
        if (score >= 8) return 'score-excellent';
        if (score >= 6) return 'score-good';
        if (score >= 4) return 'score-fair';
        return 'score-poor';
    }

    showError(message) {
        // Simple error handling - in production, you'd want a more sophisticated approach
        alert(message);
    }
}

// Tab switching functionality
function switchSearchMode(mode) {
    const searchTab = document.getElementById('search-tab');
    const mapTab = document.getElementById('map-tab');
    const searchMode = document.getElementById('search-mode');
    const mapMode = document.getElementById('map-mode');

    if (mode === 'search') {
        searchTab.classList.add('active');
        mapTab.classList.remove('active');
        searchMode.style.display = 'block';
        mapMode.style.display = 'none';
    } else if (mode === 'map') {
        searchTab.classList.remove('active');
        mapTab.classList.add('active');
        searchMode.style.display = 'none';
        mapMode.style.display = 'block';
        
        // Refresh map size when switching to map mode
        setTimeout(() => {
            if (window.fishingApp && window.fishingApp.map) {
                window.fishingApp.map.invalidateSize();
            }
        }, 100);
    }
}

// Global variable to access the app instance
let fishingApp;

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fishingApp = new FishingForecast();
    window.fishingApp = fishingApp; // Make globally accessible for popup callbacks
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});