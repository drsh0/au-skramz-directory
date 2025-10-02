const alphabetDropdown = document.getElementById('alphabet-selector');
const locationDropdown = document.getElementById('location-selector');
const artistStatusDropdown = document.getElementById('artist-status-selector');
const genreDropdown = document.getElementById('genre-selector');

function getGoogleApiKey() {
  return "";
}

function getGoogleSheetsID() {
  return "";
}

let artistAPIData = "";

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

function renderArtists()
{
    var apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${getGoogleSheetsID()}/values/artists?key=${getGoogleApiKey()}`;
    fetch(apiUrl).then(response => {
        return response.json();
    }).then(data => {
        artistAPIData = data;
        const artistRows = data.values.slice(1);
        console.log(artistRows.length);
        for (let i =0; i < artistRows.length; i++)
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
    }).catch(err => {
      // Do something for an error here
    });
}

renderArtists()

function displayArtistsInHTML(artistString, statusString, cityString, genreString, containerId, artistData) {
  const headers = artistData.values[0];
  const artistRows = artistData.values.slice(1);

  const statusIndex = headers.indexOf('status');
  const locationIndex = headers.indexOf('location_city');
  const genreIndex = headers.indexOf('genre');

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
  const container = document.getElementById(containerId);
  if (matchingArtists.length > 0) {
    let html = '<table><tr>';
    headers.forEach(gig => {
     if (gig !== "link" && gig !== "lore")
     {
      html += `
        <th><strong style="font-size: 12px;">${gig}</strong></th>
      `;
     }
    });
    
    html += '</tr></table>'
    matchingArtists.forEach(gig => {
      html += `<table><tr>`;
      for (let i = 0; i < headers.length; i++)
      {
        if (headers[i] === "link" || headers[i] === "lore")
        {
            html += ``
        }
        else{
            html += `<td><strong style="font-size: 12px;">${gig[i] ? gig[i] : ""}</strong></td>`
        }
      }
      html += `</tr></table>`;
            for (let i = 0; i < headers.length; i++)
      {
        if (headers[i] === "link")
        {
            if (gig[i] !== "" && gig[i])
            {
                let links = gig[i].split("\n");
                links.forEach(link => {
                    let iconString = "";
                    let titleString = "Website";
                    if (link.includes("bandcamp.com"))
                    {
                        iconString = "icons/bcicon.png";
                        titleString = "Bandcamp";
                    }
                    else if (link.includes("open.spotify.com"))
                    {
                        iconString = "icons/spicon.png";
                        titleString = "Spotify";
                    }
                    else if (link.includes("instagram.com"))
                    {
                        iconString = "icons/inicon.png";
                        titleString = "Instagram";
                    }
                    else if (link.includes("soundcloud.com"))
                    {
                        iconString = "icons/scicon.png";
                        titleString = "SoundCloud";
                    }
                    else if (link.includes("youtube.com"))
                    {
                        iconString = "icons/yticon.png";
                        titleString = "YouTube";
                    }
                    else {
                        iconString = "icons/wwicon.png";
                    }
                    html += `<a border="50px" href="${link}" title="${titleString} - ${link}"><img src="${iconString}" class="social-icon"></a>`
                });
            }
        }
        else if (headers[i] === "lore")
        {
            html += gig[i] ? `<p><strong>Editors Note:</strong> ${gig[i]}</p>` : '';
        }
      }
    ;
    });
    container.innerHTML = html;
  } else {
    container.innerHTML = `<p>No artists found for ${artistString}</p>`;
  }
}


alphabetDropdown.addEventListener(
     'change',
     function() {displayArtistsInHTML(alphabetDropdown.options[alphabetDropdown.selectedIndex].text,
             artistStatusDropdown.options[artistStatusDropdown.selectedIndex].text,
             locationDropdown.options[locationDropdown.selectedIndex].text,
             genreDropdown.options[genreDropdown.selectedIndex].text,
             'artist-names', artistAPIData); },
     false
  );
  artistStatusDropdown.addEventListener(
     'change',
     function() {displayArtistsInHTML(alphabetDropdown.options[alphabetDropdown.selectedIndex].text,
             artistStatusDropdown.options[artistStatusDropdown.selectedIndex].text,
             locationDropdown.options[locationDropdown.selectedIndex].text,
             genreDropdown.options[genreDropdown.selectedIndex].text,
             'artist-names', artistAPIData); },
     false
  );
  locationDropdown.addEventListener(
     'change',
     function() {displayArtistsInHTML(alphabetDropdown.options[alphabetDropdown.selectedIndex].text,
             artistStatusDropdown.options[artistStatusDropdown.selectedIndex].text,
             locationDropdown.options[locationDropdown.selectedIndex].text,
             genreDropdown.options[genreDropdown.selectedIndex].text,
             'artist-names', artistAPIData); },
     false
  );
  genreDropdown.addEventListener(
     'change',
     function() {displayArtistsInHTML(alphabetDropdown.options[alphabetDropdown.selectedIndex].text,
             artistStatusDropdown.options[artistStatusDropdown.selectedIndex].text,
             locationDropdown.options[locationDropdown.selectedIndex].text,
             genreDropdown.options[genreDropdown.selectedIndex].text,
             'artist-names', artistAPIData); },
     false
  );

  