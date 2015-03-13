Template.insertTeamForm.events({
    'click .submit-insert-team-form': function (e) {
        e.preventDefault();
        var name = $('input[name="team-name"]').val();
        if(name == ''){
            name = 'My Awesome Team';
        }

        var members = [Meteor.userId()];

        Teams.insert( { name:  name, members: members}, function ( error, result ) {
            if(error){
                console.log(error);
            }

            if(result){
                console.log(result);
            }

        });
    }
});