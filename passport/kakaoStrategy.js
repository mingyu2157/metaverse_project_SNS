// 카카오 로그인 전략
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy; // passport-kakao 모듈로부터 Strategy 생성자를 불러와 전략 구현
const OAuth2Strategy = require('passport-oauth2').Strategy;
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0000',
    database: 'mz_database'
  })

connection.connect();

const clientID = process.env.KAKAO_ID;
const clientSecret = process.env.KAKAO_SECRET;

module.exports = () => {
    passport.use(new KakaoStrategy({  
        authorizationURL: 'https://kauth.kakao.com/oauth2/authorize',
        tokenURL: 'https://kauth.kakao.com/oauth2/token',
        clientID: process.env.KAKAO_ID,
        // clientSecret: clientSecret,
        callbackURL: 'http://localhost:3000/main'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const queryString = 'INSERT INTO users (username, userID, provider) VALUES (?, ?, ?)';
            const values = [
                profile_nickname,
                profile.id,
                'kakao'
            ];        
    
            connection.query(queryString, values, (error, results, fields) => {
                if (error) {
                    console.error('Error saving user to database:', error);
                    done(error);
                } else {
                    console.log('User saved to database successfully:', results);
                    // 여기서 done 콜백을 사용하여 사용자 정보를 passport에 전달할 수 있습니다.
                    // 예를 들어, done(null, user)와 같이 사용자 객체를 전달할 수 있습니다.
                }
            });
        } catch (error) {
            console.error('Error saving user to database:', error);
            done(error);
        }
    }));
};
// module.exports = (passport) => {
//     passport.use(new OAuth2Strategy({
//         authorizationURL: 'https://kauth.kakao.com/oauth2/authorize',
//         tokenURL: 'https://kauth.kakao.com/oauth2/token',
//         clientID: clientID,
//         // clientSecret: clientSecret,
//         callbackURL: 'http://localhost:3000/auth/kakao/callback'
//     }, async (accessToken, refreshToken, profile, done) => {
//         try {
//             const queryString = 'INSERT INTO users (username, userID, provider) VALUES (?, ?, ?)';
//             const values = [
//                 profile._json && profile._json.profile_nickname,
//                 profile.id,
//                 'kakao'
//             ];        
    
//             connection.query(queryString, values, (error, results, fields) => {
//                 if (error) {
//                     console.error('Error saving user to database:', error);
//                     done(error);
//                 } else {
//                     console.log('User saved to database successfully:', results);
//                     // 여기서 done 콜백을 사용하여 사용자 정보를 passport에 전달할 수 있습니다.
//                     // 예를 들어, done(null, user)와 같이 사용자 객체를 전달할 수 있습니다.
//                 }
//             });
//         } catch (error) {
//             console.error('Error saving user to database:', error);
//             done(error);
//         }
//     }));
// };