Template.teamMember.rendered = function() {
    // console.log(this);
};

Template.teamMember.helpers({
    'profile': function() {
        // @TODO use this to get a nice user profile (name and photo )
        return this;
    }
});