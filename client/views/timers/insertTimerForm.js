Template.insertTimerForm.helpers({
    'suggestedBreakDuration': function () {
        // should be in mins
        var duration = 5;
        var user = Meteor.user();
        if ( typeof user.preferences !== 'undefined' ) {
            duration = user.preferences.defaultTimerDurationBreak / 60;
        }

        // @TODO check if should be a long break here

        return duration;
    },
    'suggestedWorkDuration': function () {
        // should be in mins
        var duration = 15;
        var user = Meteor.user();
        if ( typeof user.preferences !== 'undefined' ) {
            duration = user.preferences.defaultTimerDurationWork / 60;
        }

        return duration;
    },

});

Template.insertTimerForm.events({
    'click .insert-timer-form-submit': function (e) {
        e.preventDefault();
        var workMinutes = $('input[name="work-minutes"]').val();
        var breakMinutes = $('input[name="break-minutes"]').val();
        
        var workSeconds = workMinutes * 60;
        var breakSeconds = breakMinutes * 60;
        Timers.insert({ durationWork: workSeconds, durationBreak: breakSeconds }, function (error, result) {
            if(error){
                // @TODO better error display for user
                console.log(error);
            }
            
            if(result){
                // console.log(result);
            }
        });
    }
});