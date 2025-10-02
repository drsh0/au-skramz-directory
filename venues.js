const cityDropdown = document.getElementById('city-selector');

function getGoogleApiKey() {
  return "";
}

function getGoogleSheetsID() {
  return "";
}

let venueAPIData = "";

function renderVenues()
{
    console.log("TESTING");
    var apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${getGoogleSheetsID()}/values/venues?key=${getGoogleApiKey()}`;
    fetch(apiUrl).then(response => {
        return response.json();
    }).then(data => {
        displayVenuesInHTML(cityDropdown.options[cityDropdown.selectedIndex].text,'venue-names', data);
    }).catch(err => {
      // Do something for an error here
    });
}

renderVenues()

function displayVenuesInHTML(venueString, containerId, venueData) {
  const headers = venueData.values[0];
  const venueRows = venueData.values.slice(1);
  const cityColumnIndex = headers.indexOf('location_city');
  
  const matchingVenues = venueRows.filter(row => row[cityColumnIndex] === venueString);
  const container = document.getElementById(containerId);
  
  if (matchingVenues.length > 0) {
    let html = '';
    matchingVenues.forEach(gig => {
      html += `
        <div class="venue-card">
          <h4>${gig[0]}</h5> <!-- Headliner -->
          <p><strong>Location:</strong> ${gig[2]}</p>
          <p><strong>Status:</strong> ${gig[3] ? gig[3] : 'Unknown'}</p>
          ${gig[4] ? `<a href="${gig[4]}" target="_blank">More Info</a>` : ''}
        </div>
      `;
    });
    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No gigs found for ${venueString}</p>`;
  }
}


cityDropdown.addEventListener(
     'change',
     function() { renderVenues(); },
     false
  );