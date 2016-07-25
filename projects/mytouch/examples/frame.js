//业务主框架,为各个业务模块提供公共操作及ui界面框架操作
define('frame', function(require, exports, module) {
	var data = require("data");
	var info = require("info");
	var evt = require("event");
	var timer = "";

	//主框架入口方法
	exports.init = function() {
		//初始化事件框架
		evt.eventBind();
	}
	//输出页面内容方法
	exports.setContent = function(html) {
		document.getElementById("content-container").innerHTML = html;
	}
	//主框架入口方法
	exports.index = function() {
		console.log("首页 is init");
		data.tpl.getTpl("index_tmpl", function(tp) {
			exports.setContent(tp);
		});
	}
	//主框架入口方法
	exports.test = function() {
		console.log("testMoudel is init");
		data.tpl.getTpl("testMoudel_tmpl", function(tp) {
			exports.setContent(tp);
		});
	}
	//消息机制的测试
	exports.msg = function() {
		data.tpl.getTpl("testMsg_tmpl", function(tp) {
			exports.setContent(tp);
			setTimeout(function() {
				$("#logger").append("test_msg_send1消息被监听<br/>");
				$("#logger").append("test_msg_send2消息被监听<br/>");
				info.on("test_msg_send1", function() {
					$("#logger").append("test_msg_send1消息被发现了！！！<br/>");
				});
				info.on("test_msg_send2", function() {
					$("#logger").append("test_msg_send2消息被发现了！！！<br/>");
				});
			}, 2000);
			setTimeout(function() {
				$("#logger").append("test_msg_send1消息被发送<br/>");
				info.emit("test_msg_send1");
			}, 4000);
			setTimeout(function() {
				$("#logger").append("test_msg_send2消息被发送<br/>");
				info.emit("test_msg_send2");
			}, 5000);
			setTimeout(function() {
				$("#logger").append("test_msg_send1消息被取消监听<br/>");
				info.off("test_msg_send1");
			}, 10000);
			setTimeout(function() {
				$("#logger").append("test_msg_send1消息再次被发送<br/>");
				info.emit("test_msg_send1");
				$("#logger").append("test_msg_send2消息再次被发送<br/>");
				info.emit("test_msg_send2");
			}, 12000);
			setTimeout(function() {
				$("#logger").append("通过正则/test.*/取消了所有类似消息的监听<br/>");
				info.offReg(/test.*/);

			}, 14000);
			setTimeout(function() {
				$("#logger").append("test_msg_send1消息再次被发送<br/>");
				info.emit("test_msg_send1");
				$("#logger").append("test_msg_send2消息再次被发送<br/>");
				info.emit("test_msg_send2");
			}, 16000);

		});
	}
	//使用代理机制进行事件处理
	exports.event = function() {
		data.tpl.getTpl("testMoudel_event", function(tp) {
			exports.setContent(tp);
		});
	}
	//使用data模块进行异步数据管理和缓存
	exports.datatest = function() {
		data.tpl.getTpl("testMoudel_data", function(tp) {
			exports.setContent(tp);
			data.tester.getTestData(function(d) {
				$("#logger").append("数据来自远程加载<br/>");
				$("#logger").append(d + "<br/>");
				data.tester.getTestData(function(d) {
					$("#logger").append("数据来自本地缓存<br/>");
					$("#logger").append(d + "<br/>");

				})
			})
		});
	}
	//模块action的预构造和析构测试---主方法
	exports.actions = function() {

		data.tpl.getTpl("testMoudel_actions", function(tp) {
			exports.setContent(tp);
			alert("主action被执行！主模块每两秒会发出一条系统消息，在控制台可以看到");
			timer = setInterval(function() {
				info.emit("actions_send_a_msg");
			}, 2000);
			info.on("actions_send_a_msg", function() {
				console.log("i got a message!");
			})
		});
	}
	//模块action的预构造和析构测试---预构造方法
	exports.actions_construct = function() {
		return confirm("当前是actions方法的预构造方法在执行。如果选择是则继续执行主方法，否则不再执行！");
	}
	//模块action的预构造和析构测试---析构方法
	exports.actions_destroy = function() {
		alert("当前是action的析构方法在执行，会删除掉前面的计时器、卸载消息监听，确定后会执行下一个方法。");
		timer && clearInterval(timer) && (timer = null);
		info.off("actions_send_a_msg"); //或者批量移除：info.offReg("actions_.*");
	}
	//模板引擎的使用
	exports.tpls = function() {
		var testData = {
			name: '微模版测试',
			list: [1, 2, 3, 4]
		}
		data.tpl.getTpl("testMoudel_tpls", function(tp) {
			exports.setContent(tp);
			data.tpl.getTpl("testTpls", function(tp) {
				var html = tpl.tpl(tp, testData);
				$("#logger").html(html);
			})

		});
	}
});