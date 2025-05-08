# History Files Menu GNOME Shell Extension

A GNOME Shell extension that displays history files from the `$HOME/.histories` folder in a popup menu panel and allows invoking a shell script when selecting an item.

## Features

- Displays a list of history files from `$HOME/.histories` folder
- Automatically refreshes the list when the menu is opened
- Invokes the `gt.sh` script with the selected file as an argument
- Compatible with GNOME Shell versions 40 to 46

## Installation

### Manual Installation

1. Clone or download this repository
2. Copy the files to `~/.local/share/gnome-shell/extensions/gtsh-hist@appsmatics.com/`
3. Restart GNOME Shell:
   - On X11: Press Alt+F2, type 'r', and press Enter
   - On Wayland: Log out and log back in
4. Enable the extension using GNOME Extensions app or the Extensions website

### From ZIP File

1. Create a ZIP file of this repository
2. Open the GNOME Extensions app
3. Click on the "Install from file..." button and select the ZIP file
4. Enable the extension

## Requirements

- Make sure the `gt.sh` script is in your PATH and is executable
- Create the `$HOME/.histories` directory if it doesn't exist

## Usage

1. Click on the extension icon in the top panel (document icon)
2. Select a history file from the dropdown menu
3. The `gt.sh` script will be invoked with the selected file as an argument

## Troubleshooting

If the extension doesn't work as expected:

1. Check if the `$HOME/.histories` directory exists and contains files
2. Verify that the `gt.sh` script is in your PATH and is executable
3. Check the GNOME Shell logs for any errors:
   ```
   journalctl -f -o cat /usr/bin/gnome-shell
   ```

## License

This extension is distributed under the terms of the GNU General Public License, version 2 or later.
