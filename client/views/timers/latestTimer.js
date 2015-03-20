Template.latestTimer.rendered = function () {
    console.log('this: ', this);
    // var userId = this.data;
    // var latestTimer = getLatestTimer(userId);
    // Session.set('latestTimer-' + userId, latestTimer);
};

function getLatestTimer(userId){
    var latestTimer = Timers.findOne( { createdBy: userId } );
    return latestTimer;
}

Template.latestTimer.helpers({
    timer: function() {
        var userId = this;
        console.log('userId: ' + userId);
        return getLatestTimer(userId);
    }
});