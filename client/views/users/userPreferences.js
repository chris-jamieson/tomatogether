Template.userPreferences.rendered = function () {
	console.log( this.data );
}

Template.userPreferences.events({
	'change input': function ( event ) {
		var user = this;
		var target = event.target;
		var fieldName = target.name;

		var value;
		if ( target.type === "checkbox" ) {
			value = target.checked;
		}else {
			value = target.value;
		}

		Meteor.users.update({ _id: this._id }, { $set: { fieldName: value } }, function ( error, result ) {
			console.log( 'error: ', error );
			console.log( 'result: ', result );
		});
	}
});