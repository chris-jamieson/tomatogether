/**
 * Configuration
 */
Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'spinner',
    notFoundTemplate: 'notFound',
});

Router.onRun(function() {
    this.next();
});

/**
 * enforce admin-only pages
 */
Router.onBeforeAction(function() {
    if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
        this.next();
    } else {
        this.render('accessDenied');
        this.stop();
    }
}, {
    only: [] // TODO add admin routes here
});

Router.onBeforeAction(function() {
    if (!Meteor.user()) {
        // if the user is not logged in, render the Login template
        this.render('entrySignIn');
    } else {
        // otherwise don't hold up the rest of hooks or our route/action function from running
        this.next();
    }
}, {
    except: [
            'home',
            'signout-path-redirect',
            'entrySignIn',
            'entrySignOut',
            'entrySignUp',
            'entryForgotPassword',
            'entryResetPassword',
        ] // TODO add anonymous routes here
});

Router.route('/', {
  name: 'home',
  waitOn: function() {
    return [];
  },
  action: function() {
    if (this.ready()) {
      this.render('home', {
        data: {},
      });
    }
    else {
      this.render('spinner');
    }
  }
});

Router.route('/teams', {
  waitOn: function() {
    return [
    Meteor.subscribe('allUserData')
    ];
  },

  action: function() {
    if (this.ready()){
        this.render('teams');
    }else{
        this.render('spinner');
    }
  }
});

Router.route('/user/edit', {
  waitOn: function() {
    return [
      Meteor.subscribe('myUserData'),
    ];
  },

  action: function() {
    if (this.ready()){
        this.render('userPreferences', {
          data: {
            user: Meteor.users.findOne({ _id: Meteor.userId() })
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
      Meteor.subscribe('allTeams'),
      Meteor.subscribe('allUserData'),
      Meteor.subscribe('myUserData'),
      ];
  },

  action: function() {
    if (this.ready()){
        var team = Teams.findOne( {_id : this.params._id} );
        // ensure the current user is at the top of the list
        var currentUserId = Meteor.userId();
        var removedItem = false;

        for (var i = team.members.length - 1; i >= 0; i--) {
          if ( team.members[i] === currentUserId ) {
            removedItem = team.members[i];
            // remove this item
            team.members.splice(i, 1);
          }
        }
        // put the current user back at the start
        if ( removedItem !== false ) {
          team.members.unshift(removedItem);
        }

        this.render('teamTimers', {
          data: {
            team: team,
          }
        });
    } else{
        this.render('spinner');
    }
  }
});
