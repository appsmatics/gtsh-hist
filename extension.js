// History Files Menu Extension

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Main from 'resource:///org/gnome/shell/ui/main.js';
import PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';


// Path to history files directory
const HISTORIES_DIR = GLib.build_filenamev([GLib.get_home_dir(), '.histories']);
// Script to execute when a history file is selected
const GT_SCRIPT = 'gt.sh';

// Create a simple button with a popup menu
class HistoryButton extends PanelMenu.Button {
    constructor() {
        super(0.0, 'History Files Menu');
        
        // Add an icon to the panel
        let icon = new St.Icon({
            icon_name: 'document-open-recent-symbolic',
            style_class: 'system-status-icon',
        });
        this.add_child(icon);
        
        // Refresh menu when opened
        this.menu.connect('open-state-changed', (menu, open) => {
            if (open) {
                this._refreshMenu();
            }
        });
        
        // Initial menu setup
        this._refreshMenu();
    }
        
    _refreshMenu() {
        // Clear the current menu
        this.menu.removeAll();
        
        // Get all history files
        let historyFiles = this._getHistoryFiles();
        
        if (historyFiles.length === 0) {
            let emptyItem = new PopupMenu.PopupMenuItem('No history files found');
            emptyItem.setSensitive(false);
            this.menu.addMenuItem(emptyItem);
            return;
        }
        
        // Add each history file to the menu
        historyFiles.forEach(file => {
            let item = new PopupMenu.PopupMenuItem(file);
            item.connect('activate', () => {
                this._openHistoryFile(file);
            });
            this.menu.addMenuItem(item);
        });
        
        // Add a separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Add a refresh button
        let refreshItem = new PopupMenu.PopupMenuItem('Refresh');
        refreshItem.connect('activate', () => {
            this._refreshMenu();
        });
        this.menu.addMenuItem(refreshItem);
    }
        
    _getHistoryFiles() {
        let files = [];
        
        try {
            // Check if the histories directory exists
            let dir = Gio.File.new_for_path(HISTORIES_DIR);
            if (!dir.query_exists(null)) {
                return files;
            }
            
            // List all files in the directory
            let enumerator = dir.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
            let info;
            
            while ((info = enumerator.next_file(null))) {
                files.push(info.get_name());
            }
            
            // Sort files alphabetically
            files.sort();
        } catch (e) {
            log('Error reading history files: ' + e.message);
        }
        
        return files;
    }
        
    _openHistoryFile(filename) {
        try {
            let fullPath = GLib.build_filenamev([HISTORIES_DIR, filename]);
            
            // Execute the gt.sh script with the filename as an argument
            let [success, pid] = GLib.spawn_async(
                null,                               // Working directory (null = current)
                [GT_SCRIPT, fullPath],              // Command and arguments
                null,                               // Environment variables (null = current)
                GLib.SpawnFlags.SEARCH_PATH,        // Flags
                null                                // Child setup function
            );
            
            if (!success) {
                log(`Failed to execute ${GT_SCRIPT} with ${filename}`);
            }
        } catch (e) {
            log(`Error opening history file: ${filename} - ${e.message}`);
        }
    }
}

/**
 * Extension class
 */
class Extension {
    constructor() {
        this._button = null;
    }

    enable() {
        console.log('Enabling History Files Menu extension');
        this._button = new HistoryButton();
        Main.panel.addToStatusArea('history-files-menu', this._button);
    }

    disable() {
        console.log('Disabling History Files Menu extension');
        if (this._button) {
            this._button.destroy();
            this._button = null;
        }
    }
}

/**
 * @returns {Extension} - New extension instance
 */
export default function() {
    return new Extension();
}
