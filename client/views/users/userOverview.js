function isFollowingUser ( userId ) {
    var isFollowing = false;
    var currentUser = Meteor.user();
    
    if ( typeof currentUser.following !== "undefined" ) {
        if ( currentUser.following == userId ) {
            isFollowing = true;
        }
    }
    
    return isFollowing;
}

Template.userOverview.helpers ( {
    isFollowing: function () {
        return isFollowingUser ( this );
    },
    isSelf: function () {
        var currentUserId = Meteor.userId();
        
        if ( currentUserId == this ){
            return true;
        }else{
            return false;
        }
    }
} );

Template.userOverview.events( {
    'click button[name="stop-following"]': function ( event ) {
        event.preventDefault();
        var currentUserId = Meteor.userId();
        var userIdToFollow = String( this );
        // check we are actually following
        if ( isFollowingUser( userIdToFollow ) === true ) {
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
        if ( isFollowingUser( userIdToFollow ) === true ) {
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