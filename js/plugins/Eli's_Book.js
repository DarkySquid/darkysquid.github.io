//============================================================================
// Eli's_Book.js
//============================================================================

/*:
@plugindesc v1.8 - Essential plugin for all Eli plugins.
@author Hakuen Studio

@help 

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
If you like my work, please consider supporting me on Patreon!
https://www.patreon.com/hakuenstudio
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
==============================================================================
Introduction
==============================================================================

    This plugin optimizes all of my other plugins, making them less code and 
easier to maintain and implement improvements. It is not a core plugin, it 
does not overwrite any function of the standard codes of the rpg maker mv.

==============================================================================
Features
==============================================================================

Provide methods and code that add a better performance on all Eli plugins.

==============================================================================
How to use
==============================================================================

Put above all other Eli plugins.

==============================================================================
Terms of Use
==============================================================================

https://www.hakuenstudio.com/rpg-maker/terms-of-use

==============================================================================
Contact
==============================================================================

Facebook - https://www.facebook.com/hakuenstudio
Instagram - https://www.instagram.com/hakuenstudio
Twitter - https://twitter.com/hakuen_studio
RM Web - https://forums.rpgmakerweb.com/index.php?members/eliaquim.123037/
Centro Rpg Maker - https://centrorpg.com/index.php?action=profile

==============================================================================
Update log
==============================================================================
Version 1.8 - 10/19/2020
- Fixed an issue with mog chrono engine(this._note)
Version 1.7 - 08/22/2020
- Code maitenance.
- Add new methods.
Versão 1.6 - 08/12/2020
- Added a method on Window Base for it to convert only variables escape codes.
- Added an object/array to hold escape codes'regex globally across plugins.
- Added $gamePlayer.meta()
Version 1.5 - 08/01/2020
- Added method to create meta values in the event notes.
- Added method to make a deep copy of plugin parameters.
- Added new methods for plugin commands to manipulate some properties of 
pictures and windows.
Version 1.4 - 06/20/2020
- Add new methods for plugin commands.
- Code improvements.
Version 1.3 - 05/21/2020
- Code improvements.
Version 1.2 - 05/16/2020
- New methods for plugin commands
Version 1.1 - 05/14/2020
- Fixed a bug in beforeStart function of SceneMap.
- Fixed a bug that was returning undefined when making the name's array for 
null objects.
- Better performance, code improvements.
Version 1.0 - 05/02/2020
- Plugin release!
*/

/*:pt
@plugindesc v1.7 - Plugin essencial para todos os outros Eli plugins.
@author Hakuen Studio

@help 

******************************************************************************
                          Junte-se a mim no Patreon!
                    https://www.patreon.com/hakuenstudio
******************************************************************************
==============================================================================
Introdução
==============================================================================

    Este plugin otimiza todos os meus outros plugins, deixando-os com menos 
códigos e mais fáceis de fazer manutenção e implementar melhorias. Não é um 
core plugin, não sobreescreve nenhuma função dos códigos padrões do rpg 
maker mv.

==============================================================================
Funcionalidades
==============================================================================

Adiciona métodos e códigos que melhoram a performance e possibilitam fácil 
manutenção nos meus outros plugins.

==============================================================================
Como usar
==============================================================================

Coloque acima de todos os meus outros plugins.

==============================================================================
Termos de uso
==============================================================================

https://www.hakuenstudio.com/rpg-maker/terms-of-use

==============================================================================
Contato
==============================================================================

Facebook - https://www.facebook.com/hakuenstudio
Instagram - https://www.instagram.com/hakuenstudio
Twitter - https://twitter.com/hakuen_studio
RM Web - https://forums.rpgmakerweb.com/index.php?members/eliaquim.123037/
Centro Rpg Maker - https://centrorpg.com/index.php?action=profile

==============================================================================
Log de Atualizações
==============================================================================
Versão 1.7 - 22/08/2020
- Refatoração do código.
- Adicionado novos métodos.
Versão 1.6 - 12/08/2020
- Adicionado um método na windowBase pra converter só variáveis no texto.
- Adicionado um objeto/array para carregar os escape codes(regex).
- Adicionado $gamePlayer.meta()
Versão 1.5 - 01/08/2020
- Adicionado método para criar metas nas notas dos eventos.
- Adicionado método para fazer uma cópia dos parâmetros.
- Adicionado novos métodos para comandos de plugin manipular algumas 
propriedades de pictures e windows.
Versão 1.4 - 20/06/2020
- Adicionado novos métodos para os comandos de plugin.
- Limpeza no código.
Versão 1.3 - 21/05/2020
- Limpeza no código.
Versão 1.2 - 16/05/2020
- Adicionado novos métodos para comandos de plugin.
Versão 1.1 - 14/05/2020
- Consertado um erro na função beforeStart em SceneMap.
- Consertado um erro ao fazer o array de nomes quando o objeto for null.
- Melhoria de performance.
Versão 1.0 - 02/05/2020
- Lançamento!
*/

