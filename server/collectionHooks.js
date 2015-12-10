Timers.after.insert(function (userId, doc) {
    // see if any users are following this user
    Meteor.users.find ( { following: doc.createdBy } ).forEach(function( follower ){
        // change the user ID and remove the doc ID
        var docToInsert = doc;
        delete doc._id;
        docToInsert.createdBy = follower._id;
        // insert a cloned timer
        Timers.insert( docToInsert, function ( error, result ) {
            if ( error ){
                console.log ( error );
            }

            if ( result ){
                console.log ( result );
            }
        } );
    });
});

Timers.after.update(function (userId, doc, fieldNames, modifier, options) {
    // see if any users are following this user
    Meteor.users.find ( { following: doc.createdBy } ).forEach(function( follower ){
        // find the most recent timer
        var timers = Timers.find( { createdBy: follower._id }, { sort: { createdAt: -1 }, limit: 1 } ).fetch();

		if(timers.length > 0){
			var docToUpdate = timers[0];
			// we only want to change the status, startedAt, and secondsElapsed fields
			var $set = {
			    status: doc.status,
			    startedAt: doc.startedAt,
			    secondsElapsed: doc.secondsElapsed
			};

			Timers.update( docToUpdate._id, { $set: $set }, function ( error, result ) {
                if ( error ){
                    console.log ( error );
                }

                if ( result ){
                    console.log ( result );
                }
            } );
		}
    });
});

Meteor.users.after.update(function (userId, doc, fieldNames, modifier, options) {
    // see if this user has updated their following field
    if( _.contains(fieldNames, 'following')) {
        if ( doc.following && doc.following !== '' ) {
            // stop this user's latest timer
            var myTimers = Timers.find( { createdBy: doc._id }, { sort: { createdAt: -1 }, limit: 1 } ).fetch();
            if (myTimers.length > 0) {
                Timers.update( myTimers[0]._id, { $set: { status: 'stopped' } }, function ( error, result ) {
                    if ( error ){
                        console.log ( error );
                    }

                    if ( result ){
                        console.log ( result );
                    }
                } );
            }

            // find the leader's recent timer and clone it
            var leaderId = doc.following;
            var timers = Timers.find( { createdBy: leaderId }, { sort: { createdAt: -1 }, limit: 1 } ).fetch();
            if ( timers.length > 0 ) {
                // change the user ID and remove the doc ID
                var docToInsert = timers[0];
                delete docToInsert._id;
                docToInsert.createdBy = doc._id;
                // insert a cloned timer
                Timers.insert( docToInsert, function ( error, result ) {
                    if ( error ){
                        console.log ( error );
                    }

                    if ( result ){
                        console.log ( result );
                    }
                } );
            }

        }
    }
});
