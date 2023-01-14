const express = require('express'); //설치한 라이브러리 첨부
const app = express(); // 객체 생성
const { ObjectId } = require('mongodb'); // ObjectId() 안에 담고 싶으면 사용

//socket.io 셋팅
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

//.env 환경변수 사용
require('dotenv').config()

//listen(서버띄울 포트번호, 띄운 후 실행할 코드)

//ejs 사용하기위한 코드
app.set('view engine', 'ejs');

//static 파일을 보관하기위해 public 폴더 사용을 선언
app.use('/public', express.static('public'));

//method-override 쓰기 위한 코드
const methodOverride = require('method-override');
app.use(methodOverride('_method'));


//db 접속을 위한 변수 생성
var db;

//mongo DB 접속 방법
const MongoClient = require('mongodb').MongoClient;


MongoClient.connect(process.env.DB_URL, function (에러, client) {

    //연결되면 할일
    if (에러) {
        return console.log(에러);
    }

    db = client.db('todoapp');

    // db.collection('post').insertOne({이름 : 'John', 나이: 20}, function(에러, 결과){
    //     console.log('저장완료');
    // });

    http.listen(8080, function () {
        console.log('listening 8080');
    });
})

// 여기서 났던 에러!!!
// app.listen을 두번 쓰면 에러난다 ㅠㅠ
// socket을 이용할 때는 app -> http.listen으로 사용!


//POST 요청으로 서버에 전송하기 위해서 body-parser 사용
app.use(express.urlencoded({ extended: true }));

app.get('/pet', function (요청, 응답) {
    응답.send('펫용품 쇼핑할 수 있는 페이지입니다.');
});

app.get('/beauty', function (요청, 응답) {
    응답.send('뷰티 용품 쇼핑 페이지');
});

app.get('/', function (요청, 응답) {
    // 응답.sendFile(__dirname + '/index.html');
    응답.render('index.ejs');
});

app.get('/write', function (요청, 응답) {
    // 응답.sendFile(__dirname + '/write.html');
    응답.render('write.ejs');
});



//list 로 GET요청으로 접속하면
//실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌

app.get('/list', function (요청, 응답) {
    //db에 저장된 post라는 collection 안의 모든 데이터를 꺼내주세요.
    db.collection('post').find().toArray(function (에러, 결과) {
        console.log(결과);
        응답.render('list.ejs', { posts: 결과 });
    });

});



//detail 로 접속하면 detail.ejs 보여줌

app.get('/detail/:id', function (요청, 응답) {
    db.collection('post').findOne({ _id: parseInt(요청.params.id) }, function (에러, 결과) {
        console.log(결과);
        응답.render('detail.ejs', { data: 결과 })
    });
})

app.get('/edit/:id', function (요청, 응답) {
    db.collection('post').findOne({ _id: parseInt(요청.params.id) }, function (에러, 결과) {
        console.log(결과);
        응답.render('edit.ejs', { post: 결과 });

    })
})

app.put('/edit', function (요청, 응답) {
    //폼에 담긴 제목데이터, 날짜데이터를 가지고 db.collection에다가 업데이트함
    db.collection('post').updateOne({ _id: parseInt(요청.body.id) }, { $set: { 제목: 요청.body.title, 날짜: 요청.body.date } }, function (에러, 결과) {
        console.log('수정완료');
        응답.redirect('/list');
    })
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

//app.use(미들웨어)
//미들웨어 : 요청 - 응답 중간에 뭔가 실행되는 코드
app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function (요청, 응답) {
    응답.render('login.ejs');
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/fail' }), function (요청, 응답) {
    응답.redirect('/')
});

app.get('/mypage', 로그인했니, function (요청, 응답) {
    console.log(요청.user);
    응답.render('mypage.ejs', { 사용자: 요청.user });
});

function 로그인했니(요청, 응답, next) {
    if (요청.user) {
        next()
    } else {
        응답.send('로그인 안하셨습니다.')
    }
}



passport.use(new LocalStrategy({
    usernameField: 'id',    // form의 name 속성
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        //done => done(서버에러, 성공시 사용자 DB데이터, 에러메세지)
        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
        if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));

//session 등록
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (아이디, done) {
    //디비에서 위에있는 user.id로 유저를 찾은 뒤에 유저 정보를
    //하단 줄괄호 안에 넣을 수 있음 -> 중괄호 안의 데이터를 리턴 가능함
    db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
        done(null, 결과);
    })
});



//회원가입 기능!!!
//회원가입 기능이 필요하면 passport 셋팅하는 부분이 위에 있어야함!!!
app.post('/register', (요청, 응답) => {
    db.collection('login').insertOne({ id: 요청.body.id, pw: 요청.body.pw }, function (에러, 결과) {
        응답.redirect('/');
    });

})


//어떤 사람이 /add 경로로 POST 요청을 하면... ??를 해주세요~


//누가 form 에서 /add로 POST 요청하면
app.post('/add', function (요청, 응답) {
    //DB.counter 내의 총게시물갯수를 찾음
    db.collection('counter').findOne({ name: '게시물갯수' }, function (에러, 결과) {
        console.log(결과.totalPost);
        // 총게시물갯수를 변수에 저장
        var 총게시물갯수 = 결과.totalPost;

        var 저장할거 = { _id: 총게시물갯수 + 1, 제목: 요청.body.title, 날짜: 요청.body.date, 작성자: 요청.user._id };

        //이제 DB.post에 새게시물 기록함
        db.collection('post').insertOne(저장할거, function (에러, 결과) {
            // console.log(요청.body.title, 요청.body.date);
            console.log('저장완료');
            //counter라는 컬렉션에 있는 totalPost라는 항목도 1 증가시켜야함
            db.collection('counter').updateOne({
                name: '게시물갯수'//어떤데이터를 수정할지
            }, {
                $inc: { totalPost: 1 }//수정값
            }, function (에러, 결과) {
                if (에러) return console.log(에러)
            })
        });
    });

    응답.send('전송완료');
    // 응답.send('전송완료');
    // console.log(요청.body.title);
});

