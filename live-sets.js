import {itemsPerPage} from '/consts.js'
import {SocialCalls} from '/consts.js'

const alphabetDropdown = document.getElementById('alphabet-live-set-selector');

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
        const liveSetRows = data.values.slice(1);
        console.log(liveSetRows.length);
        displayLiveSetsInHTML(
             alphabetDropdown.options[alphabetDropdown.selectedIndex].text,'live-set-names', liveSetAPIData);
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

function displayLiveSetsInHTML(artistString, containerId, liveSetData) {
  const headers = liveSetData.values[0];
  const liveSetRows = liveSetData.values.slice(1);

  const artistIndex = headers.indexOf('artist');
  const linkIndex = headers.indexOf('link');
  const locationIndex = headers.indexOf('location');
  const dateIndex = headers.indexOf('date');
  const recorderIndex = headers.indexOf('recorder');
  const editorsNoteIndex = headers.indexOf('Editors Note');

  let matchingLiveSets = [];

  liveSetRows.forEach(function (item, index, array) {
      if (item[linkIndex] != null && item[linkIndex].trim() !== "") {
        if (artistString !== null && artistString !== "")
        {
            if (item[0].toLowerCase().startsWith(artistString)) {
                matchingLiveSets.push(item);
            }
            else if (artistString == "#")
            {
                if (("0123456789@$%&_?><{()}[]").includes(item[0][0]))
                {
                    matchingLiveSets.push(item);
                }
            }
        }
        else{
          matchingLiveSets.push(item);
        }
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
    html += `<p>Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} live sets</p>`;
    html += '<div class="pagination-buttons">';
    html += `<button ${currentLiveSetPage === 1 ? 'disabled' : ''} onclick="prevLiveSetPage()">‹ Previous</button>`;
    html += `<span>Page ${currentLiveSetPage} of ${totalPages}</span>`;
    html += `<button ${currentLiveSetPage === totalPages ? 'disabled' : ''} onclick="nextLiveSetPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    // Artist cards
    paginatedLiveSets.forEach(liveSet => {
      html += '<div class="live-set-card sunken-panel">';
      html += `<div><h4>${liveSet[artistIndex] || 'Unknown'}</h4>`;

        if (liveSet[locationIndex]) {
            html += `<p><strong>Performed At:</strong> ${liveSet[locationIndex]}</p>`;
        }

        if (liveSet[dateIndex]) {
            html += `<p><strong>Date:</strong> ${liveSet[dateIndex]}</p>`;
        }

        if (liveSet[recorderIndex]) {
            html += `<p><strong>Recorded By:</strong> ${liveSet[recorderIndex]}</p>`;
        } 
              // Social links
      if (liveSet[linkIndex] && liveSet[linkIndex] !== "") {
        html += '<div class="social-links">';
        let links = liveSet[linkIndex].split("\n");
        links.forEach(link => {
          html += SocialCalls.getSocialImage(link);
        });
        html += "</div>"
    }
    html += "</div>"
      // Social links
      if (liveSet[linkIndex] && liveSet[linkIndex] !== "") {
        html += '<div class="live-set-image">';
        let links = liveSet[linkIndex].split("\n");
        links.forEach(link => {
          let iconString = "";
          let titleString = "Website";
        if (link.includes("youtube.com")) {
            iconString = link.replace("www", "img").replace(`watch?v=`, `vi/`) + "/0.jpg";
            titleString = "YouTube";
            html += `<a href="${link}" target="_blank" title="${titleString}"><img src="${iconString}" alt="${titleString}"></a>`;
          }
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
    html += `<button ${currentLiveSetPage === 1 ? 'disabled' : ''} onclick="prevLiveSetPage()">‹ Previous</button>`;
    html += `<span>Page ${currentLiveSetPage} of ${totalPages}</span>`;
    html += `<button ${currentLiveSetPage === totalPages ? 'disabled' : ''} onclick="nextLiveSetPage()">Next ›</button>`;
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
    alphabetDropdown.options[alphabetDropdown.selectedIndex].text,'live-set-names', liveSetAPIData
  );
}

// Expose pagination functions to global scope for onclick handlers
window.prevLiveSetPage = prevLiveSetPage;
window.nextLiveSetPage = nextLiveSetPage;

// Filter event listeners - reset to page 1 when filters change
alphabetDropdown.addEventListener(
     'change',
     function() {
       currentLiveSetPage = 1;
       updateLiveSetDisplay();
     },
     false
  );
