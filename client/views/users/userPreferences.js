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
	}else if ( input.type === "radio" ) {
		value = $('input[name="'+input.name+'"]:checked').val();
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

function getUnsavedInputs ( user ) {
	var unsavedInputs = [];

	$('#forms-container *').filter(':input').each(function ( index, input ) {
		if ( inputShouldAutosave ( input ) === true ) {
			// check value and name against user object
			var value = prepareValueForDatabase ( input ) ;
			
			if ( typeof value !== 'undefined' ){
				var fieldName = prepareFieldNameForDatabase ( input );
				if ( typeof fieldName !== 'undefined' ){
					if ( fieldName.indexOf('.') > -1 ) {
						var splitFieldName = fieldName.split('.');
					}else {
						var splitFieldName = fieldName;
					}

					var fieldToCheck = $.extend(true, {}, user);

					if ( $.isArray( splitFieldName ) ) {
						for (var i = 0; i < splitFieldName.length; i++) {
							var propertyName = splitFieldName[i];
							fieldToCheck = fieldToCheck[propertyName];
						}
					} else {
						fieldToCheck = fieldToCheck[splitFieldName];
					}


					if ( typeof fieldToCheck !== 'undefined' ) {
						// if anything does not match, mark false
						// objects
						if ( _.isObject ( fieldToCheck ) ) {
							if ( !_.isEqual (fieldToCheck, value ) ) {
								unsavedInputs.push( input );
							}
						}
						// strings
						if ( _.isString ( fieldToCheck ) ) {
							if ( fieldToCheck != value.trim()  ) {
								unsavedInputs.push( input );
							}
						}
						// number
						if ( _.isNumber ( fieldToCheck ) ) {
							if ( fieldToCheck != value  ) {
								unsavedInputs.push( input );
							}
						}

					}
				}
			}
		}
	} );

	return unsavedInputs;
}

function areAllChangesSaved (user) {
	var allChangesSaved = true;
	var unsavedInputs = getUnsavedInputs( user );

	if ( unsavedInputs.length > 0 ) {
		allChangesSaved = false;
	}

	Session.set('allChangesSaved', allChangesSaved);

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
		return Session.equals('allChangesSaved', true);
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
	},
	desktopNotificationsPermissionRequested: function () {
		return Session.equals ('desktopNotificationsPermissionRequested', true);
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

			Meteor.users.update({ _id: user._id }, { $set: $set }, function ( error, result ) {
				user = Meteor.users.findOne( { _id: user._id } );
				areAllChangesSaved ( user );
				if ( error ) {
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
	},
	'keyup input': function ( event ) {
		var user = this.user;
		areAllChangesSaved ( user );
	},
	'click .save-preferences': function ( event ) {
		event.preventDefault();
		// get all the unsaved changes
		var user = this.user;
		var fieldsToSave = getUnsavedInputs ( user );

		// update the model
		var $set = {};

		for (var i = fieldsToSave.length - 1; i >= 0; i--) {
			var target = fieldsToSave[i];
			var value = prepareValueForDatabase ( target ) ;
			var fieldName = prepareFieldNameForDatabase ( target );

			$set[fieldName] = value;
		}

		if ( !_.isEmpty ( $set ) ) {
			Meteor.users.update({ _id: user._id }, { $set: $set }, function ( error, result ) {
				user = Meteor.users.findOne( { _id: user._id } );
				areAllChangesSaved ( user );
				if ( error ) {
					new PNotify({
						title: 'Save failed',
						text: error.message,
						type: 'error'
					});
				}
				if ( result ) {
					new PNotify({
						title: 'Saved OK',
						text: '',
						type: 'success'
					});
				}
			});
		}
	},
	'click .desktop-notifications-enable': function ( event ) {
		event.preventDefault();
		PNotify.desktop.permission();
		Session.set('desktopNotificationsPermissionRequested', true);
	}
});