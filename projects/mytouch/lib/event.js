/*
 *	事件管理模块，
 *	模块会以事件委托的形式，根据PC和mobile客户端实现事件差异化处理，以下为注意事项:
 *	1、模块支持的事件类型如下
 *	   tap(mobile touch实现的点击事件) 、click 、input、change、 sroll
 *	2、为实现事件委托，需要在body标签下创建 id="etDiv"(id为配置) 的div标签，所有的页面内容，应该
 *	   放在此div标签内容，考虑到以下原因，因此不在document下做事件委托：
 *	   
 *	   android系统(uc qq浏览器)
 *	   a、所有元素(包括document)，一定会响应click事件，此时document上的click事件代理有效
 *
 *     iso系统(safari chrome qq 浏览器)
 *     a.可点击元素(如a标签)，一定会响应click事件，此时document上的click事件代理有效
 *     b.不可点击元素，若父节点上（不包括body）没有绑定click事件，则document上的click事件代理失效。
 *       如果父节点上（不包括body）有绑定click事件，且touchend事件没有e.preventDefault();
 *       阻止浏览器行为，则document上的click事件代理有效。
 *  3、需要做事件处理的节点，需在节点内容增加一个自定义属性，属性名为pe(名称可配置)，pe的内容格式为：
 *     事件类型:xxxx  (xxxx为自定义信息，如:tap:myTap 或者 input:myInput,tap:myTap)
 *  4、事件默认会冒泡，直到绑定全局事件的节点。中途遇到pe属性的节点都会触发响应事件。如果事件名称以_开头，
 *     如：tap._myTap ，则阻止向上冒泡并出发事件 myTap(去掉了_)
 *	   
 */
