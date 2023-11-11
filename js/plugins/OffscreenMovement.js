//============================================================================
// OffScreen Movement
// by Shaz
// Last Update: 2017.01.22
//============================================================================

/*:
 * @plugindesc Allows events to be flagged to continue moving when out of range
 * @author Shaz
 *
 * @help This plugin has no plugin commands
 * 
 * Put <UpdateOffscreen> into an event's note box (beside the name box) to
 * make it update its position even when it's out of the anti-lag range
 *
 */
 
(function() {
  var _Game_Event_isNearThePlayer = Game_Event.prototype.isNearThePlayer;
  Game_Event.prototype.isNearThePlayer = function() {
    if (this.event().meta.UpdateOffscreen) {
      return true;
    } else {
      return _Game_Event_isNearThePlayer.call(this);
    }
  };
  
  Game_Event.prototype.isNearTheScreen = function() {
    if (this.event().meta.UpdateOffscreen) {
      return true;
    } else {
      return Game_CharacterBase.prototype.isNearTheScreen.call(this);
    }
  };
})();