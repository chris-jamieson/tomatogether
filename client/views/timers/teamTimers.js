Template.teamTimers.helpers ( {
	'latestTimer': function (userId) {
		var latestTimer = false;

		var timers = Timers.find( { createdBy: userId }, { sort: { createdAt: -1 }, limit: 1 } ).fetch();

		if(timers.length > 0){
			latestTimer = timers[0];
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
	}
} );