app.delete('/delete', function (요청, 응답) {
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);

    var 삭제할데이터 = { _id: 요청.body._id, 작성자: 요청.user._id };


    //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
    db.collection('post').deleteOne(삭제할데이터, function (에러, 결과) {
        console.log('삭제완료');
        if (결과) { console.log(결과) };
        응답.status(200).send({ message: '성공했습니다.' });
        // 응답.status(400).send({message:'실패했습니다.'});
    })
});



//검색기능

app.get('/search', (요청, 응답) => {
    // console.log(요청.query.value);
    // {$text : {$search: ???} } 만들어놓은 index기능을 쓰는 방법 
    // db.collection('post').find( {$text: { $search : 요청.query.value}}).toArray(function(에러,결과){
    //     console.log(결과);
    //     응답.render('search.ejs', {posts : 결과});
    // });


    //aggreage 사용문법
    var 검색조건 = [
        {
            $search: {
                index: 'textSearch', //만들어놓은 search 인덱션
                text: {
                    query: 요청.query.value, //검색어
                    path: '제목' //제목 날짜 둘 다 찾고 싶으면 ['제목', '날짜']
                }
            }
        },
        { $sort: { _id: -1 } } //정렬하는 방법
    ]
    db.collection('post').aggregate(검색조건).toArray((에러, 결과) => {
        console.log(결과);
        응답.render('search.ejs', { posts: 결과 });
    })
});


app.use('/shop', require('./routes/shop.js'));
app.use('/board/sub', require('./routes/board.js'));

app.get('/upload', function (요청, 응답) {
    응답.render('upload.ejs');
})

//multer 라이브러리 사용법
let multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/image');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        // cb(null, file.originalname + new Date());  이렇게하면 피일이름에 날짜 추가됨
    }
});

var upload = multer({ storage: storage });

//파일 한개
app.post('/upload', upload.single('profile'), function (요청, 응답) {
    응답.send('업로드 완료');
});

//파일 여러개
// app.post('/upload', upload.array('profile', 3), function(요청, 응답){
//     응답.send('업로드 완료');
// });



//이미지 업로드 보여주기
app.get('/image/:imageName', function (요청, 응답) {
    응답.sendFile(__dirname + '/public/image/' + 요청.params.imageName);
})

app.post('/chatroom', 로그인했니, function (요청, 응답) {
    var 저장할거 = {
        title: '테스트채팅방',
        member: [ObjectId(요청.body.당한사람id), 요청.user._id],
        date: new Date()
    }
    db.collection('chatroom').insertOne(저장할거).then((결과) => {
        응답.send('성공');
    })
})

app.get('/chat', 로그인했니, function (요청, 응답) {

    db.collection('chatroom').find({ member: 요청.user._id }).toArray().then((결과) => {
        응답.render('chat.ejs', { data: 결과 });
    })

})

app.post('/message', 로그인했니, function (요청, 응답) {

    var 저장할거 = {
        parent: 요청.body.parent,
        content: 요청.body.content,
        userid: 요청.user._id,
        date: new Date()
    }

    db.collection('message').insertOne(저장할거).then(() => {
        console.log('DB저장완료');
        응답.send('저장성공');
    })
})

//서버와 유저간 실시간 소통을 위한 api
app.get('/message/:id', 로그인했니, function (요청, 응답) {

    응답.writeHead(200, {
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
    });

    db.collection('message').find({ parent: 요청.params.id }).toArray().then((결과) => {
        //유저에게 데이터 전송은 
        //event: 보낼데이터이름\n
        //data : 보낼데이터 \n\n
        응답.write('event: test\n');
        응답.write('data: ' + JSON.stringify(결과) + '\n\n');
    })

    //Change Stream - MongoDB 기능
    //DB 변동시 -> 서버에 알려주고 -> 유저에게 보내줌

    const 찾을문서 = [
        { $match: { 'fullDocument.parent': 요청.params.id } }
    ];
    //컬렉션 선택함
    const changeStream = db.collection('message').watch(찾을문서); //watch() 붙이면 실시간 감시해줌

    //해당 컬렉션에 변동이 생기면 여기 코드가 실행됨
    changeStream.on('change', (result) => {
        console.log(result.fullDocument);
        var 추가된문서 = [result.fullDocument];
        응답.write('event: test\n');
        응답.write('data: ' + JSON.stringify(추가된문서) + '\n\n');
    });

})


//socket을 이용한 단체 채팅방만들기

app.get('/socket', function (요청, 응답) {
    응답.render('socket.ejs');
})

io.on('connection', function (socket) {
    console.log('유저 접속됨');


    //서버 수신코드
    //socket.on(작명, 콜백함수)
    //누가 user-send 이름으로 메세지 보내면 내부코드 실행
    socket.on('user-send', function (data) {
        console.log(data);
        //data = 담긴 데이터
        io.emit('broadcast', data);

        //서버 - 유저1명간 단독으로 소통하고 싶을때
        /*
            to를 사용하여 socket의 아이디값으로 지정
            io.to(socket.id).emit('broadcast', data);
        */
    });

    //채팅방 만들기
    socket.on('joinroom', function (data) {
        socket.join("room1");
    });

    //room에 들어간 사람들만 채팅
    socket.on('room1-send',function(data){
        io.to("room1").emit('broadcast', data);
    });

})