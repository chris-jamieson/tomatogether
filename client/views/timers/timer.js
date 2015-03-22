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
            // @TODO should include secondsSinceStarted
            break;
        case 'completed':
            secondsElapsed = timer.durationWork + timer.durationBreak;
            break;
    }

    return secondsElapsed;
}

function startInterval (timer) {
    var intervalId = Meteor.setInterval( function () {
        var updatedTimer = Session.get('timer-object-' + timer._id);
        Session.set('secondsElapsed-timer-' + timer._id, calculateSecondsElapsed(updatedTimer));
    }, 1000 );

    Session.set('intervalId-timer-' + timer._id, intervalId);
}

function updateTimerInSession ( timerId ) {
    var timer = Timers.findOne( { _id : timerId } );
    Session.set('timer-object-' + timerId, timer);
}

Template.timer.onCreated( function () {
    var timer = this.data;
    startInterval(timer);
    Session.set('secondsElapsed-timer-' + timer._id, calculateSecondsElapsed(timer));
    updateTimerInSession(timer._id);
});

Template.timer.onDestroyed( function () {
    var timer = this.data;
    var intervalId = Session.get('intervalId-timer-' + timer._id);
    Meteor.clearInterval(intervalId);
});

Template.timer.rendered = function( ) {
    // figure out seconds elapsed
    var timer = this.data;
    Session.set('secondsElapsed-timer-' + timer._id, calculateSecondsElapsed(timer));
    updateTimerInSession(timer._id);
};

Template.timer.helpers({
    percentageComplete: function () {
        var timer = this;
        var totalSeconds = timer.durationWork + timer.durationBreak;
        var secondsElapsed = Session.get('secondsElapsed-timer-' + timer._id);
        if(typeof secondsElapsed === "undefined"){
            console.log('it was undefined');
            secondsElapsed = 0;
            Session.set('secondsElapsed-timer-' + timer._id, calculateSecondsElapsed(timer));
            updateTimerInSession(timer._id);
        }
        return (secondsElapsed / totalSeconds) * 100;
    },
    ownTimer: function () {
        var currentUserId = Meteor.userId();
        if (currentUserId == this.createdBy){
            return true;
        }else{
            return false;
        }
    },
    notStartable: function () {
        if( this.status === "paused" ){
            return false;
        }else{
            return true;
        }
    },
    notPausable: function () {
        if( this.status === "started" ){
            return false;
        }else{
            return true;
        }
    },
    notStoppable: function () {
        if( this.status === "started" || this.status === "paused" ){
            return false;
        }else{
            return true;
        }
    },
    completedOrStopped: function () {
        if( this.status === "stopped" || this.status === "completed" ){
            return true;
        }else{
            return false;
        }
    }
});

Template.timer.events({
    'click .start-timer': function (e) {
        e.preventDefault();
        var timer = this;
        if(timer.status === "paused"){
            var startedAt = new Date();
            Timers.update({_id: timer._id}, {$set: {status: 'started', startedAt: startedAt}}, function (error, result) {
                if(error){
                    console.log(error);
                }
                if(result){
                    console.log(result);
                    updateTimerInSession(timer._id);
                    startInterval(timer);
                }
            });
        }else{
            console.log('Timer can only be started from paused state');
        }
    },
    'click .pause-timer': function (e) {
        e.preventDefault();
        var timer = this;
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
                    console.log(error);
                }
                if(result){
                    console.log(result);
                    updateTimerInSession(timer._id);
                }
            });
        }else{
            console.log('can\'t pause a timer that\'s not running');
        }

    },
    'click .stop-timer': function (e) {
        e.preventDefault();
        var timer = this;
        if(timer.status === "started" || timer.status === "paused"){
            Timers.update({_id: timer._id}, {$set: {status: 'stopped'}}, function (error, result) {
                if(error){
                    console.log(error);
                }
                if(result){
                    console.log(result);
                    updateTimerInSession(timer._id);
                }
            });
        }else{
            console.log('Timer must be started or paused in order to be stopped');
        }
    }
});