define('event', function(require, exports, module) {
	var device = require('device'),
		inf = require('info');
	var g = {
		pc: device.isPc,//客服端是否PC
		coordinates : [],//在手机端记录touchend时坐标，以便取消该坐标25PX范围内的click事件响应

		//以下为配置信息
		etAttr : "pe",//节点中，记录事件信息的自定义属性名称
		dom : $("#etDiv"),//全局事件绑定的节点
		time : 0//用于生成事件处理函数的id
	};

	/**
	 * 绑定事件
	 * @param  {[string]}   type 自定义的事件名称，必须
	 * @param  {Function} fn   处理函数  必须
	 * @param  {[domelement]}   dom  用于透传的dom ，非必须
	 * @param  {[string]}   id   函数唯一标识，非必须
	 * @return {[null]}        无返回
	 */
	exports.on = function(type, fn, dom, id){
		inf.on(type, fn, dom, id);
	}
	exports.onMsg = exports.on;

	/**
	 * 触发事件
	 * @param  {[type]} type [自定义事件名称]
	 */
	exports.emit = function(type){
		return inf.emit.apply(this,arguments);
	}
	exports.postMsg = exports.emit;

	/**
	 * 解绑事件
	 * @param  {[string]} type 自定义的事件名称，必须
	 * @param  {[string]} id  函数唯一标识，非必须。
	 *                         如果没有id，则删除type下所有处理函数
	 *                         如果有id,则删除指定处理函数
	 * @return {[object]}      调用者
	 */
	exports.off = function(type, id) {
		inf.off(type, id);
		return this;
	}
	exports.removeMsg = exports.off;

	/**
	 * 解绑事件,非建议方法，不利于后续自动化扫描
	 * @param  {[string]} type 自定义的事件名称，正则表达式
	 * @return {[object]}      调用者
	 */
	exports.offReg = function(type) {
		inf.offReg(type);
		return this;
	}
	exports.removeMsgReg = exports.offReg;

	/**
	 * 事件绑定
	 * mobile使用zepto，PC使用jquery，两个库的on函数的第二个参数(样式选择器)存在差异，
	 * 
	 * zepto:
	 * 只有最初的元素符合selector时，才会调用响应函数。如果给定selector ,
	 * 则this是符合selector的元素节点，否则为绑定事件的元素节点
	 * (click时，把样式选择器的参数去掉，因为发现某些场景会导致click函数不处理，暂时没找到原因)
	 *
	 * jquery:
	 * 在冒泡过程中，只有节点符合selector，才会调用一次响应函数，有多少个符合，
	 * 调用多少次。如果没有给定selector,则，只有冒泡到绑定事件的节点才会调用响应函数
	 * @return {[type]} [无返回]
	 */
	exports.eventBind = function() {
		var dom = g.dom;
		if (!g.pc) { //非PC客户端，绑定touch事件
			dom.on("touchstart",touchstartFn)
				.on("touchmove",touchmoveFn)
				.on("touchend",touchendFn)
				.on("click",mClickFn)
				.on("input",eventFn("input"))
				.on("change",eventFn("change"));
		}else{
			dom.on("click",eventFn("click"))
				.on("keyup",eventFn("keyup"))
				.on("change",eventFn("change"));
		}
		$(window).on("scroll", scrollEvent);
	}

	
	/**
	 * scroll事件处理函数,暂时只处理滚动到底部
	 * 滚动到底部的自定义事件名称 ： scrollBot
	 * @return {[type]} [description]
	 */

	function scrollEvent(e) {
		var ph = device.getPageHeight(),
			sh = device.getScrollHeight(),
			wh = device.getHeight();

		//滚动到底部，且有响应处理方法
		if((sh+wh)>=ph){
			exports.emit("scrollBot",e,$(e.target),arguments.callee.toString()); //广播消息
		}
	}

	/**
	 * 统一事件处理函数
	 * @param  {[string]} type [事件类型]
	 * @return {[type]} [事件处理方法]
	 */

	function eventFn(type) {
		return function(e) {
			eventBubble(e,e.target,type);
		}
	}

	/**
	 * 事件冒泡处理
	 * @param  {[object]} e    [事件对象]
	 * @param  {[dom]} t    [dom节点]
	 * @param  {[string]} type [事件类型]
	 * @return {[type]}      [description]
	 */
	function eventBubble(e,t,type){
		//冒泡到顶部，则停止
		if(t==document.body || t==g.dom[0]){
			return;
		}
		var _t = $(t),
			et = _t.attr("et") || "",
			pe = _t.attr(g.etAttr) || "";
		//PC客户端，将tap事件转为click事件 ,input改成keyup
		if(g.pc && (/tap:|input:/.test(et)||/tap:|input:/.test(pe))){
			et = et.replace(/tap:/g,"click:").replace(/input:/g,"keyup:");
			pe = pe.replace(/tap:/g,"click:").replace(/input:/g,"keyup:");
		}
		if(type && et.indexOf(type + ":") != -1){//有对应处理方法
			if(type=="tap"){
				//响应了tap事件，则取消对应坐标的click事件
				preventGhostClick(g.x,g.y);
			}			
			var reg = new RegExp(type + ":([^,]*)(?:,|$)");
			exports.emit((et.match(reg)[1]||""),e,_t,arguments.callee.toString());
			return;
		}else if(type && pe.indexOf(type + ":") != -1){
			if(type=="tap"){
				//响应了tap事件，则取消对应坐标的click事件
				preventGhostClick(g.x,g.y);
			}			
			var reg = new RegExp(type + ":([^,]*)(?:,|$)"),
				fnName = pe.match(reg)[1]||"";//自定义事件名称
			exports.emit(fnName.replace(/^_/,""),e,_t,arguments.callee.toString());
			if(fnName.indexOf("_")!=0){//非 _ 开头，则冒泡
				arguments.callee(e,t.parentNode,type);
			}
		}else{//此节点不需要处理，继续冒泡
			arguments.callee(e,t.parentNode,type);
		}
	}

	/**
	 * touch事件开始
	 * @param  {[eventElement]} e [事件对象]
	 * @return {[type]}   [description]
	 */

	function touchstartFn(e) {
		/*
		if (e.target.nodeType == 3) { //如果是文本节点
			g.startTarget = $(e.target).parent();
		} else {
			g.startTarget = $(e.target);
		}*/
		//记录点击的位置
		var st = e.changedTouches[0];
		g.x = st.clientX;
		g.y = st.clientY;
	}

	/**
	 * touchmove事件处理
	 * @param  {[eventElement]} e [事件对象]
	 * @return {[type]}   [description]
	 */
	function touchmoveFn(e){
		var st = e.changedTouches[0],
			diffY = Math.abs(g.y - st.clientY),
			diffX = Math.abs(g.x - st.clientX);
		if (diffY<= 70 && diffX>10 && diffX>diffY && $(e.target).attr("scrollx")!="1") {//横向滑动，且sliderx!=1(没有设定可以横向滑动)
			//阻止浏览器横向滑动的前进后退行为
			e.preventDefault();
            e.stopPropagation();
            return false;
		}
	}

	/**
	 * [touchend事件]
	 * @param  {[eventElement]} e [事件对象]
	 */

	function touchendFn(e) {
		var st = e.changedTouches[0];
		if ((Math.abs(g.y - st.clientY) > 5) || (Math.abs(g.x - st.clientX) > 5)) {
			return;
		}
		eventFn("tap")(e);//手指点击事件
	}

	/**
	 * 手机端，click事件处理
	 * 若touchend已经处理了，则click事件阻止触发
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	function mClickFn(e){
		for (var i=0,iLen=g.coordinates.length;i<iLen;i+=2) {
		    var x = g.coordinates[i],
		    	y = g.coordinates[i + 1];
		    if (Math.abs(e.clientX - x) < 25 && Math.abs(e.clientY - y) < 25) {
		    	//响应click的坐标与记录的坐标相差25px
		    	//阻止click事件响应
		      e.stopPropagation();
		      e.preventDefault();
		      return false;
		    }
		}

		//以下代码表示此坐标没有touchend处理，则响应click事件
		eventFn("click")(e);
	}

	/**
	 * 阻止默认click事件响应
	 * @param  {[int]} x [touchstar时的X坐标]
	 * @param  {[int]} y [touchstar时的Y坐标]
	 */
	function preventGhostClick(x,y){
		g.coordinates.push(x, y);
  		setTimeout(function(){
  			g.coordinates.splice(0, 2);//删除前面的坐标
  		}, 2500);
	}
});
