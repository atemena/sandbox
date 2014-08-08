window.Pin = Backbone.Model.extend({
	urlRoot:"../api/pins",
    defaults:{
        "id":null,
        "name":"",
        "grapes":"",
        "country":"USA",
        "region":"California",
        "year":"",
        "description":"",
        "picture":""
        "user": ""
		"board": ""
		"pin_id": "fakepinid"
		"md5": ""
		"description": "description"
		"source": ""
		"likes": "0"
		"repins": "0"
		"comments": "0"
		"actions": "0"
		"price": "0"
		"currency": "0"
		"etag": ""
		"pinned": ""
		"created": "07/20/1991"
		"updated": "07/20/1991"
    }
});

window.PinCollection = Backbone.Collection.extend({
	model:Pin,
	url:"../api/pins"
});

window.PinListView = Backbone.View.extned({
	tagName:'ul',
	id:'pins',
	initialize:function(){
		this.model.bind("reset", this.render, this);
	},
	render:function(eventName){
		_.each(this.model.models, function(pin){
			$(this.el).append(new PinListItemView({model:Pin}).render.el);
		}, this);
		return this;
	}

});

window.PinListItemView = Backbone.View.extend({
	tagName:"li",
	template: _.template($('#tpl-pin-list-item').html()),
	initialize:function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },
	render:function(eventName){
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	},
	close:function () {
        $(this.el).unbind();
        $(this.el).remove();
    }
});

window.PinView = Backbone.View.extend({
	template:_.template($('#tpl-pin-details').html()),
	initialize:function () {
        this.model.bind("change", this.render, this);
    },
	render:function(eventName){
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	},
 
    events:{
        "change input":"change",
        "click .save":"saveWine",
        "click .delete":"deleteWine"
    },
 
    change:function (event) {
        var target = event.target;
        console.log('changing ' + target.id + ' from: ' + target.defaultValue + ' to: ' + target.value);
        // You could change your model on the spot, like this:
        // var change = {};
        // change[target.name] = target.value;
        // this.model.set(change);
    },
 
    savePin:function () {
        this.model.set({
            name:$('#name').val(),
            grapes:$('#grapes').val(),
            country:$('#country').val(),
            region:$('#region').val(),
            year:$('#year').val(),
            description:$('#description').val()
        });
        if (this.model.isNew()) {
            app.pinList.create(this.model);
        } else {
            this.model.save();
        }
        return false;
    },
 
    deletePin:function () {
        this.model.destroy({
            success:function () {
                alert('Pin deleted successfully');
                window.history.back();
            }
        });
        return false;
    },
 
    close:function () {
        $(this.el).unbind();
        $(this.el).empty();
    }
});


window.HeaderView = Backbone.View.extend({
 
    template:_.template($('#tpl-header').html()),
 
    initialize:function () {
        this.render();
    },
 
    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    },
 
    events:{
        "click .new":"newPin"
    },
 
    newPin:function (event) {
        if (app.pinView) app.pinView.close();
        app.pinView = new PinView({model:new Pin()});
        $('#content').html(app.pinView.render().el);
        return false;
    }
});



// Router
var AppRouter = Backbone.Router.extend({
 
    routes:{
        "":"list",
        "pin/:id":"pinDetails"
    },
 
    list:function () {
        this.pinList = new PinCollection();
        this.pinListView = new PinListView({model:this.pinList});
        this.pinList.fetch();
        $('#sidebar').html(this.pinListView.render().el);
    },
 
    pinDetails:function (id) {
        this.pin = this.pinList.get(id);
        if (app.pinView) app.pinView.close();
        this.pinView = new PinView({model:this.pin});
        $('#content').html(this.pinView.render().el);
    }
});
 
var app = new AppRouter();
Backbone.history.start();