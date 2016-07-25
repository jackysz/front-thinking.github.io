//相关代码调试工具
define('monitor', function(require, exports, module) {
	module.exports = {
		/*
		 *	操作计时器
		 */
		timeMark: function(tag, type) {
			var t = "_timeMark";
			window[t] || (window[t] = {});
			if (type == "start") {
				window[t][tag] = {
					start: (new Date()).getTime(),
					end: 0,
					count: 0
				};
			} else if (type == "end") {
				if (!window[t][tag]) {
					return;
				}
				window[t][tag].end = (new Date()).getTime();
				window[t][tag].count = window[t][tag].end - window[t][tag].start;
			}
		},
		/*
		 *	计时结果 如果无此计时，返回null;
		 */
		getTimeMark: function(tag) {
			var t = "_timeMark";
			if (!window[t]) return null;
			var r = window[t][tag];
			return r ? r : null;
		}
	};
});