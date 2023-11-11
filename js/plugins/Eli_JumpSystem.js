//============================================================================
// Eli_JumpSystem.js
//============================================================================

/*:
@plugindesc v1.2 - Adds a jump system to the player when a button is triggered.
@author Hakuen Studio

@help 
******************************************************************************
If you like my work, consider supporting me on Patreon!
You can also get all my paid plugins there for a fair price!
https://www.patreon.com/hakuenstudio
******************************************************************************
==============================================================================
Introduction
==============================================================================

This plugin is designed to make the player allow to jump forward when you
press a button. At first, it will only work to jump forward in the normal
directions, not the diagonal ones.

==============================================================================
Features
==============================================================================

• Add a jump button!
• Can choose a sound to play when jump.
• Can use a variable value to define how far the player will jump.
• Can setup the conditions that allow the player to jump or not, through a 
list of possible ones in plugin parameters.

==============================================================================
How to use
==============================================================================

• Just set the plugin parameters and you are good to go. 
• Check out this site to find your desired javascript keycode:
    https://keycode.info/

• Most parameters are self-explanatory, but the Jump Check needs an 
explanation.
• There is a Jump Check function that will check if the player is able to 
land on his jump destination, otherwise it will jump in the same place.
• This is necessary for the player to not be able to jump outside the screen
or in places that he cannot move. But you still can choose some restrictions
about his jump behaviour:

• Can Jump - The player will only be able to jump if the follow conditions
are true:
- It is not inside a vehicle.
- The X and Y land coordinates are a valid map coordinate.
- The X and Y land coordinates is passable trough the direction it is facing.
- There is no event on the X and Y land coordinates that is Normal 
priority(Same as characters).

• The others below, all includes these conditions above, but also, plus ones:
- Can jump only to same regions
- Can jump only to higher regions
- Can jump only to lower regions
- Can jump only to same terrain tag
- Can jump only to higher terrain tag
- Can jump only to lower terrain tag
• It will check the current region/terrain tag that the player has, and if 
it matches the condition of being equal, higher or lower, it will be able to 
jump.

==============================================================================
Terms of Use
==============================================================================

https://www.hakuenstudio.com/rpg-maker/terms-of-use

==============================================================================
Contact
==============================================================================

RM Web - https://forums.rpgmakerweb.com/index.php?members/eliaquim.123037/
Centro Rpg Maker - https://centrorpg.com/index.php?action=profile
Instagram - https://www.instagram.com/hakuenstudio
Twitter - https://twitter.com/hakuen_studio
Facebook - https://www.facebook.com/hakuenstudio

==============================================================================
Update log
==============================================================================
Version 1.2 - 10/22/2020
- Now you can jump on tiles that has events below player and above player.
Version 1.1 - 08/22/2020
- Code restructuring.
- Now when the player jumps he raises his priority type(z value).
Version 1.0 - 07/05/2020
- Plugin release!

@param jumpVariable
@text Jump variable Id
@type variable
@desc This variable will determine how much tiles the player will be able to jump forward.
@default 0

@param jumpCondition
@text Jump check
@type select
@desc This will determine what function the plugin will use to check if the player is able to jump.
@option Can jump
@value canJump
@option Can jump only to same regions
@value canJumpSameRegion
@option Can jump only to higher Regions
@value canJumpHigherRegion
@option Can jump only to lower Regions
@value canJumpLowerRegion
@option Can jump only to same terrain tag
@value canJumpSameTerrain
@option Can jump only to higher terrain tag
@value canJumpHigherTerrain
@option Can jump only to lower terrain tag
@value canJumpLowerTerrain
@default canJump

@param jumpButtonCode
@text Keyboard code
@type text
@desc Add here the javascript key code for the button. Default is 74(J).
@default 74

@param jumpButtonName
@text Name of the button
@type text
@desc Add here a name for the button to check with script. Input.isTriggered('jump')
@default jump

@param jumpSound
@text Jump Se
@type file
@dir audio/se/
@require 1
@desc Add here a sound effect for your jump.
@default

@param jumpPan
@text JumpSound Pan
@type number
@min -100
@max 100
@desc The pan number -100 to 100.
@default 0

@param jumpPitch
@text JumpSound Pitch
@type number
@min -50
@max 150
@desc The pan number -50 to 150.
@default 100

*/

"use strict"

var jumpAvailable = 100;

var Imported = Imported || {};
Imported.Eli_JumpSystem = true;

var Eli = Eli || {};
Eli.JumpSystem = Eli.JumpSystem || {};

