//缓存控制模块
define('cache', function(require, exports, module) {
	module.exports = {
		/*
		 *	设置缓存 version,value,cacheTime
		 *	@param cacheTime 毫秒
		 */
		setStore: function(key, value, version, cacheTime) {
			try {
				if (!window.localStorage) {
					return this;
				}
			} catch (e) {
				return this;
			}
			var content = "";
			if (cacheTime) {
				var d = {};
				d.version = "localCachev1";
				d.dataVersion = version;
				d.cacheTime = ((new Date()).getTime() + (cacheTime ? parseInt(cacheTime, 10) : 0));
				d.content = value;
				content = JSON.stringify(d);
			} else {
				content = value;
			}
			try {
				localStorage.setItem(key, content);
			} catch (e) {
				return this;
			}
			return this;
		},
		/*
		 *	获取缓存
		 */
		getStore: function(key, version) {
			try {
				if (!window.localStorage) {
					return "";
				}
			} catch (e) {
				return "";
			}
			var content = localStorage.getItem(key);
			if (!content) {
				return "";
			}
			if (content.indexOf("localCachev1") >= 0) {
				var d = JSON.parse(content);
				//检查数据版本是否有效
				if (d.dataVersion != version) {
					return "";
				}
				//检查cache是否有效
				if (d.cacheTime >= (new Date()).getTime()) {
					return d.content;
				} else {
					this.removeStore(key);
					return "";
				}
			} else {
				return content;
			}
		},
		/*
		 *	删除缓存
		 */
		removeStore: function(key) {
			try {
				if (!window.localStorage) {
					return this;
				}
			} catch (e) {
				return this;
			}
			localStorage.removeItem(key);
			return this;
		},
		/**
		 * 设置页面离线缓存
		 */
		setManifest: function(fileName) {
			iframe = document.createElement("iframe");
			iframe.src = "/" + fileName ? fileName : "manifest.html";
			iframe.style.display = "none";
			setTimeout(function() {
				document.body.appendChild(iframe)
			}, 100);
			return this;
		}
	};
});