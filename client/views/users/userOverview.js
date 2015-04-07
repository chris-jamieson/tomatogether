function isFollowingUser ( followerUser, followeeUserId ) {
    var isFollowing = false;
    
    if ( typeof followerUser.following !== "undefined" ) {
        if ( followerUser.following == followeeUserId ) {
            isFollowing = true;
        }
    }
    
    return isFollowing;
}

Template.userOverview.helpers ( {
    isFollowing: function () {
        return isFollowingUser ( Meteor.user(), this );
    },
    isSelf: function () {
        var currentUserId = Meteor.userId();
        
        if ( currentUserId == this ){
            return true;
        }else{
            return false;
        }
    },
    followsCurrentUser: function () {
        var userId = String(this);
        var userToCheck = Meteor.users.findOne( { _id: userId  } );
        return isFollowingUser ( userToCheck, Meteor.userId() );
    }
} );

Template.userOverview.events( {
    'click button[name="stop-following"]': function ( event ) {
        event.preventDefault();
        var currentUserId = Meteor.userId();
        var userIdToFollow = String( this );
        // check we are actually following
        if ( isFollowingUser( Meteor.user(), userIdToFollow ) === true ) {
            Meteor.users.update( { _id: currentUserId }, { $unset: { following: '' } }, function ( error, result ) {
                if ( error ) {
                    console.log ( error );
                }
                
                if ( result ) {
                    console.log ( result );
                }
            } );
        }else {
            // no need to do anything
        }
        
    },
    'click button[name="start-following"]': function ( event ) {
        event.preventDefault();
        var currentUserId = Meteor.userId();
        var userIdToFollow = String( this );
        // check we are not already following
        if ( isFollowingUser(Meteor.user(), userIdToFollow ) === true ) {
            // no need to do anything
        }else {
            Meteor.users.update( { _id: currentUserId }, { $set: { following: userIdToFollow } }, function ( error, result ) {
                if ( error ) {
                    console.log ( error );
                }
                
                if ( result ) {
                    console.log ( result );
                }
            } );
        }
        
    }
    
} );