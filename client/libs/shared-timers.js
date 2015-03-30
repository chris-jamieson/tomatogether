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

	pauseTimer: function ( timer ) {
		if(timer.status === "started"){
		    if(typeof timer.secondsElapsed !== "undefined"){
		        var existingSecondsElapsed = timer.secondsElapsed;
		    }else{
		        existingSecondsElapsed = 0;
		    }
		    var startedAt = moment(timer.startedAt);
		    var pausedAt = moment();
		    var secondsElapsed = pausedAt.diff(startedAt, 'seconds');
		    secondsElapsed = secondsElapsed + existingSecondsElapsed;

		    Timers.update({_id: timer._id}, {$set: {status: 'paused', secondsElapsed: secondsElapsed}}, function (error, result) {
		        if(error){
		            toastr.error(error.message, "Error");
		        }
		        if(result){
		            Meteor.sharedTimerFunctions.updateTimerInSession(timer._id);
		            toastr.info("You paused a timer");
		        }
		    });
		}else{
		    toastr.error("You can\'t pause a timer that\'s not running");
		}
	},

	startOrResumeTimer: function ( timer ) {
		if(timer.status === "paused"){
		    var startedAt = new Date();
		    Timers.update({_id: timer._id}, {$set: {status: 'started', startedAt: startedAt}}, function (error, result) {
		        if(error){
		            toastr.error(error.message, "Error");
		        }
		        if(result){
		            Meteor.sharedTimerFunctions.updateTimerInSession(timer._id);
		            Meteor.sharedTimerFunctions.startInterval(timer);
		            toastr.info("You started a timer");
		        }
		    });
		}else{
		    toastr.error("Timer can only be started from paused state");
		}
	},

	startNewTimer: function ( ) {
		user = Meteor.user();

		var workSeconds = 25 * 60;
		var breakSeconds = 5 * 60;

		if ( typeof user.preferences !== 'undefined' ) {
			workSeconds = user.preferences.defaultTimerDurationWork;
			breakSeconds = user.preferences.defaultTimerDurationBreak;
		}

		// @TODO handle long breaks
		var startedAt = new Date();
		Timers.insert({ durationWork: workSeconds, durationBreak: breakSeconds, status: 'started', startedAt: startedAt }, function (error, result) {
		    if(error){
		        // @TODO better error display for user
		        console.log(error);
		    }
		    
		    if(result){
		        // @TODO nice notification
		    }
		});
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
		var audioVolume = 80; // default
		var user = Meteor.user();
		if ( typeof user.preferences !== 'undefined' ) {
			audioNotificationsEnabled = user.preferences.enableAudioNotifications;
			audioVolume = user.preferences.audioNotificationsVolume;
		}

		if ( audioNotificationsEnabled === true ) {
			if ( !buzz.isSupported ) {
				console.log('can\'t play sounds because buzz.js not supported');
			}else{
				var soundFileName = Meteor.sharedTimerFunctions.soundFileName( notificationType );
				var s = new buzz.sound('/sounds/' + soundFileName, {
					formats: [ 'wav' ], // @TODO add other file types to support other browsers: ['ogg', 'mp3', 'aac', 'wav']
					volume: audioVolume
				});
				s.play();
			}
		}
	},

	showDesktopNotification: function ( timer, notificationType ) {
		var user = Meteor.user();
		var desktopNotificationsEnabled = false;
		var autoStartNewTimer = false;
		var autoContinueToBreak = false;
		if ( typeof user.preferences !== undefined ) {
			if ( user.preferences.enableDesktopNotifications === true ) {
				desktopNotificationsEnabled = true;
			}
			if ( user.preferences.autoContinueToBreak === true ) {
				autoContinueToBreak = true;
			}
			if ( user.preferences.autoStartNewTimer === true ) {
				autoStartNewTimer = true;
			}
		}

		var isOwnTimer = false;
		if ( user._id == timer.createdBy ){
			isOwnTimer = true;
		}

		// @TODO handle follower mode

		if ( typeof notificationType !== 'undefined' ) {
			switch ( notificationType ) {
				case 'breakComplete':
					if ( isOwnTimer ) {
						if ( desktopNotificationsEnabled === true ) {
							PNotify.desktop.permission();
						}
						if ( autoStartNewTimer === true ) {
							(new PNotify({
								title: 'Break over!',
								text: 'A new work timer will be started automatically.',
								desktop: {
									desktop: desktopNotificationsEnabled,
									icon: '',
								}
							}));
						}else {
							(new PNotify({
								title: 'Break over!',
								text: 'Ready to get back to work? Click to start a new work timer.',
								desktop: {
									desktop: desktopNotificationsEnabled,
									icon: '',
								}
							})).get().click(function ( e ) {
								if ( $('.ui-pnotify-closer, .ui-pnotify-sticker, .ui-pnotify-closer *, .ui-pnotify-sticker *').is(e.target)) return;
								Meteor.sharedTimerFunctions.startNewTimer();
							});
						}
					} else {
						// @TODO notify the user when another user's timer
					}
					break;
				case 'workComplete':
					if ( isOwnTimer ) {
						if ( desktopNotificationsEnabled === true ) {
							PNotify.desktop.permission();
						}
						if ( autoContinueToBreak === true ) {
							(new PNotify({
								title: 'Work is over!',
								text: 'The work phase of your timer was completed. Enjoy your break. ',
								desktop: {
									desktop: desktopNotificationsEnabled,
									icon: '',
								}
							}));
						} else {
							(new PNotify({
								title: 'Work is over!',
								text: 'The work phase of your timer was completed. Click to start a break. ',
								desktop: {
									desktop: desktopNotificationsEnabled,
									icon: '',
								}
							})).get().click(function ( e ) {
								if ( $('.ui-pnotify-closer, .ui-pnotify-sticker, .ui-pnotify-closer *, .ui-pnotify-sticker *').is(e.target)) return;
								var updatedTimer = Timers.findOne( { _id: timer._id } );
								Meteor.sharedTimerFunctions.startOrResumeTimer ( updatedTimer );
							});
						}
					} else {
						// @TODO notify the user when another user's timer
					}
					break;
			}
		}

	},

	workComplete: function (timer) {
		var user = Meteor.user();
		// only notifying user on changes to their own timer
		if( user._id === timer.createdBy ) {
			Meteor.sharedTimerFunctions.playAudioNotification('workComplete');
			Meteor.sharedTimerFunctions.showDesktopNotification( timer, 'workComplete' );
			Session.set('notified-work-completed-timer-' + timer._id, true );

			if ( typeof user.preferences !== 'undefined' ) {
				if ( user.preferences.autoContinueToBreak === false ) {
					Meteor.sharedTimerFunctions.pauseTimer ( timer );
				}
			}
		}
	},

	breakComplete: function ( timer ) {
		var user = Meteor.user ();
		// only notifying user on changes to their own timer
		if( user._id === timer.createdBy ) {
			Meteor.sharedTimerFunctions.playAudioNotification( 'breakComplete' );
			Meteor.sharedTimerFunctions.showDesktopNotification( timer, 'breakComplete' );
			Session.set('notified-break-completed-timer-' + timer._id, true );

			if ( typeof user.preferences !== 'undefined' ) {
				if ( user.preferences.autoStartNewTimer === true ) {
					Meteor.sharedTimerFunctions.startNewTimer();
				}
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