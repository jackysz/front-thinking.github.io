/**
 * Created by xjw919 on 15/10/29.
 */
var http = require("http");
var num = 0;
http.createServer(function(req, res){
    num +=1;
    res.end("<h1>Hi " + num + "</h1>");
}).listen(3000);