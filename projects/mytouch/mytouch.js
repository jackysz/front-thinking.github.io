/**
 * mytouch 移动开发框架
 * @version 1.0.1
 * @author kpxu\jimyan\wowowang
 * @description  modulejs("mytouch",function(m){ m.init(); })
 * mytouch框架主要是基于hashchange来进行模块的切换和加载，根据hash规则中描述的module和action进行实例化和执行。
 * 1、hash规则：#后以key1=value1&key2=value2的格式表示，第一个key表示要调用的module，第一个value表示要调用的action
 * 2、具备hash切换前后的析构和构造方法的检查，构造方法为:action_construct，析构方法为:action_destroy;通过构造和析构函数可以灵活实现如预缓存和资源销毁动作
 * 3、业务中需要定义module，并将相关页面的处理方法定义为action，则相应的调用url为：url#module=action&var1=values1...
 */
define('myTouch', function(require, exports, module) {
    var $=require("{jquery}");//modulejs所支持的变量模块名，通过vars配置会翻译成最终的module
	//读取配置，配置参数放在一个全局变量_mytouchConfig中，结构参考cfg变量
	window["_mytouchConfig"] || (window["_mytouchConfig"] = {});
	var cfg = {
		"frame": [], //如：["frame","init"]，[模块名，方法名]业务框架的module名及初始化action的名字，业务框架是指业务逻辑进行全局操作时的公共服务，一定会被调用
		"index": [], //如：["frame","index"]，首页模块的module名及默认action名字，首页主模块是指主框架初始化完成后首先调用的默认业务模块的名字
		"debug": false, //是否调试模式，如果为true，mytouch会打印相关的节点log到控制台
		"_last": [] //上一次被访问的的模块、方法名
	}
	//合并配置
	for (var i in window["_mytouchConfig"]) {
		cfg[i] = window["_mytouchConfig"][i];
	}
	var info = new msg;
	cfg.debug && info.on("*", function() {
		console.log(arguments);
	});

	function init(){
		//初始化主框架
		initFrameModule()
		//全局监听hashchange,并触发一次当前
		$(window).on("hashchange", function(e) {
			hashRoute();
		}) && hashRoute();
		//初始化业务框架模块 
	}

	function initFrameModule() {
		//如果未配置主模块则不初始化他
		if (cfg.frame.length < 2) {
			return false;
		}
		modulejs(cfg.frame[0], function(m) {
			if (m && typeof m[cfg.frame[1]] == 'function') {
				m[cfg.frame[1]]();

			} else {
				return false
			}
		});
	}
	//初始化hash路由模块

	function hashRoute() {
		//没有设置默认hash的时候使用默认的module、action
		var module = (getHashModuleName() || cfg.index[0]);
		var action = (getHashActionName() || cfg.index[1]);
		if (!module || !action) {
			return false;
		}
		//广播新的模块被载入
		var runObj = {
			m:module,
			a:action
		}
		info.emit("new_module_action", runObj);
		module = runObj.m;
		action = runObj.a;
		//异步加载要执行的module
		modulejs(module, function(m) {
			if (m && typeof m[action] == 'function') {
				//调用上一个action的析构方法（可选）
				checkDestroy();
				//先判断目标action是否有构造方法，有则执行，如果构造方法返回false，则不执行目标action
				if (m[action + "_construct"]) {
					(m[action + "_construct"]() !== false) && (m[action]());
				} else {
					m[action]();
				}
				//记录action场景
				cfg._last = [m, action];
				//广播moudle执行完成的事件
				info.emit("module_run_success", module, action);
			} else {
				//广播moudle加载错误的事件
				info.emit("moudle_load_error", module);
				//没有加载到module，什么都不做
				return false;
			}

		});
	}
	//执行析构方法,既然进入析构逻辑，就说明这个moudle和action已经被加载进来了，这里就不再做模块加载的动作

	function checkDestroy() {
		//调用上一个action的析构方法
		if (cfg._last[0] && typeof(cfg._last[0][cfg._last[1] + "_destroy"]) == "function") {
			return cfg._last[0][cfg._last[1] + "_destroy"]();
		} else {
			return "";
		}
	}
	/**
	 * 获取当前url中的hash值
	 * @param url
	 * @return String
	 */

	function getHash(url) {
		var u = url || location.hash;
		return u ? u.replace(/.*#/, "") : "";
	}
	/*
	 *	根据hash获取对应的模块名
	 */

	function getHashModuleName() {
		var hash = getHash();
		return (hash ? hash.split("&")[0].split("=")[0] : "");
	}
	/*
	 *	从hash中获取action
	 */

	function getHashActionName() {
		var hash = getHash();
		if (hash == "") return "";
		return (hash ? hash.split("&") : [])[0].split("=")[1];
	}
	/**
	 * [msg 消息广播组件，与msg module兼容，公用一个数据存储]
	 * @return {[type]} [description]
	 */

	function msg() {
		//全局变量，跟其他消息模块共享存储
		window["__msgsCenter"] || (window["__msgsCenter"] = {
			__Msgs: {}
		});
		var g = window["__msgsCenter"];
		/**
		 * 监听消息
		 * @param  {[string]}   type 自定义的消息名称，必须
		 * @param  {Function} fn   处理函数  必须
		 * @param  {[domelement]}   dom  用于透传的dom ，非必须
		 * @param  {[string]}   id   函数唯一标识，非必须
		 * @return {[null]}        无返回
		 */
		this.on = function(type, fn, dom, id) {
			var __Msgs = g.__Msgs;
			__Msgs[type] = Object.prototype.toString.call(__Msgs[type]) == "[object Array]" ? __Msgs[type] : [];
			__Msgs[type].push({
				guid: id ? id : +new Date() + "" + g.time++,
				fn: fn,
				dom: dom
			})
		}
		/**
		 * 消息广播
		 * @param  {[string]} type 自定义的消息名称，必须
		 *                         除type外的其他参数会透传给处理函数
		 * @return {[object]}      必须符合规范
		 *                         {
		 *                         		msgBack: mixed,//任意类型，作为postMsg的返回值
		 *                         		msgGoon :boolen,//true:执行后续事件处理函数，false:不执行
		 *                         		sendMsg:string//新的广播消息的名称，空串则不广播
		 *                            }
		 *                         如果没有按照规范返回，则此值直接作为postMsg的返回值，且后续事件处理函数不会执行
		 */
		this.emit = function(type) {
			return function(center, args, queue, reValue, guid, o) {
				//纯粹调试用
				var debug = center["*"];
				if (debug) { //所有消息都执行
					for (var i = 0, j = debug.length; i < j; i++) {
						debug[i].fn.apply(this, [type].concat(args));
					}
				}
				if (queue = center[type]) {
					var backData = {
						msgBack: null, //函数返回值
						msgGoon: true, //是否处理后续函数
						sendMsg: "" //新的广播消息名称
					};
					for (var i = 0, j = queue.length; i < j; i++) {
						o = queue[i];
						reValue = o.fn.apply(o.dom, args);
						if (Object.prototype.toString.call(reValue) == "[object Object]" && typeof(reValue) != "undefined") { //object类型
							backData.msgBack = reValue.msgBack;
							backData.msgGoon = reValue.msgGoon === false ? false : true;
							backData.sendMsg = reValue.sendMsg;
						} else {
							backData.msgBack = reValue;
							backData.msgGoon = false;
							backData.sendMsg = "";
						}

						if (backData.sendMsg) { //需要广播新消息
							this.postMsg.apply(this, [backData.sendMsg].concat(args));
						}
						if (backData.msgGoon === false) { //阻止后续事件处理
							break;
						}
					}
					return backData.msgBack;
				}
			}(g.__Msgs, Array.prototype.slice.call(arguments, 1))
		}
		/**
		 * 从队列中移除消息
		 * @param  {[string]} type 自定义的消息名称，必须
		 * @param  {[string]} id  函数唯一标识，非必须。
		 *                         如果没有id，则删除type下所有处理函数
		 *                         如果有id,则删除指定处理函数
		 * @return {[object]}      调用者
		 */
		this.off = function(type, id) {
			var __Msgs = g.__Msgs;
			if (!id) { //没有id,则删除事件名称下所有处理函数
				delete __Msgs[type];
			} else {
				var _o = __Msgs[type] || [];
				for (var i in _o) {
					if (_o[i].guid == id) {
						_o.splice(i--, 1);
						break;
					}
				}
			}
			return this;
		}
		/**
		 * 从队列中移除消息,非建议方法，不利于后续自动化扫描
		 * @param  {[string]} type 自定义的事件名称，正则表达式
		 * @return {[object]}      调用者
		 */
		this.offReg = function(type) {
			var __Msgs = g.__Msgs,
				reg = new RegExp(type);
			for (var i in __Msgs) {
				if (reg.test(i)) {
					delete __Msgs[i];
				}
			}
			return this;
		}
	}

	exports.info = info;
	exports.init = init;
});
