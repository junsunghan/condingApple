var router = require('express').Router(); //라우터 파일 필수!!! npm으로 설치했던 expree라이브러리의 Router()를 사용하겠습니다.

//로그인 했을 경우에 접속할 수 있도록 함
function 로그인했니(요청, 응답, next) {
    if (요청.user) {
        next()
    } else {
        응답.send('로그인 안하셨습니다.')
    }
}

//모든 URL에 적용할 미들웨어
router.use(로그인했니);
//router.use('/shirts'로그인했니) /shirts에만 적용하기도 가능!!

//app -> roter로 변경해서 쓰기
router.get('/shirts', function (요청, 응답) {
    응답.send('셔츠파는 페이지');
})

router.get('/pants', function (요청, 응답) {
    응답.send('바지파는 페이지');
})

//완료되면 마지막에 쓰기
//module.exports = 내보낼 변수명 require('파일경로')
module.exports = router;