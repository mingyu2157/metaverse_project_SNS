const express = require('express')
const ejs = require('ejs') //ejs 변수 지정
const app = express() //espress 변수 지정
const port = 3000 //포트번호 3000 (localhost:3000)
const bodyParser = require('body-parser');
const { runInNewContext } = require('vm');
const fs = require('fs');
const { spawn } = require('child_process');



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

app.post('/writingPost',function(req,res) {
  var code = req.body.code;
  var source = code.split(/\r\n|\r\n/).join("\n");
  var file='test.c';
  
  fs.writeFile(file,source,'utf8',function(error) {
      console.log('write end');
  });
  var compile = spawn('gcc',[file]);
  compile.stdout.on('data',function(data) {
      console.log('stdout: '+data);
  });
  compile.stderr.on('data',function(data){
      console.log(String(data));
  });
  compile.on('close',function(data){
      if(data ==0) {
          var run = spawn('./a.',[]);    
          run.stdout.on('data',function(output){
              console.log('컴파일 완료');
              var responseData = {'result':'ok','output': output.toString('utf8')};
              res.json(responseData);
          });
          run.stderr.on('data', function (output) {
              console.log(String(output));
          });
          run.on('close', function (output) {
              console.log('stdout: ' + output);
          });
      }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})