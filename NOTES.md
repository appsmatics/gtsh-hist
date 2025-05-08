##### Prompt-1
    write a gnome-shell extension that can shows a list of files on a pop up menu panel.  Call the extension gtsh-hist@appsmatics.com. The list of items are history files from $HOME/.histories folder.  On selecting a particular item from the list  invoke a shell script gt.sh  with that filename as an argument. Generate the code for gnome shell versions 40 to 46



##### Prompt-2 

    gnome-extensions enable 'gtsh-hist@appsmatics.com' gives this error:  Extension “gtsh-hist@appsmatics.com” does not exist

    After above and some testing, I found that the extension is not working as expected. 
    
    cd ~/.local/share/gnome-shell/extensions/gtsh-hist@appsmatics.com/schemas
    glib-compile-schemas .


    Restarted the GNOME Shell:
    On X11: Press Alt+F2, type 'r', and press Enter

    Now extension is loaded and shows in Entension Manager, but shows error
    SyntaxError: import declarations may only appear at top level of a module @ resource:///org/gnome/shell/ui/main.js:3:0


##### Prompt-3
    The extension loads as it is visible in Extension Manager list, but has error: SyntaxError: import declarations may only appear at top level of a module @ resource:///org/gnome/shell/ui/main.js:3:0
    

##### Prompt-4
    Still error: SyntaxError: import declarations may only appear at top level of a module @ resource:///org/gnome/shell/ui/main.js:3:0
    
    !!!!
    ~/…/gnome/gtsh-hist $ gnome-shell --version
    GNOME Shell 46.0
    
    !!!!
    I see you're running GNOME Shell 46.0, which is the latest version. The error message suggests there might be an issue with how imports are being handled in the main.js file of GNOME Shell itself, rather than in our extension.
    
    Let's try a completely different approach by creating a minimal extension that's known to work with GNOME Shell 46:    
    
    The error message is quite unusual as it's referring to GNOME Shell's own main.js file rather than our extension code, which suggests there might be a deeper issue with your GNOME Shell environment    
    !!!!


##### Prompt-5
    
    delete the prefs.js and the use the imports in the style of 
    import Gio from 'gi://Gio';

##### Give up and use another example
    Now replace with another working example from extensive googling
    StackOverflow and gjs documentation
    
    https://stackoverflow.com/questions/73067705/how-to-list-files-from-directory-with-wildcard-in-a-gnome-shell-extension

    https://github.com/microsoft/vscode-extension-samples

    https://gjs.guide/    
    