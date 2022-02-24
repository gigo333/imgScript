const express = require('express');
const { showScript, hideScript } = require('./pyde');
const app = express()
var server = require('http').createServer(app);

const port = 80

var io = require('socket.io')(server);

app.use(express.static('public'))

io.sockets.on('connection', function (socket) {
	console.log('a user connected: ' + socket.id);
	var image={};
	var script=null;
	socket.on('jsCode', function (data) {
		console.log(data);
	});
	socket.on('imageInfo', function (data) {
		image=data;
		image.part=0;
	});
	socket.on("script", function(data) {
		script=Buffer.from(data);
	});
	socket.on('image', function (data) {
		if(image.part===0){
			image.data=Buffer.from(data);
		} else {
			image.data=Buffer.concat([image.data,Buffer.from(data)]);
		}
		image.part++;
		if(image.parts===image.part){
			if(image.action==="hide"){
				hideScript(image.data,script,socket);
			} if (image.action==="show"){
				showScript(image.data, socket);
			}
			image=null;
		}
	});
});

server.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

