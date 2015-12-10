Template.toggleFollowerMode.events({ 
    'click button[name="exit-follower-mode"]': function (event, template) {
		var currentUserId = Meteor.userId () ;

		Meteor.users.update( { _id: currentUserId }, { $unset: { following: '' } }, function ( error, result ) {
		    if ( error ) {
		        console.log ( error );
		    }

		    if ( result ) {
		        console.log ( result );
		    }
		} );
	}
});
