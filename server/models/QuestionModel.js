var mysql = require('mysql');
var config = require('../db/config');

var pool = mysql.createPool(config.mysql);
pool.on('connection', function (connection) {
    connection.query('SET SESSION auto_increment_increment=1');
});

module.exports = {
    /**
     * 提问
     * title 标题
     * tag 标签
     * content 内容
     */
    askQuestion(req,res){
        let data = {
            code:200,
            msg:'success'
        };

        let body = req.body;
        let title = body.title;
        let tag = body.tag;
        let content = body.content;
        let user_id = req.session.sessionID;
        // 验证
        if(title == '' || tag == '' || content==''){
            data.code = 400;
            data.msg = '请填写完整问题信息';
            res.send(data);
            return;
        }
        
        let askSql = 'insert questions(q_id,q_title,q_tag,q_content,user_id) values(null,?,?,?,?)';
        let param = [title,tag,content,user_id];
      
        pool.getConnection((err,conn)=>{
            if(err){
                data.code = 401;
                data.msg = '连接错误';
                res.send(data);
                return;
            }

            conn.query(askSql,param,(err)=>{
                if(err){
                    data.code = 400;
                    data.msg = err.message;
                    res.send(data);
                    return;
                }
                res.send(data);
            });
            conn.release();
        });
    },

    /**
     * 获取问题列表
     * todo
     * 标签为数组
     */
    questionList(req,res){
        let data = {
            code:200,
            msg: 'success'
        };

        let queSql = 'SELECT q_id,q_title questionTitle,t_name tagName,votes,answer,views,u.username AS lastRespondent FROM questions AS q INNER JOIN tags as t ON t.t_id IN q.q_tag INNER JOIN user AS u ON q.last_res_id = u.uid ORDER BY create_time DESC';

        pool.getConnection((err,conn)=>{
            if(err){
                data.code = 401;
                data.msg = '连接错误,请稍候重试';
                res.send(data);
                return;
            }
            conn.query(queSql,[],(err,rs)=>{
                if(err){
                    data.code = 400;
                    data.msg = err.message;
                    res.send(data);
                    return;
                }
                data.data = rs;
                res.send(data);
            });
            conn.release();
        });
    },

    /**
     * 获取问题详情
     */
    questionDetail(req,res){
        let data = {
            code:200,
            message: 'sucess',
            data:''
        };
        
        let queSql = 'select q.q_content,u.username from questions as q inner join user as u on q.user_id = u.uid where q_id=?';
        let param = req.query.q_id;
        pool.getConnection((err,conn)=>{
            if(err){
                data.code = 401;
                data.msg = '连接错误';
                res.send(data);
                return;
            }
            conn.query(queSql,param,(err,rs)=>{
                if(err){
                    data.code = 400;
                    data.msg = err.message;
                    res.send(data);
                    return;
                }
                let result = {
                    q_content: rs[0].q_content.toString(),
                    username: rs[0].username
                };    
                data.data = rs[0].q_content.toString();
                data.data = result;
                res.send(data);
            });
            conn.release();
        });
    }

};