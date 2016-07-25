//设备相关调用
define('device',function(require,exports,module){
	module.exports = {
		/**
         * 返回屏幕宽度
         * @return {*}
         */
        getWidth:function() {
            return $(window).width();
        },
        /**
         * 返回屏幕高度
         * @return {*}
         */
        getHeight:function() {
            return $(window).height();
        },
        /**
         * 返回页面高度
         * @return {Number}
         */
        getPageHeight:function() {
            return $(document.body).height();
        },
        /**
         * 返回页面卷起的高度
         * @return {*}
         */
        getScrollHeight:function() {
            return document.body.scrollTop;
        },
        /**
         * 是否PC
         * @type {RegExp}
         */
        isPc:/(WindowsNT)|(Windows NT)|(Macintosh)/i.test(navigator.userAgent)
	};
});
