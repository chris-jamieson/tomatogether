Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'spinner',
  notFoundTemplate: 'notFound',
});

Router.route('/', {
  action: function() {
    if (this.ready()){
        this.redirect('/teams');
    }else{
        this.render('spinner');
    }
  }
});

Router.route('/teams', {
  waitOn: function() {
    return Meteor.subscribe('allTeams');
  },

  action: function() {
    if (this.ready()){
        this.render('teams', {
          data: {
            teams: Teams.find({})
          }
        });
    }else{
        this.render('spinner');
    }
  }
});

Router.route('/timers/teams/:_id', {
  waitOn: function() {
    return [
      Meteor.subscribe('teamTimers', this.params._id),
      Meteor.subscribe('allTeams')
      ];
  },

  action: function() {
    if (this.ready()){
        var team = Teams.findOne( {_id : this.params._id} );
        var latestTimers = [];
        var teamMembersCount = team.members.length;
        for (var i = teamMembersCount; i--; ) {
          var latestTimer = Timers.find( { createdBy: team.members[i] }, { sort: { createdAt: -1 }, limit: 1 }).fetch();
          latestTimers.push(latestTimer[0]);
        }
        // @TODO set the current user's timer as the first in the array
        this.render('teamTimers', {
          data: {
            team: team,
            latestTimers: latestTimers
          }
        });
    }else{
        this.render('spinner');
    }
  }
});