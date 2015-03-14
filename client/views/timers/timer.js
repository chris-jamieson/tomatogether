Template.timer.rendered = function () {
    var userId = this.data;
    var latestTimer = Timers.find( { createdBy: userId }, {sort: {createdAt: -1}, limit: 1 } );
    Session.set('latestTimer-' + userId, latestTimer);
};

Template.timer.helpers({
    timer: function() {
        return Session.get('latestTimer-' + this);
    }
});