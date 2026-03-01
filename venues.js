const cityDropdown = document.getElementById('city-selector');
const statusDropdown = document.getElementById('status-selector');

let venueAPIData = "";

async function renderVenues()
{
    try {
        const data = await fetchSheetData('venues');
        venueAPIData = data;
        displayVenuesInHTML(cityDropdown.options[cityDropdown.selectedIndex].text, statusDropdown.options[statusDropdown.selectedIndex].text, 'venue-names', data);
    } catch (err) {
        console.error('Failed to load venues:', err);
    }
}

// Wait for DOM to be ready before rendering
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderVenues);
} else {
    // DOM is already ready
    renderVenues();
}

function displayVenuesInHTML(venueString, statusString, containerId, venueData) {
  const headers = venueData.values[0];
  const venueRows = venueData.values.slice(1);

  // Get column indices
  const nameIndex = headers.indexOf('name');
  const cityColumnIndex = headers.indexOf('location_city');
  const addressIndex = headers.indexOf('location_address');
  const statusIndex = headers.indexOf('status');
  const linkIndex = headers.indexOf('link');
  const loreIndex = headers.indexOf('lore');

  // Filter venues
  let matchingVenues = venueRows.filter(row => row[cityColumnIndex] === venueString);

  if (statusString !== "")
  {
      matchingVenues = matchingVenues.filter(row => row[statusIndex] === statusString);
  }

  const container = document.getElementById(containerId);

  if (matchingVenues.length > 0) {
    let html = '';

    matchingVenues.forEach(venue => {
      html += '<div class="venue-card sunken-panel">';

      // Venue name
      html += `<h4>${venue[nameIndex] || 'Unknown Venue'}</h4>`;
      // Address
      if (venue[addressIndex]) {
        html += `<p><strong>Address:</strong> ${venue[addressIndex]}</p>`;
      }

      // City
      if (venue[cityColumnIndex]) {
        html += `<p><strong>City:</strong> ${venue[cityColumnIndex]}</p>`;
      }

      // Status
      if (venue[statusIndex]) {
        html += `<p><strong>Status:</strong> ${venue[statusIndex]}</p>`;
      }

      // Website link
      if (venue[linkIndex]) {
        html += `<div class="venue-links"><a href="${venue[linkIndex]}" target="_blank">🔗 Website</a></div>`;
      }

      // Lore/Editor's note
      if (venue[loreIndex]) {
        html += `<p class="lore-note"><strong>Editor's Note:</strong> ${venue[loreIndex]}</p>`;
      }

      html += '</div>';
    });

    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No venues found for ${venueString}.</p>`;
  }
}


cityDropdown.addEventListener(
     'change',
     function() { displayVenuesInHTML(cityDropdown.options[cityDropdown.selectedIndex].text,statusDropdown.options[statusDropdown.selectedIndex].text, 'venue-names', venueAPIData); },
     false
  );

  
statusDropdown.addEventListener(
     'change',
     function() { displayVenuesInHTML(cityDropdown.options[cityDropdown.selectedIndex].text,statusDropdown.options[statusDropdown.selectedIndex].text, 'venue-names', venueAPIData); },
     false
  );