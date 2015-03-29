Template.userPreferences.rendered = function () {
	console.log( this.data );
	Session.set('allChangesSaved', true);
};

Template.userPreferences.helpers({
	'saveStatusText': function () {
		var savingInProgress = Session.equals('savingInProgress', true);
		var allChangesSaved = Session.equals('allChangesSaved', true);
		var text = 'Save';

		if ( savingInProgress === true ) {
			text =  'Saving&hellip;';
		}else if ( savingInProgress === false && allChangesSaved === true) {
			text =  'Autosaved';
		}

		return text;
	},
	'saveButtonDisabled': function () {
		var savingInProgress = Session.equals('savingInProgress', true);
		var allChangesSaved = Session.equals('allChangesSaved', true);
		var disabled = true;
		if ( allChangesSaved === false ) {
			disabled = false;
		}else if ( savingInProgress === true ) {
			disabled = true;
		}

		return disabled;
	},
	'soundEffectBreakCompletedOptions': function ( ) {
		var user = this.user;
		var options = [
			{
				value: 'bigben',
				text: 'Chimes of (small) Big Ben',
			}
		];

		for (var i = options.length - 1; i >= 0; i--) {
			// add a field name
			options[i].fieldName = "preferences.soundEffectBreakCompleted";
			// check if checked
			if ( options[i].value === user.preferences.soundEffectBreakCompleted ) {
				options[i].isChecked = true;
			}
		}

		return options;
	},
	'soundEffectWorkCompletedOptions': function ( ) {
		var user = this.user;
		var options = [
			{
				value: 'bigben',
				text: 'Chimes of (small) Big Ben',
			}
		];

		for (var i = options.length - 1; i >= 0; i--) {
			// add a field name
			options[i].fieldName = "preferences.soundEffectWorkCompleted";
			// check if checked
			if ( options[i].value === user.preferences.soundEffectWorkCompleted ) {
				options[i].isChecked = true;
			}
		}

		return options;
	}
});

Template.userPreferences.events({
	'change input': function ( event ) {
		var user = this.user;
		var target = event.target;
		var fieldName = target.name;

		var value;
		if ( target.type === "checkbox" ) {
			value = target.checked;
		}else {
			value = target.value;
		}

		var $set = {};
		$set[fieldName] = value;

		Session.set('savingInProgress', true);
		Meteor.users.update({ _id: user._id }, { $set: $set }, function ( error, result ) {
			Session.set('savingInProgress', false);

			if ( error ) {
				Session.set('allChangesSaved', false);
				new PNotify({
					title: 'Change not saved',
					text: error.message,
					type: 'error'
				});
			}
			if ( result ) {
				new PNotify({
					title: 'Change saved',
					text: '',
					type: 'success'
				});
			}
		});
	}
});