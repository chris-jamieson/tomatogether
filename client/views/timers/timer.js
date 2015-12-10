function clearInterval ( timer ) {
    var intervalId = Session.get('intervalId-timer-' + timer._id);
    Meteor.clearInterval(intervalId);
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
    Meteor.sharedTimerFunctions.startInterval(timer);
    Session.set('secondsElapsed-timer-' + timer._id, Meteor.sharedTimerFunctions.calculateSecondsElapsed(timer));
    Meteor.sharedTimerFunctions.updateTimerInSession(timer._id);
});

Template.timer.onDestroyed( function () {
    var timer = this.data;
    clearInterval(timer);
});

Template.timer.rendered = function( ) {
    // figure out seconds elapsed
    var timer = this.data;
    Session.set('secondsElapsed-timer-' + timer._id, Meteor.sharedTimerFunctions.calculateSecondsElapsed(timer));
    Meteor.sharedTimerFunctions.updateTimerInSession(timer._id);

    // initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();
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
                status = '<i class="fa fa-circle-o-notch fa-spin"></i> <span class="sr-only">in progress</span>';
                break;
            case "paused":
                if ( timerNotYetStarted ( timer ) ){
                    status = '<span class="">not started</span> <i class="fa fa-meh-o"></i> ';
                } else {
                    status = '<i class="fa fa-pause"></i> <span class="sr-only">paused</span>';
                }
                break;
            case "stopped":
                status = '<i class="fa fa-stop"></i> <span class="sr-only">stopped</span>';
                break;
            case "completed":
                status = '<i class="fa fa-check-circle-o"></i> <span class="sr-only">completed</span>';
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
        var phase = 'started';
        var secondsElapsed = Session.get('secondsElapsed-timer-' + timer._id);
        if ( typeof secondsElapsed !== "undefined" ) {
            if ( secondsElapsed <= timer.durationWork ) {
                phase = 'working';
            }
            if ( secondsElapsed > timer.durationWork ) {
                phase = 'on break';
            }
        }
        return phase;
    },
    timeRemaining: function () {
        var timer = this;
        var timeRemaining = 'calculating time';
        var secondsElapsed = Session.get('secondsElapsed-timer-' + timer._id);
        if ( typeof secondsElapsed !== "undefined" ) {
            var secondsRemaining = 0;
            if ( secondsElapsed <= timer.durationWork ) {
                // work phase
                secondsRemaining = timer.durationWork - secondsElapsed;
            }
            if ( secondsElapsed > timer.durationWork ) {
                // break phase
                var secondsBreakComplete = secondsElapsed - timer.durationWork;
                secondsRemaining = timer.durationBreak - secondsBreakComplete;
            }
            timeRemaining = moment.duration(secondsRemaining, 'seconds').humanize();
        }

        return timeRemaining;
    }
});

Template.timer.events({
    'click .start-timer': function (e) {
        e.preventDefault();
        var timer = this;
        Meteor.sharedTimerFunctions.startOrResumeTimer ( timer );
    },
    'click .pause-timer': function (e) {
        e.preventDefault();
        var timer = this;
        Meteor.sharedTimerFunctions.pauseTimer(timer);
    },
    'click .stop-timer': function (e) {
        e.preventDefault();
        var timer = this;
        if(timer.status === "started" || timer.status === "paused"){
            Timers.update({_id: timer._id}, {$set: {status: 'stopped'}}, function (error, result) {
                if(error){
                    toastr.error(error.message, "Error");
                }
                if(result){
                    Meteor.sharedTimerFunctions.updateTimerInSession(timer._id);
                    toastr.info("You stopped a timer");
                }
            });
        }else{
            toastr.error("Timer must be started or paused in order to be stopped");
        }
    }
});
