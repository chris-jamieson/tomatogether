function isInTeam ( team, userId ) {
	var isMemberOfTeam = false;
	if ( userId ) {
		if(team.members.indexOf(userId) !== -1){
			isMemberOfTeam = true;
		} else {
			isMemberOfTeam = false;
		}
	}
	return isMemberOfTeam;
}

Template.team.helpers({
	memberOfTeam: function () {
		var team = this;
		var currentUserId = Meteor.userId();
		var isMemberOfTeam = isInTeam(team, currentUserId);

		return isMemberOfTeam;
	},
	isGroupAdmin: function (args) {
		var administrators = args.hash.administrators;
		var userId = args.hash.userId;

		return _.contains(administrators, userId);
	},
	canLeaveTeam: function () {
		var team = this;
		var currentUserId = Meteor.userId();

		if ( isInTeam(team, currentUserId) ) {
			// must be at least one member in a team
			if ( team.members.length > 1 ) {
				return true;
			}
		}
	},
	canDeleteTeam: function () {
		var team = this;
		var currentUserId = Meteor.userId();

		if ( isInTeam(team, currentUserId) ) {
			// can only delete if is the last member of the team
			for (var i = team.members.length - 1; i >= 0; i--) {
				if ( team.members[i] !== currentUserId ) {
					return false;
				}
			};
		}

		// if all checks have been passed, user can delete the team
		return true;
	},
	canJoinTeam: function () {
		var team = this;
		var currentUserId = Meteor.userId();

		if ( currentUserId ) {
			return true;
		}
	}
});

Template.team.events({
	'click .team-join': function (e) {
		e.preventDefault();
		var team = this;
		var currentUserId = Meteor.userId();
		if ( currentUserId ){
			// update the team collection
			Teams.update({_id: team._id}, {$push: {members: currentUserId}}, function (error, result) {
			    if(error){
			    	console.log(error);
			        toastr.error(error.message, "Error");
			    }
			    if(result){
			        toastr.info("You joined " + team.name);
			    }
			});
		}
	},
	'click .team-leave': function (e) {
		e.preventDefault();
		var team = this;
		var currentUserId = Meteor.userId();
		if ( currentUserId ){
			// update the team collection
			Teams.update({_id: team._id}, {$pull: {members: currentUserId}}, function (error, result) {
			    if(error){
			        toastr.error(error.message, "Error");
			    }
			    if(result){
			        toastr.info("You left " + team.name);
			    }
			});
		}
	},
});