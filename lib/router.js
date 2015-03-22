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

        this.render('teamTimers', {
          data: {
            team: team,
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