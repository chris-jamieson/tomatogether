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