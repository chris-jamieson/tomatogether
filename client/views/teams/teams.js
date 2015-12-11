Template.teams.created = function(){
    var instance = this;

    instance.showInsertTeamForm = new ReactiveVar( false );

    instance.autorun(function () {
        var subscription = instance.subscribe( 'allTeams' );

        if ( subscription.ready() ) {
            if ( Teams.find({}).count() === 0 ) {
                instance.showInsertTeamForm.set(true);
            }
        }
    });

    instance.teams = function() {
        return Teams.find({});
    };
};


Template.teams.helpers({
    showInsertTeamForm: function(){
        return Template.instance().showInsertTeamForm.get();
    },
    teams: function () {
        return Template.instance().teams();
    }
});

Template.teams.events({
    "click button[name='show-insert-team-form']": function(event, instance){
        event.preventDefault();
        instance.showInsertTeamForm.set(true);
    }
});
