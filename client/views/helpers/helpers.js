UI.registerHelper('userDisplayName', function(context, options) {
  if( context ) {
  	var userId = context;
  	var userDisplayName = userId;

  	var user = Meteor.users.findOne( { _id : userId } );
  	if ( user ) {
  		if ( user.emails[0].address ){
  			userDisplayName = user.emails[0].address;
  		}
  	}

  	return userDisplayName;
  }
});

UI.registerHelper('userIsLoggedIn', function(context, options) {
	var currentUserId = Meteor.userId();
	if( currentUserId ){
		return true;
	} else {
		return false;
	}
});

UI.registerHelper('calendarDate', function(context, options) {
  if( context ) {
    if( moment ( context ).isValid ( ) ) {
      return moment ( context ).calendar( );
    } else {
      return "invalid date";
    }
  }
});

UI.registerHelper('desktopNotificationsEnabled', function (context, options) {
  // @TODO check user preferences to see if they want desktop notifications
  if ( notify.permissionLevel() == notify.PERMISSION_DEFAULT || notify.permissionLevel() == notify.PERMISSION_DENIED ){
    return false;
  }else if ( notify.permissionLevel() == notify.PERMISSION_GRANTED ) {
    return true;
  }else{
    // we don't know, so return false
    return false;
  }
});