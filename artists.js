import {itemsPerPage} from '/consts.js'

const alphabetDropdown = document.getElementById('alphabet-selector');
const locationDropdown = document.getElementById('location-selector');
const artistStatusDropdown = document.getElementById('artist-status-selector');
const genreDropdown = document.getElementById('genre-selector');

let artistAPIData = "";
let currentPage = 1;
let viewMode = 'cards'; // 'cards' or 'compact'

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

async function renderArtists()
{
    try {
        const data = await fetchSheetData('artists');
        artistAPIData = data;
        const artistRows = data.values.slice(1);
        console.log(artistRows.length);
        for (let i = 0; i < artistRows.length; i++)
        {
            if (!locationDropdown.contains(artistRows[i][1]))
            {
                let optionVal = document.createElement("option");
                optionVal.text = artistRows[i][1];
                locationDropdown.appendChild(optionVal);
            }
            if (!genreDropdown.contains(artistRows[i][2]))
            {
                let optionVal = document.createElement("option");
                optionVal.text = artistRows[i][2];
                genreDropdown.appendChild(optionVal);
            }
            if (!artistStatusDropdown.contains(artistRows[i][3]))
            {
                let optionVal = document.createElement("option");
                optionVal.text = artistRows[i][3];
                artistStatusDropdown.appendChild(optionVal);
            }
        }
        displayArtistsInHTML(alphabetDropdown.options[alphabetDropdown.selectedIndex].text,
             artistStatusDropdown.options[artistStatusDropdown.selectedIndex].text,
             locationDropdown.options[locationDropdown.selectedIndex].text,
             genreDropdown.options[genreDropdown.selectedIndex].text,
             'artist-names', artistAPIData);
    } catch (err) {
        console.error('Failed to load artists:', err);
    }
}

// Wait for DOM to be ready before rendering
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderArtists);
} else {
    // DOM is already ready
    renderArtists();
}

function displayArtistsInHTML(artistString, statusString, cityString, genreString, containerId, artistData) {
  const headers = artistData.values[0];
  const artistRows = artistData.values.slice(1);

  const statusIndex = headers.indexOf('status');
  const locationIndex = headers.indexOf('location_city');
  const genreIndex = headers.indexOf('genre');
  const linkIndex = headers.indexOf('link');
  const loreIndex = headers.indexOf('lore');
  const aliasIndex = headers.indexOf('other known aliases');

  let matchingArtists = [];

  if (artistString == "" || artistString == null)
  {
    matchingArtists = artistRows;
  }
  else {
    artistRows.forEach(function (item, index, array) {
      if (item[0].toLowerCase().startsWith(artistString)) {
          matchingArtists.push(item);
      }
      else if (artistString == "#")
      {
          if (("0123456789@$%&_?><{()}[]").includes(item[0][0]))
          {
              matchingArtists.push(item);
          }
      }
    })
  }

  if (statusString !== "")
  {
      matchingArtists = matchingArtists.filter(row => row[statusIndex] === statusString);
  }
  if (cityString !== "")
  {
      matchingArtists = matchingArtists.filter(row => row[locationIndex] === cityString);
  }
  if (genreString !== "")
  {
      matchingArtists = matchingArtists.filter(row => row[genreIndex] === genreString);
  }

  // Pagination logic
  const totalItems = matchingArtists.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArtists = matchingArtists.slice(startIndex, endIndex);

  const container = document.getElementById(containerId);

  if (matchingArtists.length > 0) {
    let html = '';

    // Pagination controls at top
    html += '<div class="pagination-controls">';
    html += `<p>Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} bands</p>`;
    html += '<div class="pagination-buttons">';
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="prevPage()">‹ Previous</button>`;
    html += `<span>Page ${currentPage} of ${totalPages}</span>`;
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    // Artist cards
    paginatedArtists.forEach(artist => {
      html += '<div class="artist-card sunken-panel">';
      html += `<h4>${artist[0] || 'Unknown'}</h4>`;

      // Location
      if (artist[locationIndex]) {
        html += `<p><strong>Location:</strong> ${artist[locationIndex]}</p>`;
      }

      // Genre
      if (artist[genreIndex]) {
        html += `<p><strong>Genre:</strong> ${artist[genreIndex]}</p>`;
      }

      // Status
      if (artist[statusIndex]) {
        html += `<p><strong>Status:</strong> ${artist[statusIndex]}</p>`;
      }

      // Aliases
      if (artist[aliasIndex]) {
        html += `<p><strong>Also known as:</strong> ${artist[aliasIndex]}</p>`;
      }

      // Social links
      if (artist[linkIndex] && artist[linkIndex] !== "") {
        html += '<div class="social-links">';
        let links = artist[linkIndex].split("\n");
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
      if (artist[loreIndex]) {
        html += `<p class="lore-note"><strong>Editor's Note:</strong> ${artist[loreIndex]}</p>`;
      }

      html += '</div>';
    });

    // Pagination controls at bottom
    html += '<div class="pagination-controls">';
    html += '<div class="pagination-buttons">';
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="prevPage()">‹ Previous</button>`;
    html += `<span>Page ${currentPage} of ${totalPages}</span>`;
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No artists found.</p>`;
  }
}