"use strict"

var Imported = Imported || {};
Imported.Eli_Book = true;

var Eli = Eli || {};
Eli.Book = Eli.Book || {};

Eli.Book.Chapter = 1.7;

Eli.Book.Parameters = PluginManager.parameters("Eli's_Book");
Eli.Book.Param = Eli.Book.Param || {};

/* ========================================================================== */
/*                                PLUGIN CLASS                                */
/* ========================================================================== */

class Eli_Book {

    constructor(){
        this.initialize();
    };

    initialize(){
        this.escapeCodes = [];
        this.extractMetaReg = /<([^<>:]+)(:?)([^>]*)>/g;
        this.reserveImages = [];
    };

    convertParameters(parameters){ // Thanks to LTN games!
        const parseParameters = function(string)  {
            try {
                return JSON.parse(string, (key, value) => {
                    try {
                        return parseParameters(value)
                    } catch (e) {
                        return value
                    } 
                })
            } catch (e) {
                return string
                }
        }
        return parseParameters(JSON.stringify(parameters));
    };

    isRpgMakerMv(){
        return Utils.RPGMAKER_NAME === 'MV';
    };

    isRpgMakerMz(){
        return Utils.RPGMAKER_NAME === 'MZ';
    };

    scene(){
        return SceneManager._scene;
    };

    isScene(scene){
        return this.scene() instanceof scene;
    }

    isFormula(param) { // Deve receber uma string. Se ela não for um número, eval. Se for um número, transforma em int.
        return isNaN(param) ? eval(param) : +param;
    };
    
    startWithNumber(param) { // Verifica se o primeiro caracter de uma string é um número.
        return isNaN(param[0]) ? String(param) : +param;
    };

    colorNames(){
        const colors = [
            "ALICEBLUE", "ANTIQUEWHITE", "AQUA", "AQUAMARINE", "AZURE", "BEIGE", "BISQUE", "BLACK", "BLANCHEDALMOND", "BLUE", "BLUEVIOLET", "BROWN", 
            "BURLYWOOD", "CADETBLUE", "CHARTREUSE", "CHOCOLATE", "CORAL", "CORNFLOWERBLUE", "CORNSILK", "CRIMSON", "CYAN", "DARKBLUE", "DARKCYAN", 
            "DARKGOLDENROD", "DARKGRAY", "DARKGREY", "DARKGREEN", "DARKKHAKI", "DARKMAGENTA", "DARKOLIVEGREEN", "DARKORANGE", "DARKORCHID", "DARKRED", 
            "DARKSALMON", "DARKSEAGREEN", "DARKSLATEBLUE", "DARKSLATEGRAY", "DARKSLATEGREY", "DARKTURQUOISE", "DARKVIOLET", "DEEPPINK", "DEEPSKYBLUE", 
            "DIMGRAY", "DIMGREY", "DODGERBLUE", "FIREBRICK", "FLORALWHITE", "FORESTGREEN", "FUCHSIA", "GAINSBORO", "GHOSTWHITE", "GOLD", "GOLDENROD", 
            "GRAY", "GREY", "GREEN", "GREENYELLOW", "HONEYDEW", "HOTPINK", "INDIANRED", "INDIGO", "IVORY", "KHAKI", "LAVENDER", "LAVENDERBLUSH", 
            "LAWNGREEN", "LEMONCHIFFON", "LIGHTBLUE", "LIGHTCORAL", "LIGHTCYAN", "LIGHTGOLDENRODYELLOW", "LIGHTGRAY", "LIGHTGREY", "LIGHTGREEN", 
            "LIGHTPINK", "LIGHTSALMON", "LIGHTSEAGREEN", "LIGHTSKYBLUE", "LIGHTSLATEGRAY", "LIGHTSLATEGREY", "LIGHTSTEELBLUE", "LIGHTYELLOW", 
            "LIME", "LIMEGREEN", "LINEN", "MAGENTA", "MAROON", "MEDIUMAQUAMARINE", "MEDIUMBLUE", "MEDIUMORCHID", "MEDIUMPURPLE", "MEDIUMSEAGREEN", 
            "MEDIUMSLATEBLUE", "MEDIUMSPRINGGREEN", "MEDIUMTURQUOISE", "MEDIUMVIOLETRED", "MIDNIGHTBLUE", "MINTCREAM", "MISTYROSE", "MOCCASIN", 
            "NAVAJOWHITE", "NAVY", "OLDLACE", "OLIVE", "OLIVEDRAB", "ORANGE", "ORANGERED", "ORCHID", "PALEGOLDENROD", "PALEGREEN", "PALETURQUOISE", 
            "PALEVIOLETRED", "PAPAYAWHIP", "PEACHPUFF", "PERU", "PINK", "PLUM", "POWDERBLUE", "PURPLE", "REBECCAPURPLE", "RED", "ROSYBROWN", "ROYALBLUE", 
            "SADDLEBROWN", "SALMON", "SANDYBROWN", "SEAGREEN", "SEASHELL", "SIENNA", "SILVER", "SKYBLUE", "SLATEBLUE", "SLATEGRAY", "SLATEGREY", "SNOW", 
            "SPRINGGREEN", "STEELBLUE", "TAN", "TEAL", "THISTLE", "TOMATO", "TURQUOISE", "VIOLET", "WHEAT", "WHITE", "WHITESMOKE", "YELLOW", "YELLOWGREEN",
        ];
          return colors;
    };
    
