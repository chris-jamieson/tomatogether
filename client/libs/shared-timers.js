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

	soundFileName : function ( notificationType ) {
		var filename = 'big-ben';
		var user = Meteor.user();
		if ( typeof user.preferences !== 'undefined' ) {
			switch ( notificationType ) {
				case 'breakComplete':
					filename = user.preferences.soundEffectBreakCompleted;
					break;

				case 'workComplete':
					filename = user.preferences.soundEffectWorkCompleted;
					break;
			}
		}
		
		return filename;
	},

	playAudioNotification : function ( notificationType ) {
		var audioNotificationsEnabled = true; // by default
		var user = Meteor.user();
		if ( typeof user.preferences !== 'undefined' ) {
			audioNotificationsEnabled = user.preferences.enableAudioNotifications;
		}

		if ( audioNotificationsEnabled === true ) {
			if ( !buzz.isSupported ) {
				console.log('can\'t play sounds because buzz.js not supported');
			}else{
				var soundFileName = Meteor.sharedTimerFunctions.soundFileName( notificationType );
				var s = new buzz.sound('/sounds/' + soundFileName, {
					formats: [ 'wav' ] // @TODO add other file types to support other browsers: ['ogg', 'mp3', 'aac', 'wav']
				});
				s.play();
			}
		}
	},

	showDesktopNotification: function ( timer, notificationType ) {
		if ( true ) { // @TODO check if user wants to show desktop notifications
			desktopNotificationsEnabled = true;
		}

		var isOwnTimer = false;
		if ( Meteor.userId() == timer.createdBy ){
			isOwnTimer = true;
		}

		// @TODO handle follower mode

		if ( typeof notificationType !== 'undefined' ) {
			switch ( notificationType ) {
				case 'breakComplete':
					if ( isOwnTimer ) {
						PNotify.desktop.permission(); // @TODO this should be wrapped in a check for user wanting desktop notifications e.g. new function "userPreferencesDesktopNotifications"
						(new PNotify({
							title: 'Break over!',
							text: 'Ready to get back to work? Click to start a new work timer.', // @TODO should be able to handle auto-continuing timers
							desktop: {
								desktop: desktopNotificationsEnabled,
								icon: '',
							}
						})).get().click(function ( e ) {
							if ( $('.ui-pnotify-closer, .ui-pnotify-sticker, .ui-pnotify-closer *, .ui-pnotify-sticker *').is(e.target)) return;
							alert ('You clicked the notification.'); // @TODO start new timer
						});
					} else {
						// @TODO notify the user when another user's timer
					}
					break;
				case 'workComplete':
					if ( isOwnTimer ) {
						PNotify.desktop.permission(); // @TODO this should be wrapped in a check for user wanting desktop notifications
						(new PNotify({
							title: 'Work is over!',
							text: 'The work phase of your timer was completed. Click to start your break. ', // @TODO should be able to handle auto-continuing break
							desktop: {
								desktop: desktopNotificationsEnabled,
								icon: '',
							}
						})).get().click(function ( e ) {
							if ( $('.ui-pnotify-closer, .ui-pnotify-sticker, .ui-pnotify-closer *, .ui-pnotify-sticker *').is(e.target)) return;
							alert ('You clicked the notification.'); // @TODO start the break
						});
					} else {
						// @TODO notify the user when another user's timer
					}
					break;
			}
		}

	},

	workComplete: function (timer) {
		// only notifying user on changes to their own timer
		if( Meteor.userId() === timer.createdBy ) {
			Meteor.sharedTimerFunctions.playAudioNotification('workComplete');
			Meteor.sharedTimerFunctions.showDesktopNotification( timer, 'workComplete' );
			// @TODO get user to confirm before continuing onto the break phase
			Session.set('notified-work-completed-timer-' + timer._id, true );
		}
	},

	breakComplete: function ( timer ) {
		// only notifying user on changes to their own timer
		if( Meteor.userId() === timer.createdBy ) {
			Meteor.sharedTimerFunctions.playAudioNotification( 'breakComplete' );
			Meteor.sharedTimerFunctions.showDesktopNotification( timer, 'breakComplete' );
			// @TODO get user to confirm before continuing onto the break phase
			Session.set('notified-break-completed-timer-' + timer._id, true );
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

	    if( secondsElapsed >= timer.durationWork){
	    	if (! Session.equals('notified-work-completed-timer-' + timer._id, true ) ) {
	    		Meteor.sharedTimerFunctions.workComplete(timer);
	    	}
	    }

	    if( secondsElapsed >= timer.durationWork + timer.durationBreak ){
	    	if (! Session.equals('notified-break-completed-timer-' + timer._id, true ) ) {
	    		Meteor.sharedTimerFunctions.breakComplete( timer );
	    	}
	        Meteor.sharedTimerFunctions.markTimerComplete( timer );
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