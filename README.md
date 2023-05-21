# redis-move
 redis数据迁移脚本
 一个简单的redis数据迁移脚本，支持支持DB迁移，通过该脚本可以将一个redis指定DB下的数据迁移至另一个redis制定DB中


## Run
你需要一个node.js的运行环境。node.js安装：https://nodejs.org/en/

执行：`npm install`

修改`simple.js`的config中的属性。例如：
```
var config = {
	from:{
		port:6379,
		host:"127.0.0.1",
		password:"your passqord or empty",
		db:0
		},
	to:{
		port:6380,
		host:"127.0.0.1",
		password:"your passqord or empty",
		db:0
	}	
};
```

开始迁移数据：`node index.js`
*数据多的时候需要很长的一段时间，请耐心等待。执行完成后有数据类型的统计*
list 0
set 0
hash 149
string 3
zset 0
ok