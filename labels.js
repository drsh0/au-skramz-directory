import {itemsPerPage} from '/consts.js'
import {SocialCalls} from '/consts.js'

let currentPage = 1;
let viewMode = 'cards'; // 'cards' or 'compact'

async function renderLabels()
{
    try {
        const data = await fetchSheetData('labels');
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
        html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="prevPage()">‹ Previous</button>`;
        html += `<span>Page ${currentPage} of ${totalPages}</span>`;
        html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextPage()">Next ›</button>`;
        html += '</div>';
        html += '</div>';

        // Label cards
        paginatedLabels.forEach(label => {
            const labelName = label[nameIndex] || "Unnamed Label";
            const labelLink = label[linkIndex];
            const labelLore = label[loreIndex];

            html += `<div class="artist-card sunken-panel">`;
            html += `<h4>${labelName}</h4>`;

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
        html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="prevPage()">‹ Previous</button>`;
        html += `<span>Page ${currentPage} of ${totalPages}</span>`;
        html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextPage()">Next ›</button>`;
        html += '</div>';
        html += '</div>';

        container.innerHTML = html;

    } else {
        container.innerHTML = `<p>No labels found.</p>`;
    }
}