define(function (require, exports, module) {
       'use strict';
       
       var CommandManager  = brackets.getModule('command/CommandManager'),
       EditorManager   = brackets.getModule('editor/EditorManager'),
       Menus           = brackets.getModule('command/Menus'),
       WorkspaceManager        = brackets.getModule("view/WorkspaceManager"),
       AppInit         = brackets.getModule('utils/AppInit'),
       ExtensionUtils  = brackets.getModule('utils/ExtensionUtils'),
       DocumentManager = brackets.getModule('document/DocumentManager');
    var panelHtml = $(require("text!panel.html"));
    var panel;
       
       AppInit.appReady(function () {
            ExtensionUtils.loadStyleSheet(module, 'css/team-uno.css');
            var TEAMUNO_SHOW = 'team-uno.show';
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
                    CommandManager.get(SHOW_PANEL).setChecked(false);
                } else {
                    panel.show();
                    ExtensionManager.setup();
                    CommandManager.get(SHOW_PANEL).setChecked(true);
                }
           },
           
            setup : function() {
                if(ExtensionManager.fileOpen()) {
                    _reader.readFile();
                    CSSPane.create();
                } else {
                    window.alert('No document open to read');
                }
            },
            fileOpen : function() {
                var documentArray = DocumentManager.getAllOpenDocuments();
                if(documentArray.length > 0) {
                    return true;
                }
                return false;
            },
            show : function() {
                CSSPane.show();
            },
            hide : function() {
                CSSPane.hide();
            },
            destroy : function() {
                document.body.removeChild(document.getElementById(wrapperId));
            }
       };
       
       
       var CSSPane = {
            wrapperId : 'bottom-panel',
            classes : [],
            htmlClasses : [],
           selectedClass : '',
       
            create : function(text) {
                $('.teamuno-panel').find('#left-panel').html(_classTable.display());
                _classTable.setupButtonActions();
            },
           clean : function() {
               for(var i = 0; i < CSSPane.htmlClasses.length; i++) {
                    CSSPane.htmlClasses.pop();
                }
                for(var i = 0; i < CSSPane.classes.length; i++) {
                    CSSPane.classes.pop();
                }
           },  
           update : function() {
                if(CSSPane.selectedClass !== '') {
                    for(var i = 0; i < CSSPane.classes.length; i++) {
                        if(CSSPane.classes[i].className === CSSPane.selectedClass) {
                            $('.teamuno-panel').find('#left-panel').html(_classTable.display());
                            _classTable.setupButtonActions();
                            $('.teamuno-panel').find('#right-panel').html(_propertyTable.display(i));
                            CSSPane.selectedClass = '';
                        }
                    }
                } else {
                    $('.teamuno-panel').find('#left-panel').html(_classTable.display());                
                }
            }
       };
    
    var _propertyTable = {
        display : function(index) {
            var string = '<table border="1">';
            for(var i = 0; i < CSSPane.classes[index].propertyNames.length; i++) {
                string = string + _propertyTable.propertyRow(index, i);
            }
            string = string + '</table>';
            return string;
        },
        propertyRow : function(index1, index2) {
            var string = '<tr>';
            string = string + _propertyTable.propertyNameCol(index1, index2);
            string = string + _propertyTable.propertyDefCol(index1, index2);
            string = string + '</tr>';
            return string 
        },
        propertyNameCol : function(index1, index2) {
            var string = '<td>';
            string = string + CSSPane.classes[index1].propertyNames[index2];
            string = string + '</td>';
            return string;
        }, 
        propertyDefCol : function(index1, index2) {
            var string = '<td>';
            string = string + CSSPane.classes[index1].propertyDefinitions[index2];
            string = string + '</td>';
            return string;
        }
    };
    
    var _classTable = {
        display : function() {
            var string = '<table border"1">';
            for(var i = 0; i < CSSPane.htmlClasses.length; i++) {
                string = string + _classTable.classRow(i);   
            }
            string = string + '</table>';
            return string;
        },
        classRow : function(index) {
            var string = '<tr><td>';
            string = string + _classTable.classButton(index);
            string = string + '</td></tr>';
            return string;
        },
        classButton : function(index) {
            var string = '<button type="button" id="' + CSSPane.classes[index].className + '">';
            string = string + CSSPane.classes[index].className;
            string = string + '</button>';
            return string;
        },
        setupButtonActions : function() {
                var buttonId = '.teamuno-panel table td';
                $(buttonId).click(function(event) {
                    CSSPane.selectedClass = event.target.id;
                    CSSPane.update();
                });  
        }
    };
    
       var _reader = {
            readFile : function() {
                var documentArray = DocumentManager.getAllOpenDocuments();
                if(documentArray.length > 0) {
                    var document = documentArray[0];
                    var i = 0;
                    var line = document.getLine(i);
                    var classes = [];
                    var insideClass = false;
                    var insidePropertyDefinition = false;
                    var className = '';
                    var propertyNames = [];
                    var propertyDefinitions = [];
                    while ((line !== undefined) && (line !== null)) {
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
                                var classHeader = '<th rowspan="' + propertyNames.length.toString() + '">' + className + '</th>';
                                var pNameColumns = [];
                                var pDefColumns = [];
                                for(var r = 0; r < propertyNames.length; r++) {
                                    var nameC = '<td>' + propertyNames[r] + '</td>';
                                    var defC = '<td>' + propertyDefinitions[r] + '</td>';
                                    pNameColumns.push(nameC);
                                    pDefColumns.push(defC);
                                }
                                var cHtml = {classHeader : classHeader, propertyNameColumns : pNameColumns, propertyDefColumns : pDefColumns};
                                CSSPane.htmlClasses.push(cHtml);
                                var c = {className : className, propertyNames : propertyNames, propertyDefinitions: propertyDefinitions};
                                CSSPane.classes.push(c);
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
                        i++;
                        line = document.getLine(i);
                    }
                } else {
                    window.alert('No document open to examine');
                }
            }
       };
});