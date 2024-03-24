// //web compiler 구현
// document.querySelector('.ajaxsend').addEventListener('click', function(){
//     sendAjax('http://localhost:3000/WritionPost', code.value);
// })
// function sendAjax(url, data, language) { 
//     var data = {'code' : data}; // data 변수에 json 형태로 값이 저장
//     data = JSON.stringify(data); // data 값을 다시 문자열로 변환
//     var xhr = new XMLHttpRequest();
//     xhr.open('POST',url,true) //url 은 클라이언트에서 보낸 값을 처리할 서버쪽의 app.post로 작성된 라우터
//     xhr.setRequestHeader('Content-type', 'application/json');
//     xhr.send(data);

//     xhr.addEventListener('load', function() {
//         var result = JSON.parse(xhr.responseText);
//         if(result.result != 'ok')return;
//             document.getElementById('output').value=result.output;
//     });
// }
// 웹컴파일러 구현
const express = require('express')
const ejs = require('ejs') //ejs 변수 지정
const app = express() //espress 변수 지정
const port = 3000 //포트번호 3000 (localhost:3000)
const bodyParser = require('body-parser');
const { runInNewContext } = require('vm');


app.set('view engine', 'ejs') //ejs 뷰엔진 사용
app.set('views', './views') 

app.use(bodyParser.urlencoded({extended: false})); //bodyparser 사용
app.use(bodyParser.json());

app.use(express.static(__dirname+'/public')) //static 요소 사용

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
            var run = spawn('./a.out',[]);    
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