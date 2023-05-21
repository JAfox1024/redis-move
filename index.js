/**
 * Redis dump main file.
 *
 * @author Mx1014
 */
var async = require('async');
var Redis = require('ioredis');

/**
 * Redis move class.
 *
 * @param {Object} params init params.
 * @constructor
 */
var RedisMove = module.exports = function (params) {
	'use strict';

	var clientFrom;
	var clientTo;

	this.getVersion = function () {
		return '0.0.1';
	};

	this.getClientFrom = function () {
		return clientFrom;
	};

	this.getClientTo = function () {
		return clientTo;
	};

	this.close = function () {
		clientFrom.quit();
		clientTo.quit();
	};

	this.connectFrom = function () {
		console.log("params.from",params.from);
		clientFrom =new Redis({
			port: params.from.port, // Redis port
			host: params.from.host, // Redis host
			family: 4, // 4 (IPv4) or 6 (IPv6)
			password: params.from.password,
			db: params.from.db
		});
		return !clientFrom;
	};


	this.connectTo = function () {
		console.log("params.to",params.to);
		clientTo = new Redis({
			port: params.to.port, // Redis port
			host: params.to.host, // Redis host
			family: 4, // 4 (IPv4) or 6 (IPv6)
			password: params.to.password,
			db: params.to.db
		});	

		return !clientTo;
	};
};

/**
 * Make redis move.
 *
 * @param {Object} params
 */
RedisMove.prototype.move = function (next) {
	var list =0,set=0,hash=0,string=0,zset=0;
	var _MoveRedis = this;
	// ioredis doesn't support SCAN, so we use KEYS instead.
	_MoveRedis.getClientFrom().keys('*', function (err, keys) {
		// console.log("keys",keys);
		if (err) return next(err, null);
		async.eachSeries(keys, function iterator(key, next) {
			_MoveRedis.getClientFrom().type(key, function (err, type) {
				switch (type) {
					case 'set':
						set++;
						_MoveRedis.getClientFrom().smembers(key, function (err, value) {
							async.eachSeries(value, function iterator(item, next) {
								_MoveRedis.getClientTo().SADD(key, item, function (err, result) {
									next(err, result);
								});
							}, function (err, result) {
								if (err) {
									console.log("ERROR", err);
									next(err,null);
									}
								else
								{
									next(err,result);
								}
							});
						});
						break;

					case 'zset':
						zset++;
						_MoveRedis.getClientFrom().zrange(key, 0,-1,"WITHSCORES",function (err, value) {
							async.forEachOf(value, function iterator(arr_value,arr_key, next) {
								if(arr_key % 2 == 0)
									_MoveRedis.getClientTo().ZADD(key,value[arr_key+1], arr_value, function (err, result) {
										next(err, result);
									});
							}, function (err, result) {
								if (err) {
									console.log("ERROR", err);
									next(err,null);
									}
								else
								{
									next(err,result);
								}
							});
						});
						break;

					case 'hash':
						hash++;
						_MoveRedis.getClientFrom().hgetall(key, function (err, value) {
							console.log("value",value);
							async.forEachOf(value, function iterator(arr_value,arr_key, next) {
								_MoveRedis.getClientTo().hset(key,arr_key, arr_value, function (err, result) {	
									next(err, result);
								});
							}, function (err, result) {
								if (err) {
									console.log("ERROR", err);
									next(err,null);
									}
								else
								{
									next(err,result);
								}
							});
						});
						break;

					case 'list':
						list++;
						_MoveRedis.getClientFrom().lrange(key, 0,-1,function (err, value) {
							async.eachSeries(value, function iterator(item, next) {
								_MoveRedis.getClientTo().RPUSH(key, item, function (err, result) {
									next(err, result);
								});
							}, function (err, result) {
								if (err) {

									console.log("ERROR", err);
									next(err,null);
									}
								else
								{
									next(err,result);
								}
							});
						});
						break;

					case 'string':
						string++;
						_MoveRedis.getClientFrom().get(key, function (err, value) {
							_MoveRedis.getClientTo().set(key, value, function (err, result) {
								if (err) {
									console.log("ERROR", err);
									next(err,null);
									}
								else
								{
									next(err,result);
								}
							});
						});
						break;
				}
			});
		}, function (err, result) {
			if (err) {
				console.log("ERROR", err);
				next(err,null);
				}
			else
			{
				console.log("list",list);
				console.log("set",set);
				console.log("hash",hash);
				console.log("string",string);
				console.log("zset",zset);
				next(err,result);
			}
		});
	});
};

