Meteor.startup(function () {
    AccountsEntry.config({
      logo: '/images/entry-logo.png', // if set displays logo above sign-in options
    //   privacyUrl: '/privacy-policy',             // if set adds link to privacy policy and 'you agree to ...' on sign-up page
    //   termsUrl: '/terms-of-use',                 // if set adds link to terms  'you agree to ...' on sign-up page
      homeRoute: '/',                            // mandatory - path to redirect to after sign-out
      dashboardRoute: '/teams',              // mandatory - path to redirect to after successful sign-in
      profileRoute: 'preferences',                   // if set adds link to User Profile
      passwordSignupFields: 'EMAIL_ONLY',        // One of 'USERNAME_AND_EMAIL', 'USERNAME_AND_OPTIONAL_EMAIL', 'USERNAME_ONLY', or 'EMAIL_ONLY' (default).
      showSignupCode: false,                      // when true you need to set the 'signupCode' setting in the server (see below)
      showOtherLoginServices: true,              // Set to false to hide oauth login buttons on the signin/signup pages. Useful if you are using something like accounts-meld or want to oauth for api access
      passwordminLength: 7,                      // Password minimun lenght
      requireOneAlpha: true,                     // enforce the use of at least 1 char [a-z] while building the password
      requireOneDigit: true,                     // enforce the use of at least 1 digit while building the password
      requirePasswordConfirmation: true,         // enforce user to confirm password on signUp and resetPassword templates
      waitEmailVerification: false,                // Set to true to wait until newly created user's email has been verified.
      extraSignUpFields: [ // Add extra signup fields on the signup page
          {
              field: "firstName", // will be saved to profile.firstName field on user document
              name: "", // An initial value for the field, if you want one
              label: "First name", // The html lable for the field
              placeholder: "Francis", // A placeholder for the field
              type: "text", // The type of field you want
              required: true // Adds html 5 required property if true
          }, {
              field: "lastName", // will be saved to profile.lastName field on user document
              name: "", // An initial value for the field, if you want one
              label: "Last name", // The html lable for the field
              placeholder: "Underwood", // A placeholder for the field
              type: "text", // The type of field you want
              required: true // Adds html 5 required property if true
          }
      ]
    });
  });
