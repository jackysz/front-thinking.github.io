//url相关操作
define('url',function(require,exports,module){
	module.exports = {
		/**
		 * 设置hash
		 * @param name
		 */
		setHash:function(name) {
	        location.hash = name;
	    },
	    /**
         * 获取当前url中的hash值
         * @param url
         * @return String
         */
        getHash:function(url) {
            var u = url || location.hash;
            return u ? u.replace(/.*#/,"") : "";
        },
        /*
	    *	根据hash获取对应的模块名
	    */
	    getHashModuleName:function(){
	    	var hash=this.getHash();
			return (hash?hash.split("&")[0].split("=")[0]:"");
	    },
	    /*
	    *	从hash中获取action
	    */
	    getHashActionName:function(){
	    	var hash=this.getHash();
	    	if(hash=="")return "";
			return (hash?hash.split("&"):[])[0].split("=")[1];
	    },
	    /*
		* 从hash中获取name对应的值
	    */
	    getHashParam:function(name){
	    	var result = this.getHash().match(new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"));
			return result != null ? result[2] : "";
	    },
	    /*
	    *	从URL中获取参数对应的值
	    */
	    getUrlParam:function(name,url){
            //参数：变量名，url为空则表从当前页面的url中取
            var u  = arguments[1] || window.location.search,
                reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"),
                r = u.substr(u.indexOf("\?")+1).match(reg);
            return r!=null?r[2]:"";
        },
        /*
        *	获取所有HASH的参数，剔除moudel.
        */
        getParams:function(){
			var param = [],
				hash = this.getHash();
	    		paramArr = hash ? hash.split("&") : [];
	        for(var i= 1,l=paramArr.length;i<l;i++) {
	            param.push(paramArr[i]);
	        }
	        return param;
		},
		decodeUrl:function(url) {
            url = decodeURIComponent(url);
            var urlObj = this.parseUrl(url), decodedParam = [];
            $.each(urlObj.params, function(key, value) {
                value = decodeURIComponent(value);
                decodedParam.push(key+"="+value);
            });
            var urlPrefix = url.split("?")[0];
            return urlPrefix+"?"+decodedParam.join("&");
        },
        parseUrl:function(url) {
            var a =  document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':',''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function(){
                    var ret = {},
                        seg = a.search.replace(/^\?/,'').split('&'),
                        len = seg.length, i = 0, s;
                    for (;i<len;i++) {
                        if (!seg[i]) { continue; }
                        s = seg[i].split('=');
                        ret[s[0]] = s[1];
                    }
                    return ret;
                })(),
                file: (a.pathname.match(/([^\/?#]+)$/i) || [,''])[1],
                hash: a.hash.replace('#',''),
                path: a.pathname.replace(/^([^\/])/,'/$1'),
                relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
                segments: a.pathname.replace(/^\//,'').split('/')
            };
        }
	};
});
