'use strict';

const { GObject, St, Gio, GLib } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const HISTORIES_DIR = GLib.build_filenamev([GLib.get_home_dir(), '.histories']);
const GT_SCRIPT = 'gt.sh';

var HistoryFilesIndicator = GObject.registerClass(
    class HistoryFilesIndicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, 'History Files Indicator');
            
            // Create the panel button with an icon
            let icon = new St.Icon({
                icon_name: 'document-open-recent-symbolic',
                style_class: 'system-status-icon',
            });
            
            this.add_child(icon);
            
            // Refresh the menu when opened
            this.menu.connect('open-state-changed', (menu, open) => {
                if (open) {
                    this._refreshMenu();
                }
            });
            
            // Initial menu population
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
                logError(e, 'Error reading history files');
            }
            
            return files;
        }
        
        _openHistoryFile(filename) {
            try {
                let fullPath = GLib.build_filenamev([HISTORIES_DIR, filename]);
                
                // Execute the gt.sh script with the filename as an argument
                let [success, pid] = GLib.spawn_async(
                    null,                                   // Working directory (null = current)
                    [GT_SCRIPT, fullPath],                  // Command and arguments
                    null,                                   // Environment variables (null = current)
                    GLib.SpawnFlags.SEARCH_PATH,           // Flags
                    null                                    // Child setup function
                );
                
                if (!success) {
                    logError(new Error(), `Failed to execute ${GT_SCRIPT} with ${filename}`);
                }
            } catch (e) {
                logError(e, `Error opening history file: ${filename}`);
            }
        }
    }
);

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }
    
    enable() {
        this._indicator = new HistoryFilesIndicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }
    
    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}

function init() {
    return new Extension(Me.metadata.uuid);
}
