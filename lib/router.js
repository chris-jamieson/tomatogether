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

        var timers = Timers.find( { createdBy: {$in: team.members} } ).fetch();
        var groupedMembers = _.groupBy(_.pluck(timers, 'createdBy'));

        var latestTimers = [];
        _.each(_.values(groupedMembers), function(members) {
          // find this user's most recent timer
          var mostRecentTimerDate = moment('1970-01-01');
          var mostRecentTimer = {};
          for (var i = timers.length - 1; i >= 0; i--) {
            if ( moment(timers[i].createdAt).isAfter(mostRecentTimerDate) ) {
              mostRecentTimer = timers[i];
              mostRecentTimerDate = moment(timers[i].createdAt);
            }
          };
          latestTimers.push( mostRecentTimer );
        });

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

Router.route('/timers/add', {
  action: function () {
    if ( this.ready () ){
      this.render ( 'insertTimerForm' );
    }
  }
})