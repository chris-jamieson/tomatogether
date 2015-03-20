Template.insertTimerForm.events({
    'click .insert-timer-form-submit': function (e) {
        e.preventDefault();
        var workMinutes = $('input[name="work-minutes"]').val();
        var breakMinutes = $('input[name="break-minutes"]').val();
        
        var workSeconds = workMinutes * 60;
        var breakSeconds = breakMinutes * 60;
        Timers.insert({ durationWork: workSeconds, durationBreak: breakSeconds }, function (error, result) {
            if(error){
                console.log(error);
            }
            
            if(result){
                console.log(result);
            }
        });
    }
});