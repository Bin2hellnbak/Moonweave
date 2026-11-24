# Moonweave

A simple, responsive game collection. No dependencies, installation, accounts, or build step.

## Open

Double-click `index.html`. The website works directly from a local folder. Molopony opens on Unity Play in a new tab.

## Edit the collection

Open `content.js` in a text editor. Edit the site name, introduction, default theme/accent, and game entries. To add a game, copy the object inside `games`, separate entries with a comma, and change its title, description, category, platform, cover, and URL. Put new cover images in `assets/`. Reload the page to see changes.

The cover is the artwork from your linked Unity Play page. The short card description is editable introductory copy based on that artwork.

## Change the design

The Appearance menu offers dark, light, or system themes and purple, blue, or rose accents. Preferences are stored in the current browser where local storage is available. Reset appearance restores the defaults from `content.js`.

Edit the labelled theme tokens at the start of `styles.css` for colours, corner radius, font, and page width. Layouts automatically adjust from three columns to two, then one on mobile. There is only one real game; no placeholder game listings are included.

The site is local only. It has no analytics, remote fonts, backend, or admin system. Adding games currently means editing `content.js`; an owner editor can be added later.
