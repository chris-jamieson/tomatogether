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