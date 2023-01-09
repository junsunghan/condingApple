const express = require('express'); //설치한 라이브러리 첨부
const app = express(); // 객체 생성

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


MongoClient.connect(process.env.DB_URL,function(에러,client){

    //연결되면 할일
    if(에러){
        return console.log(에러);
    }

    db = client.db('todoapp');

    // db.collection('post').insertOne({이름 : 'John', 나이: 20}, function(에러, 결과){
    //     console.log('저장완료');
    // });

    app.listen(8080, function(){
        console.log('listening 8080');
    });
})

// 여기서 났던 에러!!!
// app.listen을 두번 쓰면 에러난다 ㅠㅠ

//POST 요청으로 서버에 전송하기 위해서 body-parser 사용
app.use(express.urlencoded({extended : true}));

app.get('/pet',function(요청,응답){
    응답.send('펫용품 쇼핑할 수 있는 페이지입니다.');
});

app.get('/beauty', function(요청,응답){
    응답.send('뷰티 용품 쇼핑 페이지');
});

app.get('/', function(요청,응답){
    // 응답.sendFile(__dirname + '/index.html');
    응답.render('index.ejs');
});

app.get('/write',function(요청,응답){
    // 응답.sendFile(__dirname + '/write.html');
    응답.render('write.ejs');
});

//어떤 사람이 /add 경로로 POST 요청을 하면... ??를 해주세요~


//누가 form 에서 /add로 POST 요청하면
app.post('/add',function(요청,응답){
    //DB.counter 내의 총게시물갯수를 찾음
    db.collection('counter').findOne({name: '게시물갯수'}, function(에러, 결과){
        console.log(결과.totalPost);
        // 총게시물갯수를 변수에 저장
        var 총게시물갯수 = 결과.totalPost;

        //이제 DB.post에 새게시물 기록함
        db.collection('post').insertOne({_id: 총게시물갯수 + 1, 제목 : 요청.body.title, 날짜: 요청.body.date}, function(에러, 결과){
            // console.log(요청.body.title, 요청.body.date);
            console.log('저장완료');
            //counter라는 컬렉션에 있는 totalPost라는 항목도 1 증가시켜야함
            db.collection('counter').updateOne({name: '게시물갯수'//어떤데이터를 수정할지
            },{ $inc : {totalPost:1}//수정값
            },function(에러,결과){
                if(에러) return console.log(에러)
            })
        });
    });
    
    응답.send('전송완료');
    // 응답.send('전송완료');
    // console.log(요청.body.title);
});

//list 로 GET요청으로 접속하면
//실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌

app.get('/list', function(요청, 응답){
    //db에 저장된 post라는 collection 안의 모든 데이터를 꺼내주세요.
    db.collection('post').find().toArray(function(에러, 결과){
        console.log(결과);
        응답.render('list.ejs', {posts: 결과});
    });

});

app.delete('/delete', function(요청,응답){
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);
    //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
    db.collection('post').deleteOne(요청.body, function(에러, 결과){
        console.log('삭제완료');
        응답.status(200).send({message:'성공했습니다.'});
        // 응답.status(400).send({message:'실패했습니다.'});
    })
});

//detail 로 접속하면 detail.ejs 보여줌

app.get('/detail/:id', function(요청, 응답){
    db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러,결과){
        console.log(결과);
        응답.render('detail.ejs', { data : 결과})
    });
})

app.get('/edit/:id', function(요청,응답){
    db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러,결과){
        console.log(결과);
        응답.render('edit.ejs', {post : 결과});

    })
})

app.put('/edit', function(요청,응답){
    //폼에 담긴 제목데이터, 날짜데이터를 가지고 db.collection에다가 업데이트함
    db.collection('post').updateOne({_id: parseInt(요청.body.id)},{$set: {제목: 요청.body.title, 날짜: 요청.body.date}},function(에러,결과){
        console.log('수정완료');
        응답.redirect('/list');
    })
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

//app.use(미들웨어)
//미들웨어 : 요청 - 응답 중간에 뭔가 실행되는 코드
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(요청,응답){
    응답.render('login.ejs');
})

app.post('/login', passport.authenticate('local', {failureRedirect : '/fail'}), function(요청, 응답){
    응답.redirect('/')
  });

app.get('/mypage', 로그인했니, function(요청,응답){
    console.log(요청.user);
    응답.render('mypage.ejs', {사용자 : 요청.user});
});

function 로그인했니(요청,응답, next){
    if(요청.user){
        next()
    }else{
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
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(아이디, done){
    //디비에서 위에있는 user.id로 유저를 찾은 뒤에 유저 정보를
    //하단 줄괄호 안에 넣을 수 있음 -> 중괄호 안의 데이터를 리턴 가능함
    db.collection('login').findOne({id: 아이디}, function(에러, 결과){
        done(null, 결과);
    })
});