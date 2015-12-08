Template.insertTeamForm.events({
    'click .submit-insert-team-form': function (e) {
        e.preventDefault();
        var name = $('input[name="team-name"]').val();
        if(name === ''){
            name = 'My Awesome Team';
        }

        var members = [Meteor.userId()];

        Teams.insert( { name:  name, members: members, administrators: members}, function ( error, result ) {
            if(error){
                toastr.error(error);
            }

            if(result){
                console.log(result);
            }

        });
    }
});


Template.insertTeamForm.helpers({
    placeholderTeamName: function(){
        var teamNames = [
            'The Mighty Ducks',
            'Average Joe\'s',
            'London Silly Nannies',
            'The Bears',
            'Toon Squad',
            'Team Momentum',
            'Team Dynamic',
            'The Famous Five',
            'The Magnificent Seven'
        ];
        var rand = teamNames[Math.floor(Math.random() * teamNames.length)];
        return rand;
    }
});
