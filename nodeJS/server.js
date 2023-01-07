const express = require('express'); //설치한 라이브러리 첨부
const app = express(); // 객체 생성

//listen(서버띄울 포트번호, 띄운 후 실행할 코드)
app.listen(8080, function(){
    console.log('listening on 8080');
});

//POST 요청으로 서버에 전송하기 위해서 body-parser 사용
app.use(express.urlencoded({extended : true}));

app.get('/pet',function(요청,응답){
    응답.send('펫용품 쇼핑할 수 있는 페이지입니다.');
});

app.get('/beauty', function(요청,응답){
    응답.send('뷰티 용품 쇼핑 페이지');
});

app.get('/', function(요청,응답){
    응답.sendFile(__dirname + '/index.html');
});

app.get('/write',function(요청,응답){
    응답.sendFile(__dirname + '/write.html');
});

//어떤 사람이 /add 경로로 POST 요청을 하면... ??를 해주세요~

app.post('/add',function(요청,응답){
    응답.send('전송완료');
    console.log(요청.body.title);
});

