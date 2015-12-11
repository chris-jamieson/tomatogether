Meteor.startup(function () {
  AccountsEntry.config({
    // signupCode: 's3cr3t',         // only restricts username+password users, not OAuth
    // showSignupCode: true,         // place it also on server for extra security
    waitEmailVerification: false,   // will not allow users to login until their email is verified.
    // defaultProfile:{
    //     someDefault: 'default'
    //     }
  });
});
