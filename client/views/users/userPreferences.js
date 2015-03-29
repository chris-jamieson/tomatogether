function inputShouldAutosave ( input ) {
	var autosave = $( input ).data('autosave');
	if ( typeof autosave === 'undefined' ) {
		autosave = true;
	}

	return autosave;
}

function prepareValueForDatabase ( input ) {
	var value = null;

	if ( input.type === "checkbox" ) {
		value = input.checked;
	}else {
		value = input.value;
	}

	// check for conversion needed
	var conversionOperation = $( input ).data('convert-before-save') || null;
	switch ( conversionOperation ) {
		case 'minutesToSeconds':
			value = value * 60;
			break;
	}

	if ( input.name === 'emailAddress' ) {
		value = [
			{
				address: value,
				verified: false // assume any new email address is unverified
			}
		];
	}

	return value;
}

function prepareFieldNameForDatabase ( input ) {
	var fieldName = input.name;

	if ( fieldName === 'emailAddress' ) {
		fieldName = 'emails';
	}

	return fieldName;
}

function areAllChangesSaved (user) {
	var allChangesSaved = true;

	console.log('user', user);

	$('#forms-container *').filter(':input').each(function ( index, input ) {
		if ( inputShouldAutosave ( input ) === true ) {
			// check value and name against user object
			var value = prepareValueForDatabase ( input ) ;
			
			if ( typeof value !== 'undefined' ){
				var fieldName = prepareFieldNameForDatabase ( input );
				if ( typeof fieldName !== 'undefined' ){
					console.log('fieldName: ', fieldName);
					console.log('value: ', value);

					if ( fieldName.indexOf('.') > -1 ) {
						var splitFieldName = fieldName.split('.');
					}else {
						var splitFieldName = fieldName;
					}

					var fieldToCheck = $.extend(true, {}, user);

					if ( $.isArray( splitFieldName ) ) {
						for (var i = splitFieldName.length - 1; i >= 0; i--) {
							fieldToCheck = fieldToCheck[splitFieldName[i]];
						}
					} else {
						fieldToCheck = fieldToCheck[splitFieldName];
					}

					console.log('fieldToCheck: ', fieldToCheck);

					if ( typeof fieldToCheck !== 'undefined' ) {
						// if anything does not match, mark false
						if ( _.isEqual (fieldToCheck, value ) ) {
							console.log ('looks like ' + fieldToCheck + ' IS equal to ' + value);
						}else{
							console.log ('looks like ' + fieldToCheck + ' not equal to ' + value);
							allChangesSaved = false;
						}
					}
				}
			}
		}
	} );

	return allChangesSaved;
};

Template.userPreferences.rendered = function () {
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
	'allChangesSaved': function () {
		var user = this.user;
		return areAllChangesSaved (user);
	},
	'soundEffectBreakCompletedOptions': function ( ) {
		var user = this.user;
		var options = [
			{
				value: 'big-ben',
				text: 'Gentle chimes',
			},
			{
				value: 'dark-church-bell',
				text: 'Dark church bell',
			},
			{
				value: 'hand-bell',
				text: 'Hand bell',
			},
			{
				value: 'kantilan',
				text: 'Kantilan',
			},
			{
				value: 'shrill-bell',
				text: 'Shrill bell',
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
				value: 'big-ben',
				text: 'Gentle chimes',
			},
			{
				value: 'dark-church-bell',
				text: 'Dark church bell',
			},
			{
				value: 'hand-bell',
				text: 'Hand bell',
			},
			{
				value: 'kantilan',
				text: 'Kantilan',
			},
			{
				value: 'shrill-bell',
				text: 'Shrill bell',
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
	},
	userEmailAddress: function () {
	    var emailAddress;
	    var user = this.user;
	    if(typeof user.emails == "undefined"){
	        emailAddress = '';
	    }else if(typeof user.emails[0] == "undefined"){
	        emailAddress = '';
	    }else{
	        emailAddress = user.emails[0].address;
	    }

	    return emailAddress;
	},
	passwordSubmitting: function () {
	    return Session.equals('passwordSubmitting', true);
	}
});

Template.userPreferences.events({
	'change input': function ( event ) {
		var user = this.user;
		var target = event.target;

		if( inputShouldAutosave ( target ) === true ) {
			var value = prepareValueForDatabase ( target ) ;
			var fieldName = prepareFieldNameForDatabase ( target );

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
	},
	'click .update-password': function( event ) {
	    Session.set('passwordSubmitting', true);
	    var currentPassword = $('#current-password').val();
	    var newPassword = $('#new-password').val();
	    var newPasswordRepeated = $('#new-password-repeated').val();

	    // validate your passwords better than this
	    if (newPassword !== newPasswordRepeated) {
	        Session.set('passwordSubmitting', false);
	        toastr.warning('Password not changed: passwords did not match.');
	        return false;
	    }

	    Accounts.changePassword(currentPassword, newPassword, function(error) {
	        Session.set('passwordSubmitting', false);
	        if (error) {
	            toastr.error('Error: ' + error.reason );
	        } else {
	            toastr.success('Password reset successfully.');
	            $('#password-form-container').modal('hide');
	        }
	    });
	},
	'click .password-form-toggle': function ( event ) {
		event.preventDefault();
	    $("#change-password")[0].reset();
	}
});