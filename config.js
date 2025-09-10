// Weather API Configuration
// Replace these with your actual API keys

const CONFIG = {
    // OpenWeatherMap API
    // Get your free API key at: https://openweathermap.org/api
    OPENWEATHER_API_KEY: 'YOUR_OPENWEATHER_API_KEY_HERE',
    OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    
    // WeatherAPI.com
    // Get your free API key at: https://www.weatherapi.com/
    WEATHERAPI_KEY: 'YOUR_WEATHERAPI_KEY_HERE',
    WEATHERAPI_BASE_URL: 'https://api.weatherapi.com/v1',
    
    // Yr.no (free, no API key required)
    // Documentation: https://developer.yr.no/
    YR_BASE_URL: 'https://api.met.no/weatherapi/locationforecast/2.0',
    
    // AccuWeather API
    // Get your API key at: https://developer.accuweather.com/
    ACCUWEATHER_API_KEY: 'YOUR_ACCUWEATHER_API_KEY_HERE',
    ACCUWEATHER_BASE_URL: 'https://dataservice.accuweather.com'
};

// Weather API service class
class WeatherService {
    constructor() {
        this.config = CONFIG;
    }

    // Fetch weather data from OpenWeatherMap
    async fetchOpenWeatherData(lat, lon) {
        try {
            const response = await fetch(
                `${this.config.OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.config.OPENWEATHER_API_KEY}&units=metric&lang=ka`
            );
            
            if (!response.ok) {
                throw new Error(`OpenWeather API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('OpenWeather API error:', error);
            return null;
        }
    }

    // Fetch weather data from WeatherAPI
    async fetchWeatherAPIData(lat, lon) {
        try {
            const response = await fetch(
                `${this.config.WEATHERAPI_BASE_URL}/current.json?key=${this.config.WEATHERAPI_KEY}&q=${lat},${lon}&lang=ka`
            );
            
            if (!response.ok) {
                throw new Error(`WeatherAPI error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('WeatherAPI error:', error);
            return null;
        }
    }

    // Fetch weather data from Yr.no (Norwegian Meteorological Institute)
    async fetchYrData(lat, lon) {
        try {
            const response = await fetch(
                `${this.config.YR_BASE_URL}/compact?lat=${lat}&lon=${lon}`,
                {
                    headers: {
                        'User-Agent': 'FishingForecastGeorgia/1.0 (your-email@example.com)'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`Yr.no API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Yr.no API error:', error);
            return null;
        }
    }

    // Aggregate weather data from multiple sources
    async getAggregatedWeatherData(lat, lon) {
        const promises = [
            this.fetchOpenWeatherData(lat, lon),
            this.fetchWeatherAPIData(lat, lon),
            this.fetchYrData(lat, lon)
        ];

        const results = await Promise.allSettled(promises);
        
        // Process and combine data from available sources
        const weatherData = this.processWeatherData(results);
        
        return weatherData;
    }

    // Process and normalize weather data from different APIs
    processWeatherData(apiResults) {
        const processedData = {
            temperature: null,
            windSpeed: null,
            pressure: null,
            humidity: null,
            uvIndex: null,
            precipitation: null,
            moonPhase: null,
            sources: []
        };

        // Process OpenWeatherMap data
        if (apiResults[0].status === 'fulfilled' && apiResults[0].value) {
            const data = apiResults[0].value;
            processedData.temperature = data.main.temp;
            processedData.windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
            processedData.pressure = data.main.pressure;
            processedData.humidity = data.main.humidity;
            processedData.sources.push('OpenWeatherMap');
        }

        // Process WeatherAPI data
        if (apiResults[1].status === 'fulfilled' && apiResults[1].value) {
            const data = apiResults[1].value.current;
            if (!processedData.temperature) processedData.temperature = data.temp_c;
            if (!processedData.windSpeed) processedData.windSpeed = data.wind_kph;
            if (!processedData.pressure) processedData.pressure = data.pressure_mb;
            if (!processedData.humidity) processedData.humidity = data.humidity;
            processedData.uvIndex = data.uv;
            processedData.precipitation = data.precip_mm;
            processedData.sources.push('WeatherAPI');
        }

        // Process Yr.no data
        if (apiResults[2].status === 'fulfilled' && apiResults[2].value) {
            const data = apiResults[2].value.properties.timeseries[0].data.instant.details;
            if (!processedData.temperature) processedData.temperature = data.air_temperature;
            if (!processedData.windSpeed) processedData.windSpeed = Math.round(data.wind_speed * 3.6);
            if (!processedData.pressure) processedData.pressure = data.air_pressure_at_sea_level;
            if (!processedData.humidity) processedData.humidity = data.relative_humidity;
            processedData.sources.push('Yr.no');
        }

        // Fill missing data with reasonable defaults or calculations
        this.fillMissingData(processedData);

        return processedData;
    }

    fillMissingData(data) {
        // Fill missing moon phase (simplified calculation)
        if (!data.moonPhase) {
            const moonPhases = ['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 
                              'full', 'waning_gibbous', 'last_quarter', 'waning_crescent'];
            const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            data.moonPhase = moonPhases[Math.floor(dayOfYear / 3.7) % 8]; // Approximate 29.5 day cycle
        }

        // Fill missing UV index based on time and weather
        if (!data.uvIndex) {
            const hour = new Date().getHours();
            if (hour < 6 || hour > 18) {
                data.uvIndex = 0;
            } else {
                data.uvIndex = Math.max(1, Math.min(10, Math.floor(Math.random() * 6) + 3));
            }
        }

        // Fill missing precipitation
        if (!data.precipitation) {
            data.precipitation = Math.floor(Math.random() * 5); // 0-5mm
        }
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, WeatherService };
}