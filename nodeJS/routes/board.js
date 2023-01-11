const { route } = require('./shop');

var router = require('express').Router();

function 로그인했니(요청, 응답, next) {
    if (요청.user) {
        next()
    } else {
        응답.send('로그인 안하셨습니다.')
    }
}

//모든 URL에 적용할 미들웨어
router.use(로그인했니);

router.get('/sports', function(요청,응답){
    응답.send('스포츠게시판');
})

router.get('/game', function(요청, 응답){
    응답.send('게임 게시판');
})

module.exports = router;