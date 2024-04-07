const express = require('express')
const ejs = require('ejs') //ejs 변수 지정
const app = express() //espress 변수 지정
const port = 3000 //포트번호 3000 (localhost:3000)
const bodyParser = require('body-parser');
const { runInNewContext } = require('vm');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');


app.set('view engine', 'ejs') //ejs 뷰엔진 사용
app.set('views', './views') 

app.use(bodyParser.urlencoded({extended: false})); //bodyparser 사용
app.use(bodyParser.json());

app.use(express.static(__dirname+'/public')) //static 요소 사용

//---------------------------------------------------------
//라우터 연결

//const pageRouter = require('./routes/page'); 
// const pageCompiler = require('./routes/compiler');

//---------------------------------------------------------

app.get('/', (req, res) => {
  res.render('index')
})//메인페이지

app.get('/login', (req, res) => {
  res.render('login')
})//로그인 페이지

app.get('/profile', (req, res) => {
  res.render('profile')
})//계정 정보 페이지

app.get('/editProfile', (req, res) => {
  res.render('editProfile')
})//계정 정보 수정 페이지

app.get('/postDetails', (req, res) => {
  res.render('postDetails')
})//게시글 디테일 페이지

app.get('/writingPost', function(req, res) {
  res.render('writingPost')
})//게시글 작성 페이지
 
//--------------------------------------------------------

app.post('/writingPost', function(req, res, next) {
  var code = req.body.code;
  var language = req.body.language; // 언어 정보를 요청에서 읽어옴

  var source = code.split(/\r\n|\r\n/).join("\n");
  var file = 'test'; // 확장자를 제외한 파일 이름

  // 언어에 따라 파일 확장자 지정
  var fileExt;
  if (language === '1') { // C
      fileExt = '.c';
  } else if (language === '2') { // C++
      fileExt = '.cpp';
  } else if (language === '3') { // Java
      fileExt = '.java';
  } else {
      // 지원하지 않는 언어인 경우 오류 응답
      return res.status(400).json({ result: 'error', error: '지원하지 않는 언어입니다.' });
  }

  file += fileExt; // 파일 이름에 확장자 추가

  fs.writeFile(file, source, 'utf8', function(error) {
      console.log('write end');
      if (error) {
          console.error('Error writing file:', error);
          return next(error); // 오류 발생 시 미들웨어에 오류를 전달
      }

      var compile; // 컴파일러 spawn 객체
      var run; // 실행 파일 spawn 객체

      // 언어에 따라 컴파일 및 실행 명령 설정
      if (language === '1') { // C
          compile = spawn('gcc', [file]);
          run = spawn(path.join(__dirname, './a.exe'), []);
      } else if (language === '2') { // C++
          compile = spawn('g++', [file]);
          run = spawn(path.join(__dirname, './a.exe'), []);
      } else if (language === '3') { // Java
          compile = spawn('javac', [file]);
          run = spawn('java', [path.basename(file, fileExt)]); // 확장자를 제외한 파일명으로 실행
      }

      // 컴파일러 stderr 이벤트 핸들링
      compile.stderr.on('data', function(data) {
          console.error('stderr: ' + String(data));
          return next(new Error('컴파일 오류: ' + String(data))); // 오류 발생 시 미들웨어에 오류를 전달
      });

      // 컴파일러 close 이벤트 핸들링
      compile.on('close', function(data) {
          if (data === 0) {
              // 실행 파일이 생성된 경우 실행
              run.stdout.on('data', function(output) {
                  console.log('컴파일 및 실행 완료');
                  var responseData = { result: 'ok', output: output.toString('utf8') };
                  res.json(responseData);
              });

              // 실행 파일 stderr 이벤트 핸들링
              run.stderr.on('data', function(output) {
                  console.error('stderr: ' + String(output));
                  return next(new Error('실행 오류: ' + String(output))); // 오류 발생 시 미들웨어에 오류를 전달
              });

              // 실행 파일 close 이벤트 핸들링
              run.on('close', function(output) {
                  console.log('stdout: ' + output);
              });
          }
      });
  });
});



// 오류 핸들러 추가
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ result: 'error', message: '서버 오류', error: err.message });
});

// 서버 시작
var server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
