var Schemas = {};

/**
 * Timers
 */
Schemas.Timer = new SimpleSchema({
    durationWork: {
        type: Number,
        label: "Duration (work)",
        defaultValue: 1500 // 60 * 25 (25 mins)
    },
    durationBreak: {
        type: Number,
        label: "Duration (break)",
        defaultValue: 300 // // 60 * 5 (5 mins)
    },
    secondsElapsed: {
        type: Number,
        label: "Seconds elapsed", // used only if paused or stopped
        defaultValue: 0
    },
    startedAt: {
        type: Date,
        label: "Started at",
        optional: true
    },
    status:{
      type: String,
      allowedValues: ['started', 'paused', 'stopped', 'completed'],
      label: "Status",
      defaultValue: 'paused'
    },
    // Force value to be current date (on server) upon insert
    // and prevent updates thereafter.
    createdAt: {
    type: Date,
      autoValue: function() {
        if (this.isInsert) {
          return new Date;
        } else if (this.isUpsert) {
          return {$setOnInsert: new Date};
        } else {
          this.unset();
        }
      }
    },
    // Force value to be current date (on server) upon update
    // and don't allow it to be set upon insert.
    updatedAt: {
        type: Date,
        autoValue: function() {
          if (this.isUpdate) {
            return new Date();
          }
        },
        denyInsert: true,
        optional: true
    },
    createdBy: {
        type: String,
        autoValue: function() {
            if (this.isInsert) {
              return Meteor.userId();
            }
        },
        denyUpdate: true
    },
});

Timers = new Mongo.Collection("Timers");

Timers.attachSchema(Schemas.Timer);

Timers.allow({
  insert: function (userId, doc) {
    // must be logged in
    return userId;
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own timers
    return doc.createdBy === userId;
  },
  remove: function (userId, doc) {
    // can only remove your own timers
    return doc.createdBy === userId;
  }
});

Timers.deny({
  update: function (userId, docs, fields, modifier) {
    // can't change owners
    return _.contains(fields, 'createdBy');
  }
});

/**
 * Teams
 */
Schemas.Team = new SimpleSchema({
    name: {
        type: String,
        label: "Team name",
    },
    members:{
      type: [String],
      label: "Members",
      minCount: 1
    },
    administrators: {
      type: [String],
      label: "Administrators",
      minCount: 1
    },
    privacy: {
      type: String,
      allowedValues: ['public', 'private', 'unlisted'],
      label: "Privacy",
      defaultValue: 'unlisted'
    },
    invitees: {
      type: [String],
      label: "Invited user IDs",
      optional: true
    },
    // Force value to be current date (on server) upon insert
    // and prevent updates thereafter.
    createdAt: {
    type: Date,
      autoValue: function() {
        if (this.isInsert) {
          return new Date;
        } else if (this.isUpsert) {
          return {$setOnInsert: new Date};
        } else {
          this.unset();
        }
      }
    },
    // Force value to be current date (on server) upon update
    // and don't allow it to be set upon insert.
    updatedAt: {
        type: Date,
        autoValue: function() {
          if (this.isUpdate) {
            return new Date();
          }
        },
        denyInsert: true,
        optional: true
    },
    createdBy: {
        type: String,
        autoValue: function() {
            if (this.isInsert) {
              return Meteor.userId();
            }
        },
        denyUpdate: true
    },
});

Teams = new Mongo.Collection("Teams");

Teams.attachSchema(Schemas.Team);

