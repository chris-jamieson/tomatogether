Meteor.publish("allTeams", function () {
  return [
    Teams.find( {} ), // @TODO we need a publication just for teams I'm in
  ];
});

// @TODO should be a publication just for users in teams I'm in
Meteor.publish("allUserData", function () {
    return Meteor.users.find({}, {fields: {'emails': 1}});
});

Meteor.publish("teamTimers", function (teamId) {
  // Check argument
  check(teamId, String);

  // load the team, get all users from the team
  var team = Teams.findOne( { _id: teamId } );

  return [
    Timers.find({ createdBy: { $in: team.members } }),
  ];
});

Meteor.publish("myUserData", function () {
  return Meteor.users.find( { _id: this.userId }, { fields: {
    'profile': 1,
    'preferences': 1
  }} );
});