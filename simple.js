var MoveRedis = require('./index');
var config = {
	from:{
		port:6379,
		host:"192.168.192.205",
		password:"passwd",
		db:0
		},
	to:{
		port:6379,
		host:"192.168.192.10",
		password:"passwd",
		db:0
	}	
};
var move = new MoveRedis(config);
move.connectFrom();
move.connectTo();
move.move(function(err,result){
	if(err)console.log("error",err);
	else
	console.log("ok");
});
move.close();