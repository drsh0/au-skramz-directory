const calendarDates = document.querySelector('.calendar-dates');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

let gigAPIData = "";
let selectedDate = null;

async function loadCalendarData() {
    try {
        const data = await fetchSheetData('gig calendar');
        gigAPIData = data;
        // Re-render calendar after data is loaded to show gig highlighting
        renderCalendar(currentMonth, currentYear);
    } catch (err) {
        console.error('Failed to load gig calendar:', err);
    }
}

// Wait for DOM to be ready before loading calendar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCalendarData);
} else {
    // DOM is already ready
    loadCalendarData();
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Check if a date has gigs scheduled
function hasGigOnDate(day, month, year) {
  if (!gigAPIData || !gigAPIData.values) return false;

  const dateString = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
  const headers = gigAPIData.values[0];
  const dateIndex = headers.indexOf('Date');
  const gigRows = gigAPIData.values.slice(1);

  return gigRows.some(row => row[dateIndex] === dateString);
}

function renderCalendar(month, year) {
  calendarDates.innerHTML = '';
  monthYear.textContent = `${months[month]} ${year}`;

  // Get the first day of the month
  const firstDay = new Date(year, month, 1).getDay();

  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get today's date
  const today = new Date();

  // Create blanks for days of the week before the first day
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    calendarDates.appendChild(blank);
  }

  // Populate the days
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.textContent = i;
    day.dataset.day = i;

    // Highlight today's date
    if (
      i === today.getDate() &&
      year === today.getFullYear() &&
      month === today.getMonth()
    ) {
      day.classList.add('current-date');
    }

    // Highlight dates with gigs
    if (hasGigOnDate(i, month, year)) {
      day.classList.add('has-gig');
    }

    // Highlight selected date
    if (selectedDate &&
        selectedDate.day === i &&
        selectedDate.month === month &&
        selectedDate.year === year) {
      day.classList.add('selected-date');
    }

    calendarDates.appendChild(day);
  }

  // Show today's gigs on initial load if no date is selected
  if (gigAPIData != null && gigAPIData != "" && !selectedDate) {
    const monthString = String(today.getMonth() + 1).padStart(2, '0');
    const dayString = String(today.getDate()).padStart(2, '0');
    displayGigsInHTML(`${dayString}/${monthString}/${today.getFullYear()}`, "gig-events", gigAPIData);
  }
}

// Calendar will be rendered after data loads in loadCalendarData()

prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
});

calendarDates.addEventListener('click', (e) => {
  if (e.target.textContent !== '' && e.target.dataset.day) {
    const day = parseInt(e.target.dataset.day);

    // Update selected date
    selectedDate = {
      day: day,
      month: currentMonth,
      year: currentYear
    };

    // Re-render calendar to show selection
    renderCalendar(currentMonth, currentYear);

    // Display gigs for selected date
    if (gigAPIData != null && gigAPIData != "") {
      const monthString = String(currentMonth + 1).padStart(2, '0');
      const dayString = String(day).padStart(2, '0');
      displayGigsInHTML(`${dayString}/${monthString}/${currentYear}`, "gig-events", gigAPIData);
    }
  }
});

// Function to parse and display gigs based on date matching
function filterAndDisplayGigs(dateString, gigData) {
  const headers = gigData.values[0];
  const gigRows = gigData.values.slice(1); // Skip header row
  
  // Find the date column index
  const dateColumnIndex = headers.indexOf('Date');
  
  // Filter gigs by date
  const matchingGigs = gigRows.filter(row => {
    return row[dateColumnIndex] === dateString;
  });
  
  // Display results
  if (matchingGigs.length > 0) {
    console.log(`Gigs on ${dateString}:`);
    matchingGigs.forEach(gig => {
      const gigObject = {};
      headers.forEach((header, index) => {
        gigObject[header] = gig[index] || '';
      });
      console.log(gigObject);
    });
  } else {
    console.log(`No gigs found for ${dateString}`);
  }
  
  return matchingGigs;
}

// Function to display gigs in HTML
function displayGigsInHTML(dateString, containerId, gigData) {
  const headers = gigData.values[0];
  const gigRows = gigData.values.slice(1);

  // Get column indices
  const headlinerIndex = headers.indexOf('Headliner');
  const supportsIndex = headers.indexOf('Supports');
  const cityIndex = headers.indexOf('City');
  const venueIndex = headers.indexOf('Venue');
  const dateIndex = headers.indexOf('Date');
  const linkIndex = headers.indexOf('info link');

  const matchingGigs = gigRows.filter(row => row[dateIndex] === dateString);
  const container = document.getElementById(containerId);

  if (matchingGigs.length > 0) {
    let html = `<h3>Gigs on ${dateString}</h3>`;
    matchingGigs.forEach(gig => {
      html += '<div class="gig-card sunken-panel">';
      html += `<h4>${gig[headlinerIndex] || 'Unknown Headliner'}</h4>`;

      if (gig[supportsIndex]) {
        html += `<p><strong>Supports:</strong> ${gig[supportsIndex]}</p>`;
      }

      if (gig[venueIndex] || gig[cityIndex]) {
        html += `<p><strong>Venue:</strong> ${gig[venueIndex] || ''} ${gig[cityIndex] ? ', ' + gig[cityIndex] : ''}</p>`;
      }

      if (gig[dateIndex]) {
        html += `<p><strong>Date:</strong> ${gig[dateIndex]}</p>`;
      }

      if (gig[linkIndex]) {
        html += `<div class="gig-links"><a href="${gig[linkIndex]}" target="_blank">🔗 More Info</a></div>`;
      }

      html += '</div>';
    });
    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No gigs found for ${dateString}.</p>`;
  }
}

// Function to get gigs within a date range
function getGigsInDateRange(startDate, endDate, gigData) {
  const headers = gigData.values[0];
  const gigRows = gigData.values.slice(1);
  const dateColumnIndex = headers.indexOf('Date');
  
  // Convert date strings to Date objects for comparison
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  return gigRows.filter(row => {
    const gigDate = parseDate(row[dateColumnIndex]);
    return gigDate >= start && gigDate <= end;
  });
}

// Helper function to parse DD/MM/YYYY format
function parseDate(dateString) {
  if (!dateString) return null;
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
}