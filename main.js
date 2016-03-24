define(function (require, exports, module) {
       'use strict';
       
   var CommandManager  = brackets.getModule('command/CommandManager'),
       EditorManager   = brackets.getModule('editor/EditorManager'),
       Menus           = brackets.getModule('command/Menus'),
       WorkspaceManager        = brackets.getModule("view/WorkspaceManager"),
       AppInit         = brackets.getModule('utils/AppInit'),
       ExtensionUtils  = brackets.getModule('utils/ExtensionUtils'),
       MainViewManager = brackets.getModule('view/MainViewManager'),
       FileUtils = brackets.getModule('file/FileUtils'),
       DocumentManager = brackets.getModule('document/DocumentManager');
    var panelHtml = $(require("text!panel.html"));
    var panel;
    var panelId = '.teamuno-panel';
    var TEAMUNO_SHOW = 'team-uno.show';
    var leftPanelId = '#l-panel';
    var middlePanelId = '#m-panel';
    var rightPanelId = '#r-panel';
    
    AppInit.appReady(function () {
        ExtensionUtils.loadStyleSheet(module, 'css/team-uno.css');
        CommandManager.register('Open UnoCSS', TEAMUNO_SHOW, ExtensionManager.handleShowPanel);
        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(TEAMUNO_SHOW, 'Shift-Cmd-U');
       panel = WorkspaceManager.createBottomPanel(TEAMUNO_SHOW, panelHtml, 200);
    });
       
   var ExtensionManager = {
        classes : [],
        wrapperId : 'teamuno-wrapper',
       
       handleShowPanel : function() {
            if(panel.isVisible()) {
                panel.hide();
                CommandManager.get(TEAMUNO_SHOW).setChecked(false);
            } else {
                panel.show();
                ExtensionManager.setup();
                CommandManager.get(TEAMUNO_SHOW).setChecked(true);
            }
       },
        setup : function() {
            UnoModel.getFiles();
        },
        destroy : function() {
            document.body.removeChild(document.getElementById(wrapperId));
        }
    };
    
    var UnoModel = {
        files : [],
        classes : [],
        selectedFile : '',
        selectedClass : '',
        getFiles : function() {
            UnoModel.files = _reader.getFiles();
            for(var i = 0; i < UnoModel.files.length; i++) {
                _reader.parseFile(i);
            }
        }
    };
    
    var _panelManager = {
        create : function() {
            _panelManager.makeLeftPanel();
        },
        makeLeftPanel : function() {
            $(panelId).find(leftPanelId).html(_fileTable.display());
            _fileTable.setupButtonActions();
        }, 
        makeMiddlePanel : function(index) {
            $(panelId).find(middlePanelId).html(_cssClassTable.display(index));
            _cssClassTable.setupButtonsActions();
        },
        makeRightPanel : function(index1, index2) {
            $(panelId).find(rightPanelId).html(_cssPropertyTable.display(index1, index2));
        },
        update : function() {
            if(UnoModel.selectedFile !== '') {
                for(var i = 0; i < UnoModel.files.length; i++) {
                    var filename = FileUtils.getBaseName(UnoModel.files[i].fullPath);
                    if(filename === UnoModel.selectedFile) {
                        if(UnoModel.selectedClass !== '') {
                            for(var k = 0; k < UnoModel.classes[i].length; k++) {
                                if(UnoModel.classes[i][k].className === UnoModel.selectedClass) {
                                    _panelManager.makeLeftPanel();
                                    _panelManager.makeMiddlePanel(i);
                                    _panelManager.makeRightPanel(i, k);
                                }
                            }
                        } else {
                            _panelManager.makeLeftPanel();
                            _panelManager.makeMiddlePanel(i);
                        }
                    }
                }
            } else {
                _panelManager.makeLeftPanel();
            }
        },
    };
    
    var _cssPropertyTable = {
        display : function(index1, index2) {
            var string = '<table border="1">';
            for(var i = 0; i < UnoModel.classes[index1][index2].propertyNames.length; i++) {
                string = string + _cssPropertyTable.propertyRow(index1, index2, i);
            }
            string = string + '</table>';
            return string;
        },
        propertyRow : function(index1, index2, index3) {
            var string = '<tr>';
            string = string + _cssPropertyTable.propertyCol(UnoModel.classes[index1][index2].propertyNames[index3]);
            string = string + _cssPropertyTable.propertyCol(UnoModel.classes[index1][index2].propertyDefinitions[index3]);
            string = string + '</tr>';
            return string;
        },
        propertyCol : function(text) {
            var string = '<td>';
            string = string + text;
            string = string + '</td>';
            return string;
        }
    };
    
    var _cssClassTable = {
        display : function(index) {
            var string = '<table>';
            for(var i = 0; i < UnoModel.classes[index].length; i++) {
                string = string + _cssClassTable.classRow(index, i);
            }
            string = string + '</table>';
            return string;
        },
        classRow : function(index1, index2) {
            var string = '<tr><td>';
            string = string + _cssClassTable.classButton(UnoModel.classes[index1][index2].className);
            string = string + '</td></tr>';
            return string;
        },
        classButton : function(text) {
            var string = '<button type="button" id="' + text + '">';
            string = string + text;
            string = string + '</button>';
            return string;
        },
        setupButtonsActions : function(index) {
            var buttonId = '.teamuno-panel table td';
            $(buttonId).click(function(event) {
                 UnoModel.selectedClass = event.target.id;
                _panelManager.update();
            });
        }
    };
    
    var _fileTable = {
        display : function() {
            var string = '<table>';
            for(var i = 0; i < UnoModel.files.length; i++) {
                string = string + _fileTable.fileRow(i);
            }
            string = string + '</table>';
            return string;
        }, 
        fileRow : function(index) {
            var string = '<tr><td>';
            string = string + _fileTable.fileButton(index);
            string = string + '</td></tr>';
            return string;
        }, 
        fileButton : function(index) {
            var string = '<button type="button" id="' + FileUtils.getBaseName(UnoModel.files[index].fullPath) + '">';
            string = string + FileUtils.getBaseName(UnoModel.files[index].fullPath);
            string = string + '</button>';
            return string;
        }, 
        setupButtonActions : function() {
            var buttonId = '.teamuno-panel table td';
            $(buttonId).click(function(event) {
                UnoModel.selectedFile = event.target.id;
                _panelManager.update();
            });  
        }
    };
    
       var _reader = {
           getFiles : function() {
                var cssFileArray = [];
                var docArray = MainViewManager.getAllOpenFiles();
                for(var i = 0; i < docArray.length; i++) {
                    var components = docArray[i].fullPath.split('.');
                    if(components[1] === 'css') {
                        cssFileArray.push(docArray[i]);
                    }
                }
                return cssFileArray
           },
           parseFile : function(index) {
               var promise = FileUtils.readAsText(UnoModel.files[index]).done(function(text) {
                   
                   var lineEndingSymbol = '\n';
                   if(FileUtils.sniffLineEndings(text) !== 'LF') {
                       lineEndingSymbol = '\r\n';
                   }
                   var lines = text.split(lineEndingSymbol);
                   var insideClass = false;
                   var insidePropertyDef = false;
                   var classes = [];
                   var className = '';
                    var propertyNames = [];
                    var propertyDefinitions = [];
                   for(var i = 0; i < lines.length; i++) {
                       var line = lines[i];
                       if(!insideClass) {                           
                           var bracketIndex = line.indexOf('{');
                           if(bracketIndex !== -1) {
                               insideClass = true;
                               var components = line.split('{');
                               className = components[0];
                           }
                       } else {
                           var bracketIndex = line.indexOf('}');
                           if(bracketIndex !== -1) {
                               insideClass = false;
                                className = className.replace('.', '');
                                className = className.replace('#', '');
                                var c = {className : className, propertyNames : propertyNames, propertyDefinitions : propertyDefinitions};
                                classes.push(c);
                                propertyNames = [];
                                propertyDefinitions = [];
                                className = '';
                           } else {
                               var colonIndex = line.indexOf(':');
                                if(colonIndex !== -1){
                                    var components = line.split(':');
                                    propertyNames.push(components[0]);
                                    propertyDefinitions.push(components[1]);
                                }
                           }
                       }
                   }
                   UnoModel.classes.push(classes);
                   if(UnoModel.classes.length === UnoModel.files.length) {
                       _panelManager.create();
                   }
               });
           }, 
       };
});