    // Thanks! - https://css-tricks.com/converting-color-spaces-in-javascript/
    nameToRGB(name) {
        // Create fake div
        const fakeDiv = document.createElement("div");
        fakeDiv.style.color = name;
        document.body.appendChild(fakeDiv);
        // Get color of div
        const cs = window.getComputedStyle(fakeDiv);
        const pv = cs.getPropertyValue("color");
        // Remove div after obtaining desired color value
        document.body.removeChild(fakeDiv);
        return pv;
    };
    
    hexToRgb(hex) {
        const bigint = parseInt(hex.replace('#', ''), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgb(${r}, ${g}, ${b})`;
    };

    convertColors(arg){
        let color;
        if(arg.toLowerCase().startsWith("rgba")){
            const rgba = arg.split('_');
            color = `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${rgba[4]})`;
        } else if(arg.toLowerCase().startsWith("rgb")){
            const rgb = arg.split('_');
            color = `rgb(${rgb[1]}, ${rgb[2]}, ${rgb[3]})`;
        } else if(arg.startsWith('#')){
            color = this.hexToRgb(arg);
        }else{
            color = this.nameToRGB(arg);
        }
        return color;
    };
    
    getTextWidth(text, fontSize, standardPadding, textPadding){
        const sprite = new Sprite();
        const pad1 = standardPadding*2;
        const pad2 = textPadding*2;
        sprite.bitmap = new Bitmap(1,1);
        sprite.bitmap.fontSize = fontSize;
        let width = ~~((sprite.bitmap.measureTextWidth(text) + pad1 + pad2));
        //if(text.contains("\i")) width += 32
        if(width & 1) width += 1;
            return width;
    };
    
    presetPos(width, height, custom1, custom2, preset){
        const centerX = (Graphics.width - (Graphics.width / 2)) - (width / 2);
        const endX = Graphics.width - width;
        const centerY = (Graphics.height - (Graphics.height / 2)) - (height / 2);
        const endY = Graphics.height - height;
        const defPos = [
            {x:custom1, y:custom2},     // 0
            {x:0,       y:0},           // 1 Top left
            {x:centerX, y:0},           // 2 Top center
            {x:endX,    y:0},           // 3 Top Right
            {x:0,       y:centerY},     // 4 Center left
            {x:centerX, y:centerY},     // 5 Center center
            {x:endX,    y:centerY},     // 6 Center right
            {x:0,       y:endY},        // 7 Bottom left
            {x:centerX, y:endY},        // 8 Bottom center
            {x:endX,    y:endY}         // 9 Bottom right
        ]
        const pX = defPos[preset].x;
        const pY = defPos[preset].y;
        return {x:pX, y:pY};
    };
    
    makeDeepCopy(object){
        return JSON.parse(JSON.stringify(object));
    };
    
    convertEscapeVariablesOnly(text){
        const tempWin = new Window_Base(0,0,0,0);
        text = tempWin.convertEscapeVariablesOnly(text);
        return text;
    };
    
    convertEscapeCharacters(text){
        const tempWin = new Window_Base(0,0,0,0);
        text = tempWin.convertEscapeCharacters(text);
        return text;
    };
    
    getName(text){
        const formatedText = text.includes('__') ? text.replace(/__/g, " ") : text;
            return formatedText;
    };
    
    extractText(text, startChar, endChar){ // Extrai o texto de dentro de dois [] ou () {}...
        const startIndex = text.indexOf(startChar) + 1;
        const endIndex = text.indexOf(endChar);
        const extractedText = text.substring(startIndex, endIndex);
            return extractedText;
    };
     
    toBoolean(string){
        return JSON.parse(string.toLowerCase());
    };
    
    setPosXy(array){
        const argLower = this.lowerAllCases(array);
        const index = [ argLower.indexOf('x:'), argLower.indexOf('y:') ];
        const posX  = index[0] !== -1 ? array[index[0]+1] : false;
        const posY  = index[1] !== -1 ? array[index[1]+1] : false;
            return {x:posX, y:posY};
    };
    
    lowerAllCases(args){
        return args.map(arg => arg.toLowerCase());
    };
    
    manipulateWindows(args){
        const argLower = this.lowerAllCases(args);
        const index = [
            argLower.indexOf('x:'), argLower.indexOf('y:'), 
            argLower.indexOf('w:'), argLower.indexOf('h:'), argLower.indexOf('opacity:')
        ];
        const posX      = index[0] !== -1 ? args[index[0]+1] : false;
        const posY      = index[1] !== -1 ? args[index[1]+1] : false;
        const width     = index[2] !== -1 ? args[index[2]+1] : false;
        const height    = index[3] !== -1 ? args[index[3]+1] : false;
        const opacity   = index[4] !== -1 ? args[index[4]+1] : false;
            return {x:posX, y:posY, width: width, height: height, opacity: opacity};
    };
    
    manipulatePictures(args){
        const argLower = this.lowerAllCases(args);
        const index = [
            argLower.indexOf('id:'), argLower.indexOf('name:'), argLower.indexOf('origin:'), 
            argLower.indexOf('x:'), argLower.indexOf('y:'), 
            argLower.indexOf('scaleX:'), argLower.indexOf('scaleY:'), 
            argLower.indexOf('opacity:'), argLower.indexOf('blendmode:')
        ];
        const id        = index[0] !== -1 ? args[index[0]+1] : false;
        const name      = index[1] !== -1 ? args[index[1]+1] : false;
        const origin    = index[2] !== -1 ? args[index[2]+1] : false;
        const posX      = index[3] !== -1 ? args[index[3]+1] : false;
        const posY      = index[4] !== -1 ? args[index[4]+1] : false;
        const scaleX    = index[5] !== -1 ? args[index[5]+1] : false;
        const scaleY    = index[6] !== -1 ? args[index[6]+1] : false;
        const opacity   = index[7] !== -1 ? args[index[7]+1] : false;
        const blend     = index[8] !== -1 ? args[index[8]+1] : false;
            return {id: id, name: name, origin: origin, x: posX, y: posY, scaleX: scaleX, scaleY: scaleY, opacity: opacity, blendMode: blend};
    };
    
    addToDecrypterIgnoreList(folder, file){
        const image = `img/${folder}/${file}.png`;
        if(!Decrypter._ignoreList.includes(image)) Decrypter._ignoreList.push(image);
    };
};

const eli = new Eli_Book();

/* ========================================================================== */
/*                          CLASS TO SAVE PLUGIN DATA                         */
/* ========================================================================== */

function Game_Eli() { //Hate that MV does not save ES6 class =/
    this.initialize.apply(this, arguments);
};

Game_Eli.prototype.initialize = function(){
    this.contents = {};
};

Game_Eli.prototype.addContent = function(data, value){
    this.contents[data] = value;
};

/* ========================================================================== */
/*                                    CORE                                    */
/* ========================================================================== */

/* ========================================================================== */
/*                                  MANAGERS                                  */
/* ========================================================================== */

var $gameEli = null;

Eli.Book.DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    Eli.Book.DataManager_createGameObjects.call(this);
    $gameEli = new Game_Eli();
};

Eli.Book.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    let alias = Eli.Book.DataManager_makeSaveContents.call(this);
    alias.eli = $gameEli;
    return alias;
};

Eli.Book.DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    Eli.Book.DataManager_extractSaveContents.call(this, contents);
    $gameEli = contents.eli;
};

/* ========================================================================== */
/*                                   OBJECTS                                  */
/* ========================================================================== */

/* -------------------------------- GAME TEMP ------------------------------- */

Game_Temp.prototype.getId = function(obj){
    return obj;
};

/* -------------------------------- GAME MAP -------------------------------- */

Game_Map.prototype.isImpassableDown = function(x, y){
    this.checkPassage(x, y, 0x0002);
};

Game_Map.prototype.isImpassableLeft = function(x, y){
    this.checkPassage(x, y, 0x0004);
};

Game_Map.prototype.isImpassableRight = function(x, y){
    this.checkPassage(x, y, 0x0008);
};

Game_Map.prototype.isImpassableUp = function(x, y){
    this.checkPassage(x, y, 0x0010);
};

Game_Map.prototype.isFullPassable = function(x, y){
    return !this.isImpassableDown(x, y) && !this.isImpassableLeft(x, y) && !this.isImpassableRight(x, y) && !this.isImpassableUp(x, y);
};

/* --------------------------- GAME CHARACTER BASE -------------------------- */

Game_CharacterBase.prototype.isEvent = function(){
    return this instanceof Game_Event;
};

Game_CharacterBase.prototype.isPlayer = function(){
    return this instanceof Game_Player;
};

Game_CharacterBase.prototype.isFollower = function(){
    return this instanceof Game_Follower;
};

/* ------------------------------- GAME EVENT ------------------------------- */

Eli.Book.Game_Event_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId) {
    Eli.Book.Game_Event_initialize.call(this, mapId, eventId);
    this._note = $dataMap.events[eventId] ? $dataMap.events[eventId].note : '';
    this._meta = {};
    this.makeMetaData();
};

Game_Event.prototype.meta = function(){ 
    return this._meta;
};

Game_Event.prototype.note = function(){ 
    return this._note;
};

Game_Event.prototype.makeMetaData = function(){
    const re = eli.extractMetaReg;
    let match;
    while(match = re.exec(this._note)) {
        if (match[2] === ':') {
            this._meta[match[1]] = isNaN(match[3]) ? match[3] : +match[3];
        } else {
            this._meta[match[1]] = true;
        }
    }
};

Game_Player.prototype.meta = function(){
    return $dataActors[$gameParty.leader()._actorId].meta;
};

/* ========================================================================== */
/*                                   SCENES                                   */
/* ========================================================================== */

/* ------------------------------- SCENE BOOT ------------------------------- */

Eli.Book.Scene_Boot_create = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function() {
    Eli.Book.Scene_Boot_create.call(this);
    this.reserveSystemImagesForEli();
};

Scene_Boot.prototype.reserveSystemImagesForEli = function(){
    if(eli.isRpgMakerMz()) return;
    for(const image of eli.reserveImages){
        ImageManager.reserveSystem(image);
    }
};

/* ------------------------------- SCENE BASE ------------------------------- */

Eli.Book.Scene_Base_update = Scene_Base.prototype.update;
Scene_Base.prototype.update = function() {
    this.beforeUpdate();
    Eli.Book.Scene_Base_update.call(this);
    this.afterUpdate();
};

Scene_Base.prototype.beforeUpdate = function(){};
Scene_Base.prototype.afterUpdate = function(){};

/* -------------------------------- SCENE MAP ------------------------------- */

Eli.Book.Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    if(this._transfer){
        this.beforeStart();
    }
    Eli.Book.Scene_Map_start.call(this);
    this.afterStart();
};

Eli.Book.Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    this.beforeUpdate();
    Eli.Book.Scene_Map_update.call(this);
    this.afterUpdate();
};

Scene_Map.prototype.beforeStart = function(){};
Scene_Map.prototype.afterStart = function(){};
Scene_Map.prototype.beforeUpdate = function(){};
Scene_Map.prototype.afterUpdate = function(){};

/* ------------------------------ SCENE BATTLE ------------------------------ */

Eli.Book.Scene_Battle_update = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function() {
    this.beforeUpdate();
    Eli.Book.Scene_Battle_update.call(this);
    this.afterUpdate();
};

Scene_Battle.prototype.beforeUpdate = function(){};
Scene_Battle.prototype.afterUpdate = function(){};

/* ========================================================================== */
/*                                   SPRITES                                  */
/* ========================================================================== */

/* ========================================================================== */
/*                                   WINDOWS                                  */
/* ========================================================================== */

Window_Base.prototype.convertEscapeVariablesOnly = function(text){
    text = text.replace(/\\/g, '\x1b');
    text = text.replace(/\x1b\x1b/g, '\\');
    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(+arguments[1]);
    }.bind(this));
    return text;
};

/* --------------------------------- REVISAR -------------------------------- */

function getId(obj){
    return obj
};

function getMetaId(obj){
    return obj
};