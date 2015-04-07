Template.teamTimers.helpers ( {
	'latestTimer': function (userId) {
		var latestTimer = false;

		var timers = Timers.find( { createdBy: userId }, { sort: { createdAt: -1 }, limit: 1 } ).fetch();

		if(timers.length > 0){
			latestTimer = timers[0];
		}

		if(typeof Session.get('intervalId-timer-' + latestTimer._id) === "undefined"){
			Meteor.sharedTimerFunctions.startInterval(latestTimer);
		}

		return latestTimer;
	},
	'isCurrentUser': function (userId) {
		var currentUserId = Meteor.userId();
		if(currentUserId === userId){
			return true;
		}else{
			return false;
		}
	},
	'isInFollowerMode': function ( ) {
		console.log ('checking if user is in follower mode');
		var currentUser = Meteor.user();
		console.log('currentUser: ', currentUser);
		if ( typeof currentUser.following !== 'undefined' ) {
			if ( currentUser.following.length > 0 ) {
				console.log('user IS in follower mode');
				return true;
			}
		}
		console.log('user is NOT in follower mode');
		return false;
	}
} );

Template.teamTimers.events ( { 
	'click button[name="exit-follower-mode"]': function () {
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
} );