function getGoogleApiKey() {
  return "";
}

function getGoogleSheetsID() {
  return "";
}

function renderLabels()
{
    console.log("TESTING");
    var apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${getGoogleSheetsID()}/values/labels?key=${getGoogleApiKey()}`;
    fetch(apiUrl).then(response => {
        return response.json();
    }).then(data => {
        displayLabelsInHTML('labels-content', data);
    }).catch(err => {
      // Do something for an error here
    });
}

renderLabels()

window.onload = function(){
}

function displayLabelsInHTML(containerId, labelData) {
  const labelRows = labelData.values.slice(1);
  labelRows.sort((a, b) => a[0].localeCompare(b[0]))
  const container = document.getElementById(containerId);
  let html = `<ul class="tree-view">`;
  if (labelRows.length > 0) {
    labelRows.forEach(label => {
      html += `<li>`;
      if (label[1] != "" && label[1] != null)
      {
        html += `<a
                    href="${label[1] || 'None'}"
                    target="_blank"
                    >${label[0] || 'ERROR/NO NAME?'}</a
                >`;
      }
      else
      {
        html +=  `<a>${label[0] || 'ERROR/NO NAME?'}</a>`;
      }
    html += "</li>";
    });
    html += `</ul>`
    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No labels found</p>`;
  }
}