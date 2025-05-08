'use strict';

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() {
}

function fillPreferencesWindow(window) {
    // Use the same GSettings schema as in extension.js
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.gtsh-hist');
    
    // Create a preferences page
    const page = new Adw.PreferencesPage();
    window.add(page);
    
    // Create a preferences group
    const group = new Adw.PreferencesGroup({
        title: 'General Settings'
    });
    page.add(group);
    
    // Create a preferences row for the refresh interval
    const row = new Adw.ActionRow({
        title: 'Refresh Interval',
        subtitle: 'How often to refresh the history files list (in seconds)'
    });
    group.add(row);
    
    // Create a spin button for the refresh interval
    const spinButton = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 10,
            upper: 3600,
            step_increment: 10,
            value: settings.get_int('refresh-interval')
        }),
        valign: Gtk.Align.CENTER
    });
    row.add_suffix(spinButton);
    row.activatable_widget = spinButton;
    
    // Connect the spin button to the settings
    settings.bind(
        'refresh-interval',
        spinButton,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
}
