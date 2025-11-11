import {featuredItemsApiData} from '/consts.js'

async function renderFeaturedVenues()
{
    try {
        displayFeaturedVenuesInHTML('featured-venues-content', featuredItemsApiData);
    } catch (err) {
        console.error('Failed to load featured artists:', err);
    }
}

// Wait for DOM to be ready before rendering
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFeaturedVenues);
} else {
    // DOM is already ready
    renderFeaturedVenues();
}

function displayFeaturedVenuesInHTML(containerId, featureData) {
  const headers = featureData.values[0];
  const featureRows = featureData.values.slice(1);

  // Get column indices
  const promoterIndex = headers.indexOf('promoter');
  const valueIndex = headers.indexOf('value');
  const linkIndex = headers.indexOf('link');
  const typeIndex = headers.indexOf('type');
  const otherIndex = headers.indexOf('other info');
  const editIndex = headers.indexOf('Editors Note');

  // Filter venues
  let matchingValues = featureRows.filter(row => row[typeIndex] === 'venue');

  const container = document.getElementById(containerId);

  if (matchingValues.length > 0) {
    let html = '';

    matchingValues.forEach(value => {
      html += '<div class="artist-card sunken-panel">';

      // Venue name
      html += `<h4>${value[valueIndex] || 'Unknown Item'}</h4>`;

      if (value[otherIndex]) {
        html += `<p><strong>Location:</strong> ${value[otherIndex]}</p>`;
      }

      if (value[promoterIndex]) {
        html += `<p><strong>Recommended By:</strong> ${value[promoterIndex]}</p>`;
      }

            // Website link
      if (value[linkIndex]) {
        html += `<div class="venue-links"><a href="${value[linkIndex]}" target="_blank">🔗 Website</a></div>`;
      }

      // Lore/Editor's note
      if (value[editIndex]) {
        html += `<p class="lore-note"><strong>Editor's Note:</strong> ${value[editIndex]}</p>`;
      }

      html += '</div>';
    });

    container.innerHTML = html;
  } else {
    container.innerHTML = `<p></p>`;
  }
}