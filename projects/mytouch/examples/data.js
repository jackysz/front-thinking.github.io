/*
 * 数据管理层
 */
define('data', function(require, exports, module) {
	exports.isDebug = false;
	var version = typeof(dataVersion) != "undefined" ? dataVersion : "2013032211";
	var _user = {}, _pub = {};
	var cache = require("cache");
	//这里开始实例子数据加载模块并输出接口
	var tpl = require("data.tpl");
	var tester = require("data.tester");
	exports.tpl = tpl;
	exports.tester = tester;
	//数据初始化开始
	createCache(); //初始化缓存
	//返回数据中心操作句柄
	exports._pub = _pub;
	exports._user = _user;
	exports.saveCache = saveCache;
	exports.structCache = structCache;

	/**
	 * [_loader 简化远程数据调用方法]
	 * @param  {[type]}   url       [必选，请求的url]
	 * @param  {[type]}   postData  [必选，要提交的post数据，没有post的时候保持空]
	 * @param  {Function} callback  [必选，请求完成后的回调方法]
	 * @param  {[type]}   struct    [必选，数据请求回来后的缓存构造方法，必须要实现]
	 * @param  {[type]}   parser    [可选，数据请求回来后的数据处理方法，默认当作json串处理，需要特殊处理的时候可重写]
	 * @param  {[type]}   errorBack [可选，请求出错的时候，返回一个错误json对象，错误码为404]
	 * @return {[type]}             [null]
	 */
	exports._loader = function(url, postData, callback, struct, parser, errorBack) {
		//默认将回调内容按照json解析
		parser ? "" : parser = function(data) {
			try {
				json = JSON.parse(data);
			} catch (e) {
				json = {
					errCode: 500
				};
			}
			return json;
		};
		//失败回调默认值
		errorBack ? "" : errorBack = {
			errCode: 404
		};
		//把vb2ctag等参数带在请求后，方便统计，默认ajax=true，错误回调的时候返回json
		//url = url + (url.indexOf("?") == -1 ? "?" : "&") + "ajax=true&" + (window.baseParam?window.baseParam:"");
		exports.isDebug && console.log("_loader Start:" + url);
		exports.isDebug && console.log("postData:") && console.debug(postData);
		$.ajax({
			type: postData ? "POST" : "GET",
			url: url,
			dataType: "html",
			data: postData,
			timeout: 2000,
			success: sucRequest,
			error: errRequest
		});

		function sucRequest(json) {
			json = parser(json);
			structCache(); //保证缓存结构标准
			var _s = struct(json); //调用接口的缓存构造方法，将拉取到数据写入缓存。返回false表示缓存未变化
			if (_s !== false) {
				saveCache(); //将构造后的缓存写入localstorage
			}
			callback(json);
		}

		function errRequest(e) {
			json = errorBack;
			structCache(); //保证缓存结构标准
			var _s = struct(json); //调用接口的缓存构造方法，将拉取到数据写入缓存。返回false表示缓存未变化
			//(_s === false) ? saveCache() : ""; //将构造后的缓存写入localstorage 错误不写本地缓存。
			callback(json);
		}
	}
	/**
	 * [saveCache 将更新后的缓存数据写入localStorage]
	 * @return {[type]} [null]
	 */

	function saveCache() {

		cache.setStore("data_pub", JSON.stringify(_pub), version, 1000 * 60 * 60 * 24 * 100);
		cache.setStore("data_user", JSON.stringify(_user), version + window.sid, 1000 * 60 * 60 * 24 * 100);
	}
	/**
	 * [createCache data模块第一创建时，从localstorage中初始化数据源]
	 * @return {[type]} [null]
	 */

	function createCache() {
		_pub = {};
		var p = cache.getStore("data_pub", version);
		p && (_pub = JSON.parse(p));
		_user = {};
		var u = cache.getStore("data_user", version);
		u && (_user = JSON.parse(u));
		structCache();
	}
	/**
	 * [structCache 标准化缓存结构，检查当前缓存中是否缺少标准结构中的字段，缺少的自动补全]
	 * @return {[type]} [description]
	 */

	function structCache() {
		var s_pub = {
			"tpl": {}, //模板数据
			"test": {} //测试数据
		};
		var s_user = {

		};
		checkNode(_pub, s_pub);
		checkNode(_user, s_user);

		function checkNode(source, tpl) {
			for (var i in tpl) {
				if (typeof(source[i]) == "undefined") {
					source[i] = {};
				}
				checkNode(source[i], tpl[i]);
			}
		}
	}
	/**
	 * [test 功能测试]
	 * @return {[type]} [null]
	 */
	exports.test = function() {
		exports.isDebug = true;
	};

	/**
	 * 删除
	 * @return {[type]} [description]
	 */
	exports.clearUser = function() {
		_user = {};
		structCache();
	}

});
//模板数据管理模块
define('data.tpl', function(require, exports, module) {
	var data = require("data");
	var info = require("info");
	exports.getTpl = getTpl; //清除订单数据的缓存

	function getTpl(tpid, callback) {
		var tp = document.getElementById(tpid);
		if (tp) {
			callback(tp.innerHTML);
		} else {
			if (data._pub.tpl.data && data._pub.tpl.cacheTime >= (new Date()).getTime()) {
				findTpl(data._pub.tpl.data, tpid)
			} else {
				loadTpls(function(d) {
					findTpl(d.data, tpid);
					if (d.errCode) {
						info.emit("tpl_load_error", d.errCode);
					}
				})
			}
		}

		function findTpl(tpls, tpid) {
			$('body').append(tpls);
			var tp = document.getElementById(tpid);
			if (tp) {
				callback(tp.innerHTML)
			} else {
				callback("");
				info.emit("tpl_not_found", tpid);
			}
		}
	}

	function loadTpls(callback) {
		var url = "./examples/tpl.html";
		data._loader(url, "", callback, struct, function(html) {
			return {
				"data": html
			};
		}, {
			"errCode": 404,
			"data": "模板加载失败！"
		});

		function struct(info) {
			data._pub.tpl = info;
			data._pub.tpl.cacheTime = ((new Date()).getTime() + 1000); //* 60 * 60 * 24 * 7
			return true;
		}

	}



});
//数据测试模块
define('data.tester', function(require, exports, module) {
	var data = require("data");
	var info = require("info");
	exports.getTestData = getTestData; //清除订单数据的缓存

	function getTestData(callback) {
		if (data._pub.test.data && data._pub.test.cacheTime >= (new Date()).getTime()) {
			console.log("test data is from cache");
			callback(data._pub.test.data);
		} else {
			console.log("test data is from load");
			loadTestData(function(d) {
				callback(d.data);
			})
		}
	}

	function loadTestData(callback) {
		var url = "./examples/testdata.js";
		data._loader(url, "", callback, struct);

		function struct(info) {
			data._pub.test = info;
			data._pub.test.cacheTime = ((new Date()).getTime() + 100); //* 60 * 60 * 24 * 7
			return true;
		}
	}


});