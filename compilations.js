import { SocialCalls } from '/consts.js';

let compilationsAPIData = "";

// Extend HTMLSelectElement.contains (kept from your original file)
HTMLSelectElement.prototype.contains = function (value) {
    if (value == null) return true;
    if (value.trim() === "") return true;

    for (let i = 0; i < this.options.length; i++) {
        if (this.options[i].text === value) {
            return true;
        }
    }
    return false;
};

// Load compilations sheet
async function renderCompilations() {
    try {
        const data = await fetchSheetData('compilations');
        compilationsAPIData = data;

        displayCompilationsInHTML('compilations-container', compilationsAPIData);
    } catch (err) {
        console.error('Failed to load compilations:', err);
    }
}

// Wait for DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCompilations);
} else {
    renderCompilations();
}

// Render compilations (ALL MATCHING IDs)
function displayCompilationsInHTML(containerId, compilationAPIData) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container #${containerId} not found in DOM`);
        return;
    }

    // Read ID from HTML attribute
    const requestedId = container.dataset.compId;
    if (!requestedId) {
        console.error("No data-comp-id attribute found on container.");
        return;
    }

    const headers = compilationAPIData.values[0];
    const rows = compilationAPIData.values.slice(1);

    const artistIndex = headers.indexOf('Artist');
    const songIndex = headers.indexOf('Song');
    const photoIndex = headers.indexOf('Photo');
    const linksIndex = headers.indexOf('Links');
    const descIndex = headers.indexOf('Description');
    const idIndex = headers.indexOf('ID');

    // Get ALL matching rows
    const matches = rows.filter(row => row[idIndex] === requestedId);

    if (matches.length === 0) {
        container.innerHTML = `<p>No compilation entries found for ID ${requestedId}</p>`;
        return;
    }

    let html = ``;

    matches.forEach(match => {
        const artist = match[artistIndex] || "Unknown Artist";
        const song = match[songIndex] || "Untitled Song";
        const photo = match[photoIndex];
        const links = match[linksIndex];
        const desc = match[descIndex] || "";
        const id = match[idIndex] || "";

        html += `
            <div class="live-set-card sunken-panel">
                <div>
                    <h4>${artist}</h4>
                    <p style="font-size: 14px;"><strong>${song}</strong></p>
                    <p style="font-size: 12px;">${desc}</p>
        `;

        // Social links
        if (links && links.trim() !== "") {
            html += `<div class="social-links">`;
            links.split("\n").forEach(link => {
                html += SocialCalls.getSocialImage(link);
            });
            html += `</div>`;
        }

        html += `</div>`;

        // Photo
        if (photo && photo.trim() !== "") {
            html += `
                <div class="live-set-image">
                    <a target="_blank" title="${song}">
                        <img src="${photo}">
                    </a>
                </div>
            `;
        }

        html += `</div>`;
    });

    container.innerHTML = html;
}