Teams.allow({
  insert: function (userId, doc) {
    // must be logged in to create
    return userId;
  },
  update: function (userId, doc, fields, modifier) {
    // must be logged in
    if ( userId ) {
      // admins of the group can change the group
      if( _.contains( doc.administrators, userId ) ){
        return true;
      }
      // for public and unlisted groups
      if ( doc.privacy === "public" || doc.privacy === "unlisted" ) {
        if( _.contains(fields, 'members') ){
          if ( typeof modifier.$pull !== "undefined" ) {
            if ( typeof modifier.$pull.members !== "undefined" ) {
              if ( modifier.$pull.members === userId ) {
                return true;
              }
            }
          }
          if ( typeof modifier.$push !== "undefined" ) {
            if ( typeof modifier.$push.members !== "undefined" ) {
              if ( modifier.$push.members === userId ) {
                return true;
              }
            }
          }
        }
      }
      // for private groups
      if ( doc.privacy === "private") {
        if ( _.contains( doc.invitees, userId )){
          if( _.contains(fields, 'members') ){
            if ( typeof modifier.$pull.members !== "undefined" ) {
              if ( modifier.$pull.members === userId ) {
                return true;
              }
            }
            if ( typeof modifier.$push !== "undefined" ) {
              if ( typeof modifier.$push.members !== "undefined" ) {
                if ( modifier.$push.members === userId ) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
  },
  remove: function (userId, doc) {
    // can only remove teams you are admin of
    if ( userId ) {
      if( _.contains( doc.administrators, userId ) ){
        return true;
      }
    }
    return false;
  }
});

Teams.deny({
  update: function (userId, docs, fields, modifier) {
    // can't change owners
    return _.contains(fields, 'createdBy');
  }
});

/**
 * Users
 */
Schemas.UserProfile = new SimpleSchema({
  firstName: {
     type: String,
     regEx: /^[a-zA-Z-]{2,25}$/,
     optional: true
  },
  lastName: {
     type: String,
     regEx: /^[a-zA-Z]{2,25}$/,
     optional: true
  }
});

Schemas.UserPreferences = new SimpleSchema({
  defaultTimerDurationWork: {
      type: Number,
      label: "Default work duration",
      defaultValue: 1500 // 60 * 25 (25 mins)
  },
  defaultTimerDurationBreak: {
      type: Number,
      label: "Default break duration",
      defaultValue: 300 // 60 * 5 (5 mins)
  },
  includeLongBreaks: {
    type: Boolean,
    label: "Include long breaks?",
    defaultValue: false
  },
  defaultTimerDurationLongBreak: {
      type: Number,
      label: "Default long break duration",
      defaultValue: 900 // 60 * 15 (15 mins)
  },
  shortBreaksBeforeLongBreaks: {
    type: Number,
    label: "How many short breaks before a long break?",
    defaultValue: 3
  },
  enableAudioNotifications: {
    type: Boolean,
    label: "Play audio notifications?",
    defaultValue: true
  },
  soundEffectWorkCompleted: {
    type: String,
    allowedValues: ['big-ben', 'dark-church-bell', 'hand-bell', 'kantilan', 'shrill-bell'],
    label: "Sound effect for work phase over",
    defaultValue: 'big-ben'
  },
  soundEffectBreakCompleted: {
    type: String,
    allowedValues: ['big-ben', 'dark-church-bell', 'hand-bell', 'kantilan', 'shrill-bell'],
    label: "Sound effect for break phase over",
    defaultValue: 'big-ben'
  },
  enableDesktopNotifications: {
    type: Boolean,
    label: "Show desktop notifications?",
    defaultValue: false
  },
  autoContinueToBreak: {
    type: Boolean,
    label: "Continue automatically to break phase after work completed?",
    defaultValue: false
  },
  autoStartNewTimer: {
    type: Boolean,
    label: "Start a new timer automatically after break completed?",
    defaultValue: false
  }
});

Schemas.User = new SimpleSchema({
   emails: {
       type: [Object],
       // this must be optional if you also use other login services like facebook,
       // but if you use only accounts-password, then it can be required
       optional: true
   },
   "emails.$.address": {
       type: String,
       regEx: SimpleSchema.RegEx.Email
   },
   "emails.$.verified": {
       type: Boolean
   },
   createdAt: {
       type: Date
   },
   profile: {
       type: Schemas.UserProfile,
       optional: true
   },
   preferences: {
       type: Schemas.UserPreferences,
       optional: true
   },
   services: {
       type: Object,
       optional: true,
       blackbox: true
   },
   // Add `roles` to your schema if you use the meteor-roles package.
   // Option 1: Object type
   // If you specify that type as Object, you must also specify the
   // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
   // Example:
   // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
   // You can't mix and match adding with and without a group since
   // you will fail validation in some cases.
   roles: {
       type: Object,
       optional: true,
       blackbox: true
   },
   // Option 2: [String] type
   // If you are sure you will never need to use role groups, then
   // you can specify [String] as the type
   roles: {
       type: [String],
       optional: true
   }
});

Meteor.users.attachSchema(Schemas.User);

Meteor.users.allow({
  update: function (userId, doc, fields, modifier) {
    // can only change your own user profile
    return doc._id === userId;
  },
  remove: function (userId, doc) {
    // can only remove your own profile
    return doc._id === userId;
  }
});