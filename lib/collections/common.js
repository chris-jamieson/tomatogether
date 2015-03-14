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
        type: Date,
        label: "Seconds elapsed", // used only if paused or stopped
        optional: true,
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
      defaultValue: "stopped"
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
    return userId;
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return doc.createdBy === userId;
  },
  remove: function (userId, doc) {
    // can only remove your own documents
    return doc.createdBy === userId;
  }
});

Timers.deny({
  update: function (userId, docs, fields, modifier) {
    // can't change owners
    return _.contains(fields, 'userId');
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
    return userId;
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return doc.createdBy === userId;
  },
  remove: function (userId, doc) {
    // can only remove your own documents
    return doc.createdBy === userId;
  }
});

Teams.deny({
  update: function (userId, docs, fields, modifier) {
    // can't change owners
    return _.contains(fields, 'userId');
  }
});