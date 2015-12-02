/**
 * Created by xjw919 on 15/10/28.
 */
var request1 = require('request');
var url = "https://nodei.co/npm/request.png";
var url2 = "http://csdc.info/smdb/image/code_android.png";
var url3 = "http://csdc.info/smdb/css/common.css?ver=14465";
var url4 = "http://localhost:3000";
var options1 = {url: "http://localhost:80dsdsd88/auth/signup", method: "HEAD", form: {"username": "test4", "password": "12345678", displayName: "test4", email: "269354528@qq.com"}};
var options2 = {url: "http://nadr.hust.edu.cn/cmis/notice/viewNotice.action?isfromfirst=1&status=inner&noticeid=f31c4a815073665f01508336c730051c", method: "GET"};
var options3 = {url: "http://i.360.cn/asddsdfindpwd/setpwdfromemail?vc=e%2FwljiqD9WEw%2F2xIl1sVSWWqmxtpbzhZghpXBAR3pHLExDuFoT1cghbmwSNP%2F%2BBNWLK63jPGWlhmI7x5mzx1LT6MjDre1PqKnbc9xU8CLdfMfTnYGb%2Bvo8vcsmTvkTJ%2FxSFAGek1iWrFm137qqdl2kWSJuyn3Yn3AsWqJFS9k9Q%3D", method: "POST"};
var options4 = {url: "http://i.360.cn/profile/avatar?sb_param=b6acb94b869d44c2835d2f22f6a613d3", method: "GET"};
var options5 = {url: "http://nadr.hussdsst.edu.cn/cmis/msgboard/viewMessage.action?status=inner&messageid=f31c4a814df9d5e8014e5cf530e81841", method: "HEAD"};

var optionsArr = [options1, options2, options3, options4, options5];

var deadLinks = [];
var validLinks = [];
var url5 = "http://nadr.hust.edu.cn/cmis/notice/viewNotice.action?isfromfirst=1&status=inner&noticeid=f31c4a8150b353200150b616d08100be";

var async = require("async");
var Q = require("q");
var request = require('request-promise');
var urlArr1 = ["https://nodei.co/npm/request.png", "http://xxxxx.dsa.ds.d.sd", "http://ddddddedu.cn/cmis/notice/listNotice.action?status=inner", "http://nadr.hust.edu.cn/cmis/notice/toAddNotice.action", "http://nadr.hust.edu.cn/cmis/news/listNews.action?status=inner", "http://nadr.hust.edu.cn/cmis/news/toAddNews.action", "http://nadr.hust.edu.cn/cmis/mailer/listMail.action", "http://nadr.hust.edu.cn/cmis/mailer/toAddMail.action", "http://nadr.hust.edu.cn/cmis/msgboard/listMessage.action?status=inner", "http://nadr.hust.edu.cn/cmis/msgboard/toAddMessage.action?status=inner", "http://nadr.hust.edu.cn/cmis/msgboard/listMessage.action?status=unRead", "https://nadr.hust.edu.cn/repos/anon/", "https://nadr.hust.edu.cn/bugzilla/", "http://nadr.hust.edu.cn/community/", "http://www.cnzz.com/stat/website.php?web_id=4360695"];


var optionsReq = urlArr1.map(function (item){
    return request({url: item, method: "HEAD"}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            validLinks.push(item);
        }else {
            deadLinks.push(item);
        }
    });
});

Q.allSettled(optionsReq).then(function (){
    console.log(validLinks);
    console.log("===========");
    console.log(deadLinks);
},function (err){
    console.log(err);
});

