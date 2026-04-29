/**
 * Interactive World Map - Utility Functions and Examples
 * Helper functions for common use cases
 */

const MapUtils = {
  /**
   * Generate random sample data for testing
   * @param {number} countries - Number of countries to generate data for
   * @returns {Object} Country data object
   */
  generateSampleData(countries = 20) {
    const codes = ['USA', 'GBR', 'FRA', 'DEU', 'JPN', 'CHN', 'IND', 'BRA', 'CAN', 'AUS', 
                   'MEX', 'ITA', 'ESP', 'KOR', 'TUR', 'NLD', 'SAU', 'CHE', 'SWE', 'NOR',
                   'POL', 'BEL', 'AUT', 'DNK', 'FIN', 'IRL', 'NZL', 'SGP', 'ARE', 'ZAF'];
    
    const data = {};
    const selectedCodes = codes.slice(0, Math.min(countries, codes.length));
    
    selectedCodes.forEach(code => {
      data[code] = Math.floor(Math.random() * 100);
    });
    
    return data;
  },

  /**
   * Generate random markers for testing
   * @param {number} count - Number of markers to generate
   * @returns {Array} Array of marker objects
   */
  generateSampleMarkers(count = 5) {
    const cities = [
      { name: 'New York', lat: 40.7128, lon: -74.0060 },
      { name: 'London', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
      { name: 'Paris', lat: 48.8566, lon: 2.3522 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
      { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
      { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
      { name: 'Berlin', lat: 52.5200, lon: 13.4050 }
    ];

    return cities.slice(0, count).map(city => ({
      location: city.name,
      lat: city.lat,
      lon: city.lon,
      size: Math.floor(Math.random() * 30) + 10,
      text: `${city.name}<br>Random value: ${Math.floor(Math.random() * 1000)}`
    }));
  },

  /**
   * Convert CSV string to map data
   * @param {string} csv - CSV string with country code and value columns
   * @returns {Object} Country data object
   */
  csvToMapData(csv) {
    const lines = csv.trim().split('\n');
    const data = {};
    
    lines.slice(1).forEach(line => {
      const [code, value] = line.split(',').map(s => s.trim());
      if (code && value) {
        data[code.toUpperCase()] = parseFloat(value);
      }
    });
    
    return data;
  },

  /**
   * Sort countries by value
   * @param {Object} data - Country data
   * @param {boolean} ascending - Sort order
   * @returns {Array} Sorted array of [code, value] pairs
   */
  sortByValue(data, ascending = false) {
    const entries = Object.entries(data);
    entries.sort((a, b) => ascending ? a[1] - b[1] : b[1] - a[1]);
    return entries;
  },

  /**
   * Get top N countries by value
   * @param {Object} data - Country data
   * @param {number} n - Number of top countries
   * @returns {Object} Filtered country data
   */
  getTopCountries(data, n = 10) {
    const sorted = this.sortByValue(data, false);
    const result = {};
    sorted.slice(0, n).forEach(([code, value]) => {
      result[code] = value;
    });
    return result;
  },

  /**
   * Normalize values to 0-100 range
   * @param {Object} data - Country data
   * @returns {Object} Normalized country data
   */
  normalizeValues(data) {
    const values = Object.values(data);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    const normalized = {};
    for (const [code, value] of Object.entries(data)) {
      normalized[code] = range > 0 ? ((value - min) / range) * 100 : 50;
    }
    return normalized;
  },

  /**
   * Merge multiple datasets
   * @param {Array} datasets - Array of country data objects
   * @param {string} method - Merge method: 'sum', 'average', 'max', 'min'
   * @returns {Object} Merged country data
   */
  mergeData(datasets, method = 'average') {
    const merged = {};
    const counts = {};
    
    datasets.forEach(data => {
      for (const [code, value] of Object.entries(data)) {
        if (!merged[code]) {
          merged[code] = 0;
          counts[code] = 0;
        }
        
        switch(method) {
          case 'sum':
          case 'average':
            merged[code] += value;
            counts[code]++;
            break;
          case 'max':
            merged[code] = Math.max(merged[code], value);
            break;
          case 'min':
            merged[code] = counts[code] === 0 ? value : Math.min(merged[code], value);
            counts[code]++;
            break;
        }
      }
    });
    
    if (method === 'average') {
      for (const code in merged) {
        merged[code] /= counts[code];
      }
    }
    
    return merged;
  },

  /**
   * Filter countries by region
   * @param {Object} data - Country data
   * @param {string} region - Region name
   * @returns {Object} Filtered country data
   */
  filterByRegion(data, region) {
    const regions = {
      'north-america': ['USA', 'CAN', 'MEX'],
      'south-america': ['BRA', 'ARG', 'CHL', 'COL', 'PER', 'VEN', 'ECU', 'BOL', 'PRY', 'URY'],
      'europe': ['GBR', 'FRA', 'DEU', 'ITA', 'ESP', 'POL', 'NLD', 'BEL', 'GRC', 'PRT', 'AUT', 'CHE', 'SWE', 'NOR', 'DNK', 'FIN', 'IRL'],
      'asia': ['CHN', 'JPN', 'IND', 'KOR', 'THA', 'VNM', 'IDN', 'MYS', 'SGP', 'PHL', 'PAK', 'BGD'],
      'middle-east': ['SAU', 'ARE', 'IRN', 'IRQ', 'ISR', 'JOR', 'KWT', 'QAT', 'TUR'],
      'africa': ['ZAF', 'EGY', 'NGA', 'KEN', 'ETH', 'GHA', 'TZA', 'UGA', 'DZA', 'MAR'],
      'oceania': ['AUS', 'NZL', 'PNG', 'FJI']
    };
    
    const regionCodes = regions[region.toLowerCase()] || [];
    const filtered = {};
    
    for (const code of regionCodes) {
      if (data[code] !== undefined) {
        filtered[code] = data[code];
      }
    }
    
    return filtered;
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapUtils;
}
if (typeof window !== 'undefined') {
  window.MapUtils = MapUtils;
}
