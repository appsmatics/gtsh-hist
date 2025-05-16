// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

// Import necessary modules from GJS (Gnome JavaScript Bindings) and Gnome Shell UI
import GObject from 'gi://GObject';
import St from 'gi://St'; // Shell Toolkit for UI elements
import GLib from 'gi://GLib'; // GLib utilities
import Gio from 'gi://Gio';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
// If using Gnome 45+ (ES Modules)
// import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// If using older Gnome versions (might need adaptation)
// const Main = imports.ui.main;

// Note: The old `init()`, `enable()`, `disable()` functions at the top level
// are deprecated in favor of the Extension class structure for Gnome 40+


// --- Main Extension Class ---
export default class SimpleListMenuExtension extends Extension {
  constructor(metadata) {
    super(metadata);
    this._indicator = null;
  }

  // Called when the extension is enabled
  enable() {
    log("GTSH:", `Enabling ${this.metadata.name}`);
    this._indicator = new ListIndicator();

    // Add our indicator button to the right side of the panel
    // Note: Use 'extensionSystem.panel' if 'Main.panel' is deprecated/removed in future versions
    //imports.ui.main.panel.addToStatusArea(this.uuid, this._indicator);
    const index = Main.sessionMode.panel.left.indexOf('activities') + 1;
    Main.panel.addToStatusArea('gtsh', this._indicator, index, 'left');
  }

  // Called when the extension is disabled
  disable() {
    log("GTSH:", `Disabling ${this.metadata.name}`);
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null; // Important to release the reference
    }
  }
}


// Define our custom Panel Menu Button class
const ListIndicator = GObject.registerClass(
  class ListIndicator extends PanelMenu.Button {
    _init() {
      // Call the parent constructor. Parameters:
      // - menuAlignment: 0.0 = left, 0.5 = center, 1.0 = right (relative to the button)
      // - name: Accessible name for the button
      // - dontCreateMenu: false = create a default menu object
      super._init(0.0, _('Simple List Menu'), false);

      // --- Create the Icon for the Panel ---
      // You can use different icons. Find names in /usr/share/icons/Adwaita/scalable/ Gtk documentation or icon browsers
      this._indicatorIcon = new St.Icon({
        icon_name: 'utilities-terminal-symbolic', // A standard list icon
        style_class: 'system-status-icon' // Make it look like other panel icons
      });
      // Add the icon as a child of the button
      this.add_child(this._indicatorIcon);

      // --- Define the list items ---
      this._listItems = [
        "First Item",
        "Another Item",
        "Item Number Three",
        "A Slightly Longer List Item Example",
        "Final Item"
      ];
      this._listItems = [];
      this._getHistoryFiles().then(() => {
        //this._updateTopbarLayout();
        //this._setupListener();
        log("GTSH:", `${this._listItems}`);
        this._buildMenu();
      });

    }

    _getUserHomeDir() {
      const homeDir = Gio.File.new_for_path(GLib.getenv("HOME"));
      return homeDir.get_path();
    }

    async _getHistoryFiles() {
      try {
        let userHome = _getUserHomeDir();
        const directory = Gio.File.new_for_path(`${userHome}/.histories`);
        //log('GTSH:', `got directory ${file}`);

        const fileInfo = await directory.query_info_async('standard::type',
          Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT,
          null);

        const fileType = fileInfo.get_file_type();
        if (fileType == Gio.FileType.DIRECTORY) {
          log('GTSH:', `is a directory ${fileInfo.get_size()}`);
        }

        const iter = await new Promise((resolve, reject) => {
          directory.enumerate_children_async(
            'standard::*',
            Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
            GLib.PRIORITY_DEFAULT,
            null,
            (file_, result) => {
              try {
                resolve(directory.enumerate_children_finish(result));
              } catch (e) {
                reject(e);
              }
            }
          );
        });
        log("GTSH:", `got iter ${iter}`);

        while (true) {
          const infos = await new Promise((resolve, reject) => {
            iter.next_files_async(
              100, // max results
              GLib.PRIORITY_DEFAULT,
              null,
              (iter_, res) => {
                try {
                  resolve(iter.next_files_finish(res));
                } catch (e) {
                  reject(e);
                }
              }
            );
          });

          log("GTSH:",`${infos}`);

          if (infos.length === 0)
            break;

          for (const info of infos) {
            log("GTSH:", `${info.get_name()}`);
            this._listItems.push(info.get_name())
            this._listItems.sort(this._compareStr);
          }
        }
        // --- Build the Popup Menu ---
      } catch (error) {
        log("GTSH:", `error ${error}`);
      }
    }

    _compareStr(a, b) {
      const lowerA = a.toLowerCase();
      const lowerB = b.toLowerCase();
      if (lowerA < lowerB) {
        return -1; // a comes first
      }
      if (lowerA > lowerB) {
        return 1; // b comes first
      }
      return 0; // names are equal (ignoring case)
    }

    // Method to create and populate the menu items
    _buildMenu() {
      // Add a separator at the top (optional)
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      // Loop through our list items and add them to the menu
      this._listItems.forEach(itemText => {
        // Create a menu item with the text
        let menuItem = new PopupMenu.PopupMenuItem(_(itemText)); // _() for potential translation

        // Optional: Connect an action when the item is clicked
        menuItem.connect('activate', () => {
          log("GTSH:", `List Item Clicked: ${itemText}`);
          // You could trigger other actions here, like opening an app or running a command
          this._launchTerminal(itemText)
        });

        // Add the created item to the menu
        this.menu.addMenuItem(menuItem);
      });

      // Add another separator at the bottom (optional)
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    }

    _launchTerminal(histFileName) {
      try {
        // Command to execute
        let command = `./gt.sh ${histFileName}`;
    
        // runs the command without blocking the shell
        GLib.spawn_command_line_async(command);
    
      } catch (e) {
        log(`Error launching custom terminal: ${e}`);
      }
    }

    // Override destroy method to clean up if needed (usually handled by parent)
    // destroy() {
    //    super.destroy();
    // }
  });