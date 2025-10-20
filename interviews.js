import {itemsPerPage} from '/consts.js'
import {SocialCalls} from '/consts.js'

const interviewerDropdown = document.getElementById('interviewer-selector');
let interviewAPIData = "";
let currentInterviewPage = 1;

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

async function renderInterviews()
{
    try {
        const data = await fetchSheetData('interviews');
        interviewAPIData = data;
        const interviewRows = data.values.slice(1);
        console.log(interviewRows.length);
        for (let i = 0; i < interviewRows.length; i++)
        {
            if (!interviewerDropdown.contains(interviewRows[i][2]))
            {
                let optionVal = document.createElement("option");
                optionVal.text = interviewRows[i][2];
                interviewerDropdown.appendChild(optionVal);
            }
        }
        displayInterviewsInHTML(
             interviewerDropdown.options[interviewerDropdown.selectedIndex].text, 'interview-names', interviewAPIData);
    } catch (err) {
        console.error('Failed to load interviews:', err);
    }
}

// Wait for DOM to be ready before rendering
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderInterviews);
} else {
    // DOM is already ready
    renderInterviews();
}

function displayInterviewsInHTML(interviewerString, containerId, interviewData) {
  const headers = interviewData.values[0];
  const interviewRows = interviewData.values.slice(1);

  const artistIndex = headers.indexOf('artist');
  const linkIndex = headers.indexOf('link');
  const interviewerIndex = headers.indexOf('Interviewer');
  const editorsNoteIndex = headers.indexOf('Editors Note');

  let matchingInterviews = interviewRows;

  if (interviewerString !== "")
  {
      matchingInterviews = matchingInterviews.filter(row => row[interviewerIndex] === interviewerString);
  }


  // Pagination logic
  const totalItems = matchingInterviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentInterviewPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInterviews = matchingInterviews.slice(startIndex, endIndex);

  const container = document.getElementById(containerId);

  if (matchingInterviews.length > 0) {
    let html = '';

    // Pagination controls at top
    html += '<div class="pagination-controls">';
    html += `<p>Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} interviews</p>`;
    html += '<div class="pagination-buttons">';
    html += `<button ${currentInterviewPage === 1 ? 'disabled' : ''} onclick="prevPage()">‹ Previous</button>`;
    html += `<span>Page ${currentInterviewPage} of ${totalPages}</span>`;
    html += `<button ${currentInterviewPage === totalPages ? 'disabled' : ''} onclick="nextPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    // Artist cards
    paginatedInterviews.forEach(interview => {
      html += '<div class="artist-card sunken-panel">';
      html += `<h4>${interview[artistIndex] || 'Unknown'}</h4>`;

      // Location
      if (interview[interviewerIndex]) {
        html += `<p><strong>Interviewer:</strong> ${interview[interviewerIndex]}</p>`;
      }

      // Social links
      if (interview[linkIndex] && interview[linkIndex] !== "") {
        html += '<div class="social-links">';
        let links = interview[linkIndex].split("\n");
        links.forEach(link => {
            html += SocialCalls.getSocialImage(link)
        });
        html += '</div>';
      }

      // Lore/Editor's note
      if (interview[editorsNoteIndex]) {
        html += `<p class="lore-note"><strong>Editor's Note:</strong> ${interview[editorsNoteIndex]}</p>`;
      }

      html += '</div>';
    });

    // Pagination controls at bottom
    html += '<div class="pagination-controls">';
    html += '<div class="pagination-buttons">';
    html += `<button ${currentInterviewPage === 1 ? 'disabled' : ''} onclick="prevInterviewPage()">‹ Previous</button>`;
    html += `<span>Page ${currentInterviewPage} of ${totalPages}</span>`;
    html += `<button ${currentInterviewPage === totalPages ? 'disabled' : ''} onclick="nextInterviewPage()">Next ›</button>`;
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No interviews found.</p>`;
  }
}


// Pagination functions
function prevInterviewPage() {
  if (currentInterviewPage > 1) {
    currentInterviewPage--;
    updateInterviewDisplay();
  }
}

function nextInterviewPage() {
  currentInterviewPage++;
  updateInterviewDisplay();
}

function updateInterviewDisplay() {
  displayInterviewsInHTML(
    interviewerDropdown.options[interviewerDropdown.selectedIndex].text,'interview-names', interviewAPIData
  );
}

interviewerDropdown.addEventListener(
     'change',
     function() {
       currentInterviewPage = 1;
       updateInterviewDisplay();
     },
     false
  );

