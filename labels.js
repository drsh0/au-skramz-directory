import {itemsPerPage} from '/consts.js'
import {SocialCalls} from '/consts.js'

let currentPage = 1;
let viewMode = 'cards'; // 'cards' or 'compact'
let labelsAPIData = "";

async function renderLabels()
{
    try {
        const data = await fetchSheetData('labels');
        labelsAPIData = data;
        displayLabelsInHTML('labels-content', data);
    } catch (err) {
        console.error('Failed to load labels:', err);
    }
}

// Wait for DOM to be ready before rendering
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderLabels);
} else {
    // DOM is already ready
    renderLabels();
}

function displayLabelsInHTML(containerId, labelData) {
    const headers = labelData.values[0];
    const labelRows = labelData.values.slice(1);

    const nameIndex = headers.indexOf('LABEL');
    const linkIndex = headers.indexOf('LINK');
    const statusIndex = headers.indexOf('status');
    const aliasIndex = headers.indexOf('other known aliases');
    const loreIndex = headers.indexOf('notes');

    // Sort alphabetically
    labelRows.sort((a, b) => (a[nameIndex] || "").localeCompare(b[nameIndex] || ""));

    // Pagination logic (same as artists)
    const totalItems = labelRows.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLabels = labelRows.slice(startIndex, endIndex);

    const container = document.getElementById(containerId);

    if (labelRows.length > 0) {
        let html = '';

        // Pagination controls (top)
        html += '<div class="pagination-controls">';
        html += `<p>Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} labels</p>`;
        html += '<div class="pagination-buttons">';
        html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="prevLabelsPage()">‹ Previous</button>`;
        html += `<span>Page ${currentPage} of ${totalPages}</span>`;
        html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextLabelsPage()">Next ›</button>`;
        html += '</div>';
        html += '</div>';

        // Label cards
        paginatedLabels.forEach(label => {
            const labelName = label[nameIndex] || "Unnamed Label";
            const labelLink = label[linkIndex];
            const labelLore = label[loreIndex];

            html += `<div class="artist-card sunken-panel">`;
            html += `<h4>${labelName}</h4>`;

             // Status
            if (label[statusIndex]) {
                html += `<p><strong>Status:</strong> ${label[statusIndex]}</p>`;
             }

            // Aliases
            if (label[aliasIndex]) {
                html += `<p><strong>Also known as:</strong> ${label[aliasIndex]}</p>`;
            }

            if (labelLink && labelLink.trim() !== "") {
                html += '<div class="social-links">';
                let links = labelLink.split("\n");
                links.forEach(link => {
                    html += SocialCalls.getSocialImage(link)
                });
                html += '</div>';
            } else {
                html += `<p><em>No link available</em></p>`;
            }

          if (labelLore) {
            html += `<p class="lore-note"><strong>Editor's Note:</strong> ${labelLore}</p>`;
          }

            html += `</div>`;
        });

        // Pagination controls (bottom)
        html += '<div class="pagination-controls">';
        html += '<div class="pagination-buttons">';
        html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="prevLabelsPage()">‹ Previous</button>`;
        html += `<span>Page ${currentPage} of ${totalPages}</span>`;
        html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextLabelsPage()">Next ›</button>`;
        html += '</div>';
        html += '</div>';

        container.innerHTML = html;

    } else {
        container.innerHTML = `<p>No labels found.</p>`;
    }
}

// Compact table display function
function displayLabelsInTable(containerId, labelData) {
    const headers = labelData.values[0];
    const labelRows = labelData.values.slice(1);

    const nameIndex = headers.indexOf('LABEL');
    const linkIndex = headers.indexOf('LINK');
    const statusIndex = headers.indexOf('status');
    const aliasIndex = headers.indexOf('other known aliases');
    const loreIndex = headers.indexOf('notes');

    labelRows.sort((a, b) => (a[nameIndex] || "").localeCompare(b[nameIndex] || ""));
  // Pagination logic
  const totalItems = labelRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLabels = labelRows.slice(startIndex, endIndex);

  const container = document.getElementById(containerId);

  if (labelRows.length > 0) {
    let html = '';

    // Pagination controls at top
    html += '<div class="pagination-controls">';
    html += `<p>Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} labels</p>`;
    html += '<div class="pagination-buttons">';
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="prevLabelsPage()">‹ Previous</button>`;
    html += `<span>Page ${currentPage} of ${totalPages}</span>`;
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextLabelsPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    // Compact table with wrapper for scrolling
    html += '<div class="table-wrapper">';
    html += '<table class="label-table">';
    html += '<thead><tr>';
    html += '<th>Label</th>';
    html += '<th>Status</th>';
    html += '<th>Links</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    paginatedLabels.forEach(label => {
      html += '<tr>';
      html += `<td>${label[0] || 'Unknown'}</td>`;
      html += `<td>${label[statusIndex] || '-'}</td>`;

      // Links column
      html += '<td>';
      if (label[linkIndex] && label[linkIndex] !== "") {
        let links = label[linkIndex].split("\n");
        links.forEach((link, index) => {
          let iconString = "";
          if (link.includes("bandcamp.com")) {
            iconString = "icons/bcicon.png";
          } else if (link.includes("open.spotify.com")) {
            iconString = "icons/spicon.png";
          } else if (link.includes("instagram.com")) {
            iconString = "icons/inicon.png";
          } else if (link.includes("soundcloud.com")) {
            iconString = "icons/scicon.png";
          } else if (link.includes("youtube.com")) {
            iconString = "icons/yticon.png";
          } else {
            iconString = "icons/wwicon.png";
          }
          html += `<a href="${link}" target="_blank"><img src="${iconString}" class="social-icon-small"></a>`;
        });
      } else {
        html += '-';
      }
      html += '</td>';

      html += '</tr>';
    });

    html += '</tbody></table>';
    html += '</div>'; // Close table-wrapper

    // Pagination controls at bottom
    html += '<div class="pagination-controls">';
    html += '<div class="pagination-buttons">';
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="prevLabelsPage()">‹ Previous</button>`;
    html += `<span>Page ${currentPage} of ${totalPages}</span>`;
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextLabelsPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No labels found.</p>`;
  }
}

function updateLabelDisplay() {
  const displayFunction = viewMode === 'cards' ? displayLabelsInHTML : displayLabelsInTable;
  displayFunction(
    'labels-content',
    labelsAPIData
  );
}

// Pagination functions
function prevLabelsPage() {
  if (currentPage > 1) {
    currentPage--;
    updateLabelDisplay();
  }
}

function nextLabelsPage() {
  currentPage++;
  updateLabelDisplay();
}

function toggleLabelView() {
  viewMode = viewMode === 'cards' ? 'compact' : 'cards';
  const toggleLink = document.getElementById('view-toggle');
  if (toggleLink) {
    toggleLink.textContent = viewMode === 'cards' ? 'switch to compact' : 'switch to cards';
  }
  updateLabelDisplay();
}


// Expose functions to global scope for onclick handlers
window.toggleLabelView = toggleLabelView;
window.prevLabelsPage = prevLabelsPage;
window.nextLabelsPage = nextLabelsPage;