// Pagination functions
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    updateArtistDisplay();
  }
}

function nextPage() {
  currentPage++;
  updateArtistDisplay();
}

function updateArtistDisplay() {
  const displayFunction = viewMode === 'cards' ? displayArtistsInHTML : displayArtistsInTable;
  displayFunction(
    alphabetDropdown.options[alphabetDropdown.selectedIndex].text,
    artistStatusDropdown.options[artistStatusDropdown.selectedIndex].text,
    locationDropdown.options[locationDropdown.selectedIndex].text,
    genreDropdown.options[genreDropdown.selectedIndex].text,
    'artist-names',
    artistAPIData
  );
}

// Filter event listeners - reset to page 1 when filters change
alphabetDropdown.addEventListener(
     'change',
     function() {
       currentPage = 1;
       updateArtistDisplay();
     },
     false
  );

artistStatusDropdown.addEventListener(
     'change',
     function() {
       currentPage = 1;
       updateArtistDisplay();
     },
     false
  );

locationDropdown.addEventListener(
     'change',
     function() {
       currentPage = 1;
       updateArtistDisplay();
     },
     false
  );

genreDropdown.addEventListener(
     'change',
     function() {
       currentPage = 1;
       updateArtistDisplay();
     },
     false
  );

// Toggle between card and compact view
function toggleArtistView() {
  viewMode = viewMode === 'cards' ? 'compact' : 'cards';
  const toggleLink = document.getElementById('view-toggle');
  if (toggleLink) {
    toggleLink.textContent = viewMode === 'cards' ? 'switch to compact' : 'switch to cards';
  }
  updateArtistDisplay();
}

// Compact table display function
function displayArtistsInTable(artistString, statusString, cityString, genreString, containerId, artistData) {
  const headers = artistData.values[0];
  const artistRows = artistData.values.slice(1);

  const statusIndex = headers.indexOf('status');
  const locationIndex = headers.indexOf('location_city');
  const genreIndex = headers.indexOf('genre');
  const linkIndex = headers.indexOf('link');

  let matchingArtists = [];

  if (artistString == "" || artistString == null) {
    matchingArtists = artistRows;
  } else {
    artistRows.forEach(function (item, index, array) {
      if (item[0].toLowerCase().startsWith(artistString)) {
        matchingArtists.push(item);
      } else if (artistString == "#") {
        if (("0123456789@$%&_?><{()}[]").includes(item[0][0])) {
          matchingArtists.push(item);
        }
      }
    })
  }

  if (statusString !== "") {
    matchingArtists = matchingArtists.filter(row => row[statusIndex] === statusString);
  }
  if (cityString !== "") {
    matchingArtists = matchingArtists.filter(row => row[locationIndex] === cityString);
  }
  if (genreString !== "") {
    matchingArtists = matchingArtists.filter(row => row[genreIndex] === genreString);
  }

  // Pagination logic
  const totalItems = matchingArtists.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArtists = matchingArtists.slice(startIndex, endIndex);

  const container = document.getElementById(containerId);

  if (matchingArtists.length > 0) {
    let html = '';

    // Pagination controls at top
    html += '<div class="pagination-controls">';
    html += `<p>Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} bands</p>`;
    html += '<div class="pagination-buttons">';
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="prevPage()">‹ Previous</button>`;
    html += `<span>Page ${currentPage} of ${totalPages}</span>`;
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    // Compact table
    html += '<table class="artist-table">';
    html += '<thead><tr>';
    html += '<th>Band</th>';
    html += '<th>Location</th>';
    html += '<th>Genre</th>';
    html += '<th>Status</th>';
    html += '<th>Links</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    paginatedArtists.forEach(artist => {
      html += '<tr>';
      html += `<td>${artist[0] || 'Unknown'}</td>`;
      html += `<td>${artist[locationIndex] || '-'}</td>`;
      html += `<td>${artist[genreIndex] || '-'}</td>`;
      html += `<td>${artist[statusIndex] || '-'}</td>`;

      // Links column
      html += '<td>';
      if (artist[linkIndex] && artist[linkIndex] !== "") {
        let links = artist[linkIndex].split("\n");
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

    // Pagination controls at bottom
    html += '<div class="pagination-controls">';
    html += '<div class="pagination-buttons">';
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="prevPage()">‹ Previous</button>`;
    html += `<span>Page ${currentPage} of ${totalPages}</span>`;
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No artists found.</p>`;
  }
}

