var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
var io = require('socket.io')();
var FB = require('fb');
var _ = require('lodash');

var io_socket = null;
var connected = false;
var comments = [];
var post = null;

var inputs = {
  a: 1,
  b: 2,
  select: 4,
  start: 8,
  right: 10,
  left: 20,
  up:40,
  down:80,
  l:100,
  r:200};
rule.second = new schedule.Range(0, 59, 1);
//

// for mass testing
//schedule.scheduleJob(rule, function(){
//  if (io_socket) {
//    _.times(500, function(){
//      io_socket.emit('facebook', { input: inputs[_.random(0, inputs.length - 1)] });
//    });
//  } else {
//    console.log('socket or post are undefined');
//  }
//});
var keys = _.keys(inputs);
var parse = function(message){
  if (!_.isUndefined(_.find(_.keys(inputs), function(i){ return i == message})))
    return inputs[message];
  return null;
};

schedule.scheduleJob(rule, function(){
  if (io_socket && post) {
    FB.api("/"+post.id+"/comments", function (res) {
      _.each(res.data, function(data){
        var message = parse(data['message']);
        if (message)
        io_socket.emit('facebook', { input: message });
      });
    });
  } else {
    console.log('socket or post are undefined');
  }
});


io.on('connection', function (socket) {
  console.log('connected');
  io_socket = socket;
  FB.setAccessToken('156876214485058|VEut8WJSoasN29OKFt9JJvdkltw');
  FB.api('/f4cebookplayspokemon/feed',  function (res) {
    post = res.data[0];
  });
});

io.listen(3000);