Eli.needBook = function() {
    if(!Eli.alert){
        window.alert(`Eli's_Book.js was not found. 
Please download the latest version for free.`);
        if(confirm) {
            window.open('https://hakuenstudio.itch.io/elis-book-rpg-maker-mv');
        }
        Eli.alert = true;
    }
};

if(!Imported.Eli_Book) Eli.needBook();

Eli.JumpSystem.Parameters = PluginManager.parameters('Eli_JumpSystem');
Eli.JumpSystem.Param = eli.convertParameters(Eli.JumpSystem.Parameters) || {};

Input.keyMapper[Eli.JumpSystem.Param.jumpButtonCode] = Eli.JumpSystem.Param.jumpButtonName;

SoundManager.playJump = function(){
    const jumpSound = {
        name: Eli.JumpSystem.Param.jumpSound,
        pan: Eli.JumpSystem.Param.jumpPan,
        pitch: Eli.JumpSystem.Param.jumpPitch,
        volume: ConfigManager.seVolume
    }
    AudioManager.playSe(jumpSound);
};

Eli.JumpSystem.Game_CharacterBase_jump = Game_CharacterBase.prototype.jump;
Game_CharacterBase.prototype.jump = function(xPlus, yPlus) {
    this.setPriorityType(2);
    Eli.JumpSystem.Game_CharacterBase_jump.call(this, xPlus, yPlus);
};

Eli.JumpSystem.Game_CharacterBase_updateJump = Game_CharacterBase.prototype.updateJump;
Game_CharacterBase.prototype.updateJump = function() {
    Eli.JumpSystem.Game_CharacterBase_updateJump.call(this);
    if(this._jumpCount <= 0){
        this.setPriorityType(1);
    }
};

Eli.JumpSystem.Game_Player_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
    Eli.JumpSystem.Game_Player_update.call(this, sceneActive);
    this.updateJumpForward();
};

Game_Player.prototype.updateJumpForward = function(){
    if(this.isJumpButtonPressed() && $gameSwitches.value(jumpAvailable) == true){
        this.jumpForward();
    }
};

Game_Player.prototype.isJumpButtonPressed = function(){
    return Input.isTriggered(Eli.JumpSystem.Param.jumpButtonName);
};

Game_Player.prototype.jumpForward = function(){
    this.calcJumpDistance($gameVariables.value(getId(Eli.JumpSystem.Param.jumpVariable, 'variables')));
};

Game_Player.prototype.calcJumpDistance = function(value){
    const jumpCheck = Eli.JumpSystem.Param.jumpCondition;
    for(let l = value + 1; l--;){
        const jumpValue = this.getJumpValues(l);
        if(this[jumpCheck](this.x + jumpValue.x, this.y + jumpValue.y)){
            SoundManager.playJump();
            this.jump(jumpValue.x, jumpValue.y);
            break;
        }
    }
};

Game_Player.prototype.getJumpValues = function(value){
    const jumpDistance = {
        2: [0, value],
        4: [-value, 0],
        6: [value, 0],
        8: [0, -value]
    };
    return {x: jumpDistance[this._direction][0], y: jumpDistance[this._direction][1]};
};

Game_Player.prototype.canJump = function(x, y){
    return this.canMove() && $gameMap.isPassable(x, y, this.reverseDir(this._direction)) && 
            $gameMap.isValid(x, y) && this.canJumpOverEvents(x,y) && !this.isInVehicle();
};

Game_Player.prototype.canJumpOverEvents = function(x, y){
    const event = $gameMap.eventsXy(x, y);
    const hasEvent = event.some(char => char.isNormalPriority());
    return !hasEvent;
};

Game_Player.prototype.canJumpSameRegion = function(x, y){
    return this.canJump(x, y) && this.regionId() === $gameMap.regionId(x, y);
};

Game_Player.prototype.canJumpHigherRegion = function(x, y){
    return this.canJump(x, y) && this.regionId() <= $gameMap.regionId(x, y);
};

Game_Player.prototype.canJumpLowerRegion = function(x, y){
    return this.canJump(x, y) && this.regionId() >= $gameMap.regionId(x, y);
};

Game_Player.prototype.canJumpSameTerrain = function(x, y){
    return this.canJump(x, y) && this.terrainTag() === $gameMap.terrainTag(x, y);
};

Game_Player.prototype.canJumpHigherTerrain = function(x, y){
    return this.canJump(x, y) && this.terrainTag() <= $gameMap.terrainTag(x, y);
};

Game_Player.prototype.canJumpLowerTerrain = function(x, y){
    return this.canJump(x, y) && this.terrainTag() >= $gameMap.terrainTag(x, y);
};