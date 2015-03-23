Meteor.sharedTimerFunctions = {
	markTimerComplete: function (timer) {
	    if ( timer.status !== "completed" ){
	        if ( timer.createdBy === Meteor.userId() ){
	            var totalSeconds = timer.durationWork + timer.durationBreak;
	            Timers.update({_id: timer._id}, {$set: {status: 'completed', secondsElapsed: totalSeconds}}, function (error, result) {
	                if(error){
	                    console.log(error);
	                }
	                if(result){
	                    console.log(result);
	                    Meteor.sharedTimerFunctions.updateTimerInSession(timer._id);
	                    clearInterval(timer);
	                    // toastr.success(userDisplayName(timer.createdBy) + " completed a timer");
	                }
	            });
	        }
	    }
	},

	calculateSecondsElapsed: function ( timer ){
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
	        Meteor.sharedTimerFunctions.markTimerComplete(timer);
	    }

	    return secondsElapsed;
	},

	updateTimerInSession: function ( timerId ) {
	    var timer = Timers.findOne( { _id : timerId } );
	    Session.set('timer-object-' + timerId, timer);
	},

	getTimerFromSession: function ( timer ){
		var timerFromSession = Session.get('timer-object-' + timer._id);
		if ( typeof timerFromSession === "undefined" ) {
			Session.set('timer-object-' + timer._id, timer);
			return timer;
		}
		return timerFromSession;
	},

	startInterval: function ( timer ) {
	    if( timer.status !== "completed"){
	        var intervalId = Meteor.setInterval( function () {
	            var updatedTimer = Meteor.sharedTimerFunctions.getTimerFromSession(timer);
	            Meteor.sharedTimerFunctions.updateTimerInSession(timer._id);
	            Session.set('secondsElapsed-timer-' + timer._id, Meteor.sharedTimerFunctions.calculateSecondsElapsed(updatedTimer));
	        }, 1000 );

	        Session.set('intervalId-timer-' + timer._id, intervalId);
	    }
	}
};