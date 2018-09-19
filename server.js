/////////////////////////////////////////////////////////////////////////////

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server); 	// http server를 socket.io server로 upgrade한다

app.get('/', function(req, res) {		
	res.sendFile(__dirname + '/client.html');
  });

/* 
	localhost:3000으로 서버에 접속하면 클라이언트로 index.html을 전송한다
   	get방식으로 보내진 데이터를 수용하는 메소드인듯 첫번째 파라미터는 로컬호스트의 상대적 우치ㅣ
   	req : request,  res : response
*/

//////////////////////////////////////////////////////////////////////////////////////

var ballArray = [];

io.on('connection', function(socket) {
	console.log('client logged-in : ', socket.id );
	
	addBall(socket.id);

	io.to(socket.id).emit("assignid", socket.id, ballArray );

	socket.on('renew', function( array ){	
		ballArray = array;	
		io.emit( "renew", ballArray );
	});

	socket.on('disconnect', function() {
		console.log('user disconnected: ' + socket.id);

		for( var i = 0 ; i < ballArray.length ; i ++ )
		{	

			if( ballArray[i] == null ) continue;
			if( ballArray[i].id == socket.id )
			{	
				console.log( socket.id);
				delete ballArray[i];
				console.log( ballArray[i] );
				console.log( ballArray.length );
				io.emit( "disconnect", ballArray );
				break;
			}
		}

	});
});

server.listen(3000, function() {
	console.log('Socket IO server listening on port 3000');
});


/////////////////////////////////////////////////////////////////////////////////

function addBall( socketid )
{
	var ball = {};
	ball.id = socketid;
	ball.x = 100;
	ball.y = 100;
	ball.width = 30;
	ball.height = 30;
	ball.imgsrc = "https://i.imgur.com/WGB7J1N.png"			
	ballArray.push(ball);
}

/*

서버에서 볼 배열을 관리한다. 접속한 순간 볼을 만든다음 볼배열에 집어넣고 그배열을 모든 클라이언트에 배포
클라이언트중 하나라도 데이터가 바뀌면 바로 서버로 보내고 서버에서는 다시 모든 볼배열이 같아지도록
갱신 마치 블록체인방식처럼

*/