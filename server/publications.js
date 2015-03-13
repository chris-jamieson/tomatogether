Meteor.publish("allTeams", function () {
  return [
    Teams.find( {} ), // @TODO we need a publication just for teams I'm in
  ];
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