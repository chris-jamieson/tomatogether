// @TODO make this a shared function (also used in timer.js)
function calculateSecondsElapsed(timer){
    var secondsElapsed = 0;
    switch(timer.status){
        case 'started':
            // get seconds between time started and time now
            var startedAt = moment(timer.startedAt);
            var secondsSinceStarted = moment().diff(startedAt, 'seconds');
            // add that to the existing "seconds elapsed" property
            secondsElapsed = timer.secondsElapsed + secondsSinceStarted;
            break;
        case 'paused':
            secondsElapsed = timer.secondsElapsed;
            break;
        case 'stopped':
            secondsElapsed = timer.secondsElapsed;
            // @TODO should include secondsSinceStarted (I think)
            break;
        case 'completed':
            secondsElapsed = timer.durationWork + timer.durationBreak;
            break;
    }

    if( secondsElapsed >= timer.durationWork + timer.durationBreak){
        markTimerComplete(timer);
    }

    return secondsElapsed;
}

// @TODO make this a shared function (also used in timer.js)
function updateTimerInSession ( timerId ) {
    var timer = Timers.findOne( { _id : timerId } );
    Session.set('timer-object-' + timerId, timer);
}

// @TODO make this a shared function (also used in timer.js)
function getTimerFromSession(timer){
	var timerFromSession = Session.get('timer-object-' + timer._id);
	if ( typeof timerFromSession === "undefined" ) {
		Session.set('timer-object-' + timer._id, timer);
		return timer;
	}
	return timerFromSession;
}

// @TODO make this a shared function (also used in timer.js)
function startInterval ( timer ) {
    if( timer.status !== "completed"){
        var intervalId = Meteor.setInterval( function () {
            var updatedTimer = getTimerFromSession(timer);
            updateTimerInSession(timer._id);
            Session.set('secondsElapsed-timer-' + timer._id, calculateSecondsElapsed(updatedTimer));
        }, 1000 );

        Session.set('intervalId-timer-' + timer._id, intervalId);
    }
}

Template.teamTimers.helpers ( {
	'latestTimer': function (userId) {
		var latestTimer = false;

		var timers = Timers.find( { createdBy: userId }, { sort: { createdAt: -1 }, limit: 1 } ).fetch();

		if(timers.length > 0){
			latestTimer = timers[0];
		}

		if(typeof Session.get('intervalId-timer-' + latestTimer._id) === "undefined"){
			console.log('starting an interval for this timer');
			startInterval(latestTimer);
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