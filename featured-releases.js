import {featuredItemsApiData} from '/consts.js'
import {SocialCalls} from '/consts.js'

async function renderFeaturedReleases()
{
    try {
        displayFeaturedArtistsInHTML('featured-releases-content', featuredItemsApiData);
    } catch (err) {
        console.error('Failed to load featured artists:', err);
    }
}

// Wait for DOM to be ready before rendering
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFeaturedReleases);
} else {
    // DOM is already ready
    renderFeaturedReleases();
}

function displayFeaturedArtistsInHTML(containerId, featureData) {
  const headers = featureData.values[0];
  const featureRows = featureData.values.slice(1);

  // Get column indices
  const promoterIndex = headers.indexOf('promoter');
  const valueIndex = headers.indexOf('value');
  const linkIndex = headers.indexOf('link');
  const otherIndex = headers.indexOf('other info');
  const typeIndex = headers.indexOf('type');
  const editIndex = headers.indexOf('Editors Note');

  // Filter venues
  let matchingValues = featureRows.filter(row => row[typeIndex] === 'release');

  const container = document.getElementById(containerId);

  if (matchingValues.length > 0) {
    let html = '';

    matchingValues.forEach(value => {
      html += '<div class="artist-card sunken-panel">';

      // Venue name
      html += `<h4>${value[valueIndex] || 'Unknown Item'}</h4>`;

      if (value[otherIndex]) {
        html += `<p><strong>Release Name:</strong> ${value[otherIndex]}</p>`;
      }

      // Address
      if (value[promoterIndex]) {
        html += `<p><strong>Recommended By:</strong> ${value[promoterIndex]}</p>`;
      }

      // Social links
      if (value[linkIndex] && value[linkIndex] !== "") {
        html += '<div class="social-links">';
        let links = value[linkIndex].split("\n");
        links.forEach(link => {
          html += SocialCalls.getSocialImage(link)
        });
        html += '</div>';
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