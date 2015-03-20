function calculateSecondsElapsed(timer){
    var secondsElapsed = 0;
    switch(timer.status){
        case 'started':
            // @TODO use moment to calculate seconds elapsed since time started
            secondsElapsed = timer.secondsElapsed;
            break;
        case 'paused':
            secondsElapsed = timer.secondsElapsed;
            break;
        case 'stopped':
            secondsElapsed = timer.secondsElapsed;
            break;
        case 'completed':
            secondsElapsed = timer.durationWork + timer.durationBreak;
            break;
    }
    
    return secondsElapsed;
}

Template.timer.rendered = function( ) {
    // figure out seconds elapsed
    Session.set('secondsElapsed-timer-' + this.data._id, calculateSecondsElapsed(this.data));
};

Template.timer.helpers({
    percentageComplete: function () {
        var totalSeconds = this.durationWork + this.durationBreak;
        var secondsElapsed = Session.get('secondsElapsed-timer-' + this._id);
        return (totalSeconds / secondsElapsed) * 100;
    },
    ownTimer: function () {
        var currentUserId = Meteor.userId();
        if (currentUserId == this.createdBy){
            return true;
        }else{
            return false;
        }
    }
});

Template.timer.events({
    'click .start-timer': function (e) {
        e.preventDefault();
        var startedAt = new Date();
        Timers.update({_id: this._id}, {$set: {status: 'started', startedAt: startedAt}}, function (error, result) {
            if(error){
                console.log(error);
            }
            if(result){
                console.log(result);
            }
        });
    },
    'click .pause-timer': function (e) {
        e.preventDefault();
        var startedAt = moment(this.startedAt);
        var pausedAt = moment();
        var secondsElapsed = startedAt.diff(pausedAt, 'seconds');
        Timers.update({_id: this._id}, {$set: {status: 'paused', secondsElapsed: secondsElapsed}}, function (error, result) {
            if(error){
                console.log(error);
            }
            if(result){
                console.log(result);
            }
        });
    },
    'click .stop-timer': function (e) {
        e.preventDefault();
        Timers.update({_id: this._id}, {$set: {status: 'stopped'}}, function (error, result) {
            if(error){
                console.log(error);
            }
            if(result){
                console.log(result);
            }
        });
    }
});