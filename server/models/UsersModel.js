var mysql = require('mysql');
var async = require('async');
var config = require('../db/config');

var pool = mysql.createPool(config.mysql);
pool.on('connection', function (connection) {
    connection.query('SET SESSION auto_increment_increment=1');
});

module.exports = {
    // 注册
    register(req,res){
        // 注册
        let addUserSql = 'insert into user (username,email,mobile,pwd) values(?,?,?,?)';

        // 读取新用户uid
        let querySql  = 'select uid from user where username = ?';

        let body = req.body;
        let email = body.email == '' ? null : body.email;       // 为空则存储null
        let mobile = body.mobile == '' ? null : body.mobile;    // 为空则存储null
        let params = [body.name,email,mobile,body.pwd];
        let queryParams = [body.name];

        pool.getConnection((err,conn)=>{
            let data = {
                code: 200,
                msg: '',
                data:''
            };
            if(err) {
                data.code = 400;
                data.msg = '连接错误,请稍后再试';
                res.send(data);
                return;
            }
            
            async.series([
                // 注册
                function(callback){
                    conn.query(addUserSql,params,(err)=>{
                        if(err){
                            console.log(`写入异常:${err}`);
                            data.code = 400;
                            let msg = err.message;
                            if(msg.indexOf('email_unique') > -1){
                                data.msg = '邮箱已被注册';
                                data.errType = 'email';
                            }else if(msg.indexOf('username_unique') > -1){
                                data.msg = '用户名已被注册';
                                data.errType = 'name';
                            }else if(msg.indexOf('mobile_unique')){
                                data.msg = '手机已被注册';
                                data.errType = 'mobile';
                            } else {
                                data.msg = msg;
                            }
                            res.send(data);
                            return;
                        }
                        callback(null,'register');
                    });
                },

                // 读取新用户的uid
                function(callback){
                    conn.query(querySql,queryParams,(err,rs)=>{
                        if(err){
                            data.code = 400;
                            data.msg = err.message;
                            res.send(data);
                            return;
                        }
                        callback(null,rs[0]);
                    });
                }
            ],
            function(err,result){
                //拿到user_id 放入session
                req.session.sessionID = result[1].uid;
                data.msg = 'success';
                res.send(data);
            });
            conn.release();
        });
    },

    // 登录
    login(req,res){

        let loginSql = 'select uid,username from user where (email=? or mobile=?) and pwd=?';
        let body = req.body;
        let params = [body.user,body.user,body.pwd];
        
        pool.getConnection((err,conn)=>{
            let data = {
                code: 200,
                msg:'success'
            };

            if(err){
                data.code = 401;
                data.msg = err.message;
                res.send(data);
                return;
            }

            conn.query(loginSql,params,(err,rs)=>{
                if(err){
                    data.code = 401,
                    data.msg = err.message,
                    res.send(data);
                    return;
                }

                // 查询结果结果
                if(rs.length > 0 ){
                    data.data = rs[0];

                    // 设置session
                    let sessionID =  rs[0].uid;
                    req.session.sessionID = sessionID;

                }else {
                    data.code = 400;
                    data.msg = '用户名或密码错误';
                }
                res.send(data);
            });
            conn.release();
        });
    },

    // 查询用户信息
    getUserInfo(req,res){
        let userSql = 'select mobile, email, username, create_time from user where uid = ? ';
        let params = [req.session.sessionID];

        pool.getConnection((err,conn)=>{
            let data = {
                code: 200,
                msg: 'success',
                data: ''
            };
            if(err){
                data.code = 401;
                data.msg = err.message;
                res.send(data);
                return;
            }

            conn.query(userSql,params,(err,rs)=>{
                if(err){
                    data.code = 401;
                    data.msg = err.message;
                    res.send(data);
                    return;
                }
                if(rs.length>0){
                    data.data = rs[0];
                }else{
                    data.msg = '无此用户';
                }
                res.send(data);
            });
        });
    },


    //=========================
    // 查询用户列表
    getUserList(req,res){
        let getUserSql = ' select uid,username from user';
        let params = [];
      
        pool.getConnection((err,conn)=>{
            if(err) throw err;

            conn.query(getUserSql,params,(err,rs)=>{
                if(err) throw err;

                let arr = [];
                if(rs.length){
                    rs.forEach((e)=>{
                        let obj = {
                            username: e.username,
                            email: e.email
                        };
                        arr.push(obj);
                    });

                    let data = {
                        code:200,
                        data:arr
                    };
                    res.send(data);
                    return;
                }
                res.send('无用户');
            });
            conn.release();
        });
    }
};