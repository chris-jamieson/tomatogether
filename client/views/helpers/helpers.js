UI.registerHelper('userDisplayName', function(context, options) {
  if( context ) {
  	var userId = context;
  	var userDisplayName = userId;

  	var user = Meteor.users.findOne( { _id : userId } );
  	if ( user ) {
      var userEmailAddress = user.emails[0].address;
      var userFirstName = '';
      var userLastName = '';
      if ( typeof user.profile !== 'undefined' ) {
        userFirstName = user.profile.firstName;
        userLastName = user.profile.lastName;
      }

  		if ( typeof userEmailAddress !== 'undefined' ){
  			userDisplayName = userEmailAddress;
  		}
      if ( typeof userFirstName !== 'undefined' ){
        if ( userFirstName.length > 0 ){
          userDisplayName = userFirstName;
        }
      }
      if ( typeof userFirstName !== 'undefined' && typeof userLastName !== 'undefined' ){
        if ( userFirstName.length > 0 && userLastName.length > 0 ){
          userDisplayName = userFirstName + ' ' + userLastName;
        }
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

  if ( PNotify.desktop.checkPermission() == 1 ){
    // permission not granted
    return false;
  } else{
    // permission granted
    return true;
  }
});

UI.registerHelper('convertSecondsToMinutes', function(context, options) {
  var minutes = 0;
  if( context ) {
    if ( $.isNumeric ( context ) ) {
      var seconds = context;

      minutes = seconds / 60;
    }
  }

  return Math.round( minutes );
});