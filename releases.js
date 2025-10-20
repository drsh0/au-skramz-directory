import {itemsPerPage} from '/consts.js'
import {SocialCalls} from '/consts.js'

let releasesAPIData = "";
let currentReleasePage = 1;

HTMLSelectElement.prototype.contains = function( value ) {
    if (value == null)
    {
        return true;
    }
    if (value.trim() == "")
    {
        return true;
    }
    for ( var i = 0, l = this.options.length; i < l; i++ ) {

        if ( this.options[i].text == value ) {
            return true;

        }

    }
    return false;

}

async function renderReleases()
{
    try {
        const data = await fetchSheetData('releases');
        releasesAPIData = data;
        const releaseRows = data.values.slice(1);
        console.log(releaseRows.length);
        displayReleasesInHTML(
             'releases-names', releasesAPIData);
    } catch (err) {
        console.error('Failed to load releases:', err);
    }
}

// Wait for DOM to be ready before rendering
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderReleases);
} else {
    // DOM is already ready
    renderReleases();
}

function displayReleasesInHTML(containerId, releaseAPIData) {
  const headers = releaseAPIData.values[0];
  const releaseRows = releaseAPIData.values.slice(1);

  const artistIndex = headers.indexOf('Artist(s)');
  const linkIndex = headers.indexOf('link');
  const artworklinkIndex = headers.indexOf('Artwork Link');
  const nameIndex = headers.indexOf('Release Name');
  const dateIndex = headers.indexOf('Release Date');
  const editorsNoteIndex = headers.indexOf('Editors Note');

  let matchingReleases = releaseRows;


  // Pagination logic
  const totalItems = matchingReleases.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentReleasePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLiveSets = matchingReleases.slice(startIndex, endIndex);

  const container = document.getElementById(containerId);

  if (matchingReleases.length > 0) {
    let html = '';

    // Pagination controls at top
    html += '<div class="pagination-controls">';
    html += `<p>Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} releases</p>`;
    html += '<div class="pagination-buttons">';
    html += `<button ${currentReleasePage === 1 ? 'disabled' : ''} onclick="prevPage()">‹ Previous</button>`;
    html += `<span>Page ${currentReleasePage} of ${totalPages}</span>`;
    html += `<button ${currentReleasePage === totalPages ? 'disabled' : ''} onclick="nextPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    // Artist cards
    paginatedLiveSets.forEach(release => {
      html += '<div class="artist-card sunken-panel">';
      html += '<div class="live-set-card sunken-panel">';
      html += `<div><h4>${release[artistIndex] || 'Unknown'}</h4>`;
      html += `<h4>${release[nameIndex] || 'Unknown'}</h4>`;


        if (release[dateIndex]) {
            html += `<p><strong>Date:</strong> ${release[dateIndex]}</p>`;
        }
              // Social links
      if (release[linkIndex] && release[linkIndex] !== "") {
        html += '<div class="social-links">';
        let links = release[linkIndex].split("\n");
        links.forEach(link => {
          html += SocialCalls.getSocialImage(link)
        });
        html += "</div>"
    }
    html += "</div>"
      // Artwork links
      if (release[artworklinkIndex] && release[artworklinkIndex] !== "") {
        html += '<div class="live-set-image">';
        html += `<a target="_blank" title="${release[nameIndex]}"><img src="${release[artworklinkIndex]}" class="live-set-image"></a>`;
        html += '</div>';
      }
        html += '</div>';
      // Lore/Editor's note
      if (release[editorsNoteIndex]) {
        html += `<p class="lore-note"><strong>Editor's Note:</strong> ${release[editorsNoteIndex]}</p>`;
      }

      html += '</div>';
    });

    // Pagination controls at bottom
    html += '<div class="pagination-controls">';
    html += '<div class="pagination-buttons">';
    html += `<button ${currentReleasePage === 1 ? 'disabled' : ''} onclick="prevReleasesPage()">‹ Previous</button>`;
    html += `<span>Page ${currentReleasePage} of ${totalPages}</span>`;
    html += `<button ${currentReleasePage === totalPages ? 'disabled' : ''} onclick="nextReleasesPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No live sets found.</p>`;
  }
}


// Pagination functions
function prevReleasesPage() {
  if (currentReleasePage > 1) {
    currentReleasePage--;
    updateReleaseDisplay();
  }
}

function nextReleasesPage() {
  currentReleasePage++;
  updateReleaseDisplay();
}

function updateReleaseDisplay() {
  displayReleasesInHTML(
    'releases-names', releasesAPIData
  );
}
