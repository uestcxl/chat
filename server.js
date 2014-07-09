/**
 * Created with JetBrains WebStorm.
 * User: ultra
 * Date: 13-9-10
 * Time: 下午8:40
 * To change this template use File | Settings | File Templates.
 */

var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    o  = require('util'),
    server;

server = http.createServer(function(req, res){
    req.setEncoding(encoding="utf8");
    var path = url.parse(req.url).pathname;
    o.log(path);   //显示用户打开扫描页面

    if(path == '/') path = '/index.html';

    fs.readFile(__dirname + path, function(err, data){
        if (err) return send404(res);
        res.writeHead(200, {'Content-Type': path.substr(path.length - 2) == 'js' ? 'text/javascript, charset=UTF-8' : 'text/html, charset=UTF-8'});
        res.write(data, 'utf8');
        res.end();
    });
});

send404 = function(res){
    res.writeHead(404);
    res.write('404 Not Found');
    res.end();
};

server.listen(80);

var players = [];
var s = [];
var list = [];
var videos = [];

var io = require('socket.io')(server);
io.set('log level', 1);
io.sockets.on('connection', function(socket){
    socket.on('msg',function(data){
        try
        {
            o.log(players[socket.id].name + ' to ' + players[data.tid].name + ' : ' + data.msg);
            data.timer = (new Date()).getTime();
            var d = data;
            d.socketid = players[socket.id].name;
            d.avatar = players[socket.id].avatar;
            socket.emit('message', d);
            var d = data;
            d.id = players[data.tid].name;
            d.lid = players[socket.id].name;
            d.socketid = socket.id;
            d.avatar = players[socket.id].avatar;
            s[data.tid].emit('messageTo', d);
        }catch(e){o.log(e.stack);}
    });
    socket.on('chatall',function(data){
        try
        {
            o.log(players[socket.id].name + ' say: ' + data.msg);
            data.timer = (new Date()).getTime();
            //socket.emit('chatall', data);
            socket.broadcast.emit('chatall', data);
        }catch(e){o.log(e.stack);}
    });

    socket.on('sendboss', function(data){
        try
        {
            o.log('主播进入，开始直播！');
            //data.timer = (new Date()).getTime();
            //socket.emit('chatall', data);
            //videos.push(data);
            socket.broadcast.emit('getboss', data);

            o.log(data);
        }catch(e){o.log(e.stack);}
    });

    socket.on('system', function(data){
        try
        {
            o.log('[system]: ' + data.msg);
            data.timer = (new Date()).getTime();
            //socket.emit('chatall', data);
            socket.broadcast.emit('system', data);
        }catch(e){o.log(e.stack);}
    });
    socket.on('login', function(user) {
        try
        {
            o.log('正在发送用户列表给新用户...');
            socket.emit('getplayers', list);
            o.log('用户列表发送完成!');
            players[socket.id] = user;
            s[socket.id] = socket;
            socket.emit('login', socket.id);
            user.id = socket.id;
            list.push(user);
            //socket.emit('loginIn', user);
            socket.broadcast.emit('loginIn', user);
            o.log('用户 ' + user.name + ' 登录了！当前在线人数：' + String(list.length));
        }catch(e){o.log(e.stack);}
    });
    socket.on('disconnect', function(){
        try
        {
            players.splice(socket.id, 1);
            s.splice(socket.id, 1);
            for(var i=0; i < list.length; i++) {
                if(list[i].id == socket.id) {
                    list.splice(i, 1);
                }
            }
            socket.broadcast.emit('change', players[socket.id]);
            o.log('用户 ' + players[socket.id] + ' 退出了! 当前在线人数：' + String(list.length));
        }catch(e){o.log(e.stack);}
    });
});

//var webRTC = require('webrtc.io').listen(8080);

o.log('服务器已经启动，开始监听80端口!');
o.log('视频服务器已经启动，开始监听8080端口!');
