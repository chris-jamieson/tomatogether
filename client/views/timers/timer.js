function markTimerComplete (timer) {
    if ( timer.status !== "completed" ){
        var totalSeconds = timer.durationWork + timer.durationBreak;
        Timers.update({_id: timer._id}, {$set: {status: 'completed', secondsElapsed: totalSeconds}}, function (error, result) {
            if(error){
                console.log(error);
            }
            if(result){
                console.log(result);
                updateTimerInSession(timer._id);
                clearInterval(timer);
            }
        });
    }
}

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
        console.log('timer should be marked complete');
        markTimerComplete(timer);
    }

    return secondsElapsed;
}

function startInterval ( timer ) {
    if( timer.status !== "completed"){
        var intervalId = Meteor.setInterval( function () {
            var updatedTimer = Session.get('timer-object-' + timer._id);
            Session.set('secondsElapsed-timer-' + timer._id, calculateSecondsElapsed(updatedTimer));
        }, 1000 );

        Session.set('intervalId-timer-' + timer._id, intervalId);
    }
}

function clearInterval ( timer ) {
    var intervalId = Session.get('intervalId-timer-' + timer._id);
    Meteor.clearInterval(intervalId);
}

function updateTimerInSession ( timerId ) {
    var timer = Timers.findOne( { _id : timerId } );
    Session.set('timer-object-' + timerId, timer);
}

function timerNotYetStarted (timer ) {
    if ( timer.status === "paused" && timer.secondsElapsed === 0) {
        return true;
    } else {
        return false;
    }
}

Template.timer.onCreated( function () {
    var timer = this.data;
    startInterval(timer);
    Session.set('secondsElapsed-timer-' + timer._id, calculateSecondsElapsed(timer));
    updateTimerInSession(timer._id);
});

Template.timer.onDestroyed( function () {
    var timer = this.data;
    clearInterval(timer);
});

Template.timer.rendered = function( ) {
    // figure out seconds elapsed
    var timer = this.data;
    Session.set('secondsElapsed-timer-' + timer._id, calculateSecondsElapsed(timer));
    updateTimerInSession(timer._id);
};

Template.timer.helpers({
    percentageWorkComplete: function () {
        var timer = this;
        var percentageWorkComplete = 0;
        var totalSeconds = timer.durationWork + timer.durationBreak;
        var secondsElapsed = Session.get('secondsElapsed-timer-' + timer._id) || 0;
        if ( secondsElapsed >= timer.durationWork ){
            percentageWorkComplete = 100;
        }else{
            percentageWorkComplete = ( secondsElapsed / timer.durationWork ) * 100;
        }
        // calculate percentage of total
        var workAsPercentageOfTotal = (timer.durationWork / totalSeconds) * 100;
        return Math.round(workAsPercentageOfTotal * (percentageWorkComplete / 100));
    },
    percentageBreakComplete: function () {
        var timer = this;
        var percentageBreakComplete = 0;
        var totalSeconds = timer.durationWork + timer.durationBreak;
        var secondsElapsed = Session.get('secondsElapsed-timer-' + timer._id || 0);
        if ( secondsElapsed <= timer.durationWork ) {
            percentageBreakComplete = 0;
        }else{
            var secondsBreakComplete = secondsElapsed - timer.durationWork;
            percentageBreakComplete = ( secondsBreakComplete / timer.durationBreak ) * 100;
        }
        // calculate percentage of total
        var breakAsPercentageOfTotal = (timer.durationBreak / totalSeconds) * 100;
        return Math.round(breakAsPercentageOfTotal * (percentageBreakComplete / 100));
    },
    progressbarClasses: function (args) {
        var classes = ['progress-bar'];
        var phase = args.hash.phase;
        var timer = this;
        var secondsElapsed = Session.get('secondsElapsed-timer-' + timer._id || 0);
        
        // colour class
        if ( phase === "work" ) {
            classes.push( 'progress-bar-danger' );
        }
        if ( phase === "break" ) {
            classes.push( 'progress-bar-success' );
        }

        // striped?
        if ( secondsElapsed <= timer.durationWork ) {
            if ( phase === "work" ) {
                classes.push( 'progress-bar-striped' );
                // animated?
                if ( timer.status === "started" ) {
                    classes.push( "active" );
                }
            }
        }

        if ( secondsElapsed > timer.durationWork  && secondsElapsed < timer.durationWork + timer.durationBreak) {
            if ( phase === "break" ) {
                classes.push( 'progress-bar-striped' );
                // animated?
                if ( timer.status === "started" ) {
                    classes.push( "active" );
                }
            }
        }
        
        return classes.join( ' ' );
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
    },
    statusFormatted: function () {
        var timer = this;
        var status = '';
        switch(timer.status){
            case "started":
                status = "in progress";
                break;
            case "paused":
                if ( timerNotYetStarted ( timer ) ){
                    status = "not started";
                } else {
                    status = "paused";
                }
                break;
            case "stopped":
                status = "stopped";
                break;
            case "completed":
                status = "completed";
                break;
        }
        return status;
    },
    showProgressInformation: function () {
        var timer = this;
        var show = false;
        if ( timer.status === "started" || timer.status === "paused"){
            if ( timerNotYetStarted ( timer ) ){
                show = false;
            }else{
                show = true;
            }
        }else{
            show = false;
        }
        return show;
    },
    timerPhase: function () {
        var timer = this;
        var phase = '';
        var secondsElapsed = Session.get('secondsElapsed-timer-' + timer._id || 0);
        if ( secondsElapsed <= timer.durationWork ) {
            phase = 'working';
        }
        if ( secondsElapsed > timer.durationWork ) {
            phase = 'on break';
        }
        return phase;
    },
    timeRemaining: function () {
        var timer = this;
        var timeRemaining = '';
        var secondsElapsed = Session.get('secondsElapsed-timer-' + timer._id || 0);
        var secondsRemaining = 0;
        if ( secondsElapsed <= timer.durationWork ) {
            // work phase
            secondsRemaining = timer.durationWork - secondsElapsed;
        }
        if ( secondsElapsed > timer.durationWork ) {
            // break phase
            var secondsBreakComplete = secondsElapsed - timer.durationWork;
            secondsRemaining = timer.durationBreak - secondsElapsed;
        }
        timeRemaining = moment.duration(secondsRemaining, 'seconds').humanize();
        return timeRemaining;
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