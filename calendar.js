const calendarDates = document.querySelector('.calendar-dates');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

let gigAPIData = "";

function getGoogleApiKey() {
  return "";
}

function getGoogleSheetsID() {
  return "";
}

window.onload = function(){
    var apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${getGoogleSheetsID()}/values/gig%20calendar?key=${getGoogleApiKey()}`;
    fetch(apiUrl).then(response => {
        return response.json();
    }).then(data => {
        gigAPIData = data;
    }).catch(err => {
      // Do something for an error here
    });
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function renderCalendar(month, year) {
  calendarDates.innerHTML = '';
  monthYear.textContent = `${months[month]} ${year}`;

  // Get the first day of the month
  const firstDay = new Date(year, month, 1).getDay();

  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create blanks for days of the week before the first day
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    calendarDates.appendChild(blank);
  }

  // Populate the days
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.textContent = i;
    calendarDates.appendChild(day);
  }
  // Get today's date
  const today = new Date();

  // Populate the days
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.textContent = i;

    // Highlight today's date
    //if (
   //   i === today.getDate() &&
    //  year === today.getFullYear() &&
    //  month === today.getMonth()
    //) {
   //   day.classList.add('current-date');
   // }

   // calendarDates.appendChild(day);
  }
  if (gigAPIData != null && gigAPIData != "")
  {
    var monthString = `${today.getMonth()+1}`
    if (monthString.length == 1){
        monthString = "0" + monthString;
    }
    var dayString = `${today.getDate()}`
    if (dayString.length == 1){
        dayString = "0" + dayString;
    }
    displayGigsInHTML(`${dayString}/${monthString}/${currentYear}`,"gig-events",gigAPIData); // Find gigs on specific date
}
}

renderCalendar(currentMonth, currentYear);

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
  if (e.target.textContent !== '') {
      if (gigAPIData != null && gigAPIData != "")
  {
    var monthString = `${currentMonth+1}`
    if (monthString.length == 1){
        monthString = "0" + monthString;
    }
    var dayString = `${e.target.textContent}`
    if (dayString.length == 1){
        dayString = "0" + dayString;
    }
    displayGigsInHTML(`${dayString}/${monthString}/${currentYear}`,"gig-events",gigAPIData); // Find gigs on specific date
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
  const dateColumnIndex = headers.indexOf('Date');
  
  const matchingGigs = gigRows.filter(row => row[dateColumnIndex] === dateString);
  const container = document.getElementById(containerId);
  
  if (matchingGigs.length > 0) {
    let html = `<h3>Gigs on ${dateString}</h3>`;
    matchingGigs.forEach(gig => {
      html += `
        <div class="gig-card">
          <h4>${gig[0]}</h4> <!-- Headliner -->
          <p><strong>Supports:</strong> ${gig[1] || 'None'}</p>
          <p><strong>Venue:</strong> ${gig[3]}, ${gig[2]}</p>
          <p><strong>Date:</strong> ${gig[4]}</p>
          ${gig[5] ? `<a href="${gig[5]}" target="_blank">More Info</a>` : ''}
        </div>
      `;
    });
    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No gigs found for ${dateString}</p>`;
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