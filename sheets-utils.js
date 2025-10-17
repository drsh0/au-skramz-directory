// Utility functions for fetching and parsing public Google Sheets data

// Published spreadsheet ID
const PUBLISHED_SHEET_ID = '2PACX-1vRJQcCBRIyvqUrH0jmWHEh_xiFB3Bz8JNMCgJZ2l13xsz1AP2RDfk0S7xPW8XyArB2cR-Yf2pSwNfeI';

// Sheet GIDs
const SHEET_GIDS = {
  'artists': '0',
  'venues': '956146563',
  'labels': '2047005466',
  'gig calendar': '300002002',
  'interviews': '877331143',
  'live sets': '489360706',
  'featured': '179753337'
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Parse CSV text into a 2D array
 * @param {string} csv - The CSV text to parse
 * @returns {Array<Array<string>>} - 2D array of values
 */
function parseCSV(csv) {
  const lines = [];
  let currentLine = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      currentLine.push(currentValue);
      currentValue = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      // End of line
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n in \r\n
      }
      if (currentValue !== '' || currentLine.length > 0) {
        currentLine.push(currentValue);
        lines.push(currentLine);
        currentLine = [];
        currentValue = '';
      }
    } else {
      currentValue += char;
    }
  }

  // Add last field and line
  if (currentValue !== '' || currentLine.length > 0) {
    currentLine.push(currentValue);
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Get cached data if valid
 * @param {string} sheetName - Name of the sheet
 * @returns {Object|null} - Cached data or null if not found/expired
 */
function getCachedData(sheetName) {
  try {
    const cacheKey = `sheets_cache_${sheetName}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION) {
      console.log(`Using cached data for ${sheetName} (${Math.round((CACHE_DURATION - (now - timestamp)) / 1000)}s remaining)`);
      return data;
    } else {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      return null;
    }
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

/**
 * Store data in cache
 * @param {string} sheetName - Name of the sheet
 * @param {Object} data - Data to cache
 */
function setCachedData(sheetName, data) {
  try {
    const cacheKey = `sheets_cache_${sheetName}`;
    const cacheData = {
      data: data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`Cached data for ${sheetName}`);
  } catch (error) {
    console.warn('Cache write error (localStorage might be full):', error);
  }
}

/**
 * Fetch and parse a Google Sheet as CSV
 * @param {string} sheetName - Name of the sheet (e.g., 'artists', 'venues')
 * @param {boolean} forceRefresh - Skip cache and force fresh fetch
 * @returns {Promise<{values: Array<Array<string>>}>} - Parsed data in same format as Sheets API
 */
async function fetchSheetData(sheetName, forceRefresh = false) {
  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cached = getCachedData(sheetName);
    if (cached) {
      // Return as resolved promise to ensure consistent async behavior
      return Promise.resolve(cached);
    }
  }

  const gid = SHEET_GIDS[sheetName];
  if (!gid) {
    throw new Error(`Unknown sheet name: ${sheetName}`);
  }

  const url = `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;

  console.log(`Fetching fresh data for ${sheetName}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status}`);
  }

  const csvText = await response.text();
  const values = parseCSV(csvText);

  // Return in same format as Google Sheets API for compatibility
  const data = { values };

  // Cache the data
  setCachedData(sheetName, data);

  return data;
}

/**
 * Clear all cached sheet data
 * Useful for debugging or forcing a fresh reload
 */
function clearSheetCache() {
  try {
    Object.keys(SHEET_GIDS).forEach(sheetName => {
      const cacheKey = `sheets_cache_${sheetName}`;
      localStorage.removeItem(cacheKey);
    });
    console.log('All sheet caches cleared');
  } catch (error) {
    console.warn('Error clearing cache:', error);
  }
}

// Make clearSheetCache available globally for debugging
// Users can call clearSheetCache() in browser console to force refresh
window.clearSheetCache = clearSheetCache;
