export const itemsPerPage = 10;
export const featuredItemsApiData = await fetchSheetData('featured');

export class SocialCalls
{
    static getSocialImage(link)
    {
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
        }
        else if (link.includes("facebook.com")) {
            iconString = "icons/fbicon.png";
            titleString = "FaceBook";
        } 
        else {
            iconString = "icons/wwicon.png";
        }

        return `<a href="${link}" target="_blank" title="${titleString}"><img src="${iconString}" class="social-icon"></a>`;
    }
}