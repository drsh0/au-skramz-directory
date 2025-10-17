import {itemsPerPage} from '/consts.js'

let liveSetAPIData = "";
let currentLiveSetPage = 1;

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

async function renderLiveSets()
{
    try {
        const data = await fetchSheetData('live sets');
        liveSetAPIData = data;
        const interviewRows = data.values.slice(1);
        console.log(interviewRows.length);
        displayLiveSetsInHTML(
             'live-set-names', liveSetAPIData);
    } catch (err) {
        console.error('Failed to load live sets:', err);
    }
}

// Wait for DOM to be ready before rendering
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderLiveSets);
} else {
    // DOM is already ready
    renderLiveSets();
}

function displayLiveSetsInHTML(containerId, liveSetData) {
  const headers = liveSetData.values[0];
  const liveSetRows = liveSetData.values.slice(1);

  const artistIndex = headers.indexOf('artist');
  const linkIndex = headers.indexOf('link');
  const editorsNoteIndex = headers.indexOf('Editors Note');

  let matchingLiveSets = [];

  liveSetRows.forEach(function (item, index, array) {
      if (item[linkIndex] != null && item[linkIndex].trim() !== "") {
          matchingLiveSets.push(item);
      }
    })


  // Pagination logic
  const totalItems = matchingLiveSets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentLiveSetPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLiveSets = matchingLiveSets.slice(startIndex, endIndex);

  const container = document.getElementById(containerId);

  if (matchingLiveSets.length > 0) {
    let html = '';

    // Pagination controls at top
    html += '<div class="pagination-controls">';
    html += `<p>Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} interviews</p>`;
    html += '<div class="pagination-buttons">';
    html += `<button ${currentLiveSetPage === 1 ? 'disabled' : ''} onclick="prevPage()">‹ Previous</button>`;
    html += `<span>Page ${currentLiveSetPage} of ${totalPages}</span>`;
    html += `<button ${currentLiveSetPage === totalPages ? 'disabled' : ''} onclick="nextPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    // Artist cards
    paginatedLiveSets.forEach(liveSet => {
      html += '<div class="artist-card sunken-panel">';
      html += `<h4>${liveSet[artistIndex] || 'Unknown'}</h4>`;

      // Social links
      if (liveSet[linkIndex] && liveSet[linkIndex] !== "") {
        html += '<div class="social-links">';
        let links = liveSet[linkIndex].split("\n");
        links.forEach(link => {
          let iconString = "";
          let titleString = "Website";

          if (link.includes("bandcamp.com")) {
            iconString = "icons/bcicon.png";
            titleString = "Bandcamp";
          } else if (link.includes("open.spotify.com")) {
            iconString = "icons/spicon.png";
            titleString = "Spotify";
          } else if (link.includes("instagram.com")) {
            iconString = "icons/inicon.png";
            titleString = "Instagram";
          } else if (link.includes("soundcloud.com")) {
            iconString = "icons/scicon.png";
            titleString = "SoundCloud";
          } else if (link.includes("youtube.com")) {
            iconString = "icons/yticon.png";
            titleString = "YouTube";
          } else {
            iconString = "icons/wwicon.png";
          }

          html += `<a href="${link}" target="_blank" title="${titleString}"><img src="${iconString}" class="social-icon"></a>`;
        });
        html += '</div>';
      }

      // Lore/Editor's note
      if (liveSet[editorsNoteIndex]) {
        html += `<p class="lore-note"><strong>Editor's Note:</strong> ${liveSet[editorsNoteIndex]}</p>`;
      }

      html += '</div>';
    });

    // Pagination controls at bottom
    html += '<div class="pagination-controls">';
    html += '<div class="pagination-buttons">';
    html += `<button ${currentLiveSetPage === 1 ? 'disabled' : ''} onclick="prevInterviewPage()">‹ Previous</button>`;
    html += `<span>Page ${currentLiveSetPage} of ${totalPages}</span>`;
    html += `<button ${currentLiveSetPage === totalPages ? 'disabled' : ''} onclick="nextInterviewPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No live sets found.</p>`;
  }
}


// Pagination functions
function prevLiveSetPage() {
  if (currentLiveSetPage > 1) {
    currentLiveSetPage--;
    updateLiveSetDisplay();
  }
}

function nextLiveSetPage() {
  currentLiveSetPage++;
  updateLiveSetDisplay();
}

function updateLiveSetDisplay() {
  displayLiveSetsInHTML(
    'live-set-names', liveSetAPIData
  );
}

