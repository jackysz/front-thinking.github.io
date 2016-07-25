//模板渲染模块
define('tpl', function(require, exports, module) {
	/**
	 * 模板解析器txTpl:
	 * @author: wangfz
	 * @param {String}  模板id || 原始模板text
	 * @param {Object}  数据源json
	 * @param {String}  可选 要匹配的开始选择符 '<%' 、'[%' 、'<#' ..., 默认为'<%'
	 * @param {String}  可选 要匹配的结束选择符 '%>' 、'%]' 、'#>' ..., 默认为'%>'
	 * @param {Boolean} 可选 默认为true
	 * @return {String}
	 * 注意1: 输出"\"时, 要转义,用"\\"或者实体字符"&#92";
	 *　　　  输出"开始选择符"或"结束选择符"时, 至少其中一个字符要转成实体字符。
	 *　　　  html实体对照表：http://www.f2e.org/utils/html_entities.html
	 * 注意2: 模板拼接时用单引号。
	 * 注意3: 数据源尽量不要有太多的冗余数据。
	 */
	exports.tpl = (function() {
		var cache = {};
		return function(str, data, startSelector, endSelector, isCache) {
			var fn, d = data,
				valueArr = [],
				isCache = isCache != undefined ? isCache : true;
			if (isCache && cache[str]) {
				for (var i = 0, list = cache[str].propList, len = list.length; i < len; i++) {
					valueArr.push(d[list[i]]);
				}
				fn = cache[str].parsefn;
			} else {
				var propArr = [],
					formatTpl = (function(str, startSelector, endSelector) {
						if (!startSelector) {
							var startSelector = '<%';
						}
						if (!endSelector) {
							var endSelector = '%>';
						}
						var tpl = str.indexOf(startSelector) == -1 ? document.getElementById(str).innerHTML : str;
						return tpl.replace(/\\/g, "\\\\").replace(/[\r\t\n]/g, " ").split(startSelector).join("\t").replace(new RegExp("((^|" + endSelector + ")[^\t]*)'", "g"), "$1\r").replace(new RegExp("\t=(.*?)" + endSelector, "g"), "';\n s+=$1;\n s+='").split("\t").join("';\n").split(endSelector).join("\n s+='").split("\r").join("\\'");
					})(str, startSelector, endSelector);
				for (var p in d) {
					propArr.push(p);
					valueArr.push(d[p]);
				}
				fn = new Function(propArr, " var s='';\n s+='" + formatTpl + "';\n return s");
				isCache && (cache[str] = {
					parsefn: fn,
					propList: propArr
				});
			}

			try {
				return fn.apply(null, valueArr);
			} catch (e) {
				function globalEval(strScript) {
					var ua = navigator.userAgent.toLowerCase(),
						head = document.getElementsByTagName("head")[0],
						script = document.createElement("script");
					if (ua.indexOf('gecko') > -1 && ua.indexOf('khtml') == -1) {
						window['eval'].call(window, fnStr);
						return
					}
					script.innerHTML = strScript;
					head.appendChild(script);
					head.removeChild(script);
				}

				var fnName = 'txTpl' + new Date().getTime(),
					fnStr = 'var ' + fnName + '=' + fn.toString();
				globalEval(fnStr);
				window[fnName].apply(null, valueArr);
			}
		}
	})();
		/** doT模版引擎 调用方法：frame.template(html,data),返回内容为HTML字符串
	 * 虽然引擎使用了较多eval函数，但针对彩票简单的模版解释在手机端一般只需要1-2毫秒
	 * doT.js
	 * 2011, Laura Doktorova, https://github.com/olado/doT
	 * doT.js is an open source component of http://bebedo.com
	 * Licensed under the MIT license.
	 */
	"use strict";
	var doT = {
		version: '0.2.0',
		templateSettings: {
			evaluate:    /\{\{([\s\S]+?)\}\}/g,
			interpolate: /\{\{=([\s\S]+?)\}\}/g,
			encode:      /\{\{!([\s\S]+?)\}\}/g,
			use:         /\{\{#([\s\S]+?)\}\}/g,
			define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
			conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
			iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
			varname: 'it',
			strip: true,
			append: true,
			selfcontained: false
		},
		template: undefined, //fn, compile template
		compile:  undefined  //fn, for express
	};
	var global = {};

	function encodeHTMLSource() {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },
			matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : code;
		};
	}

	var startend = {
		append: { start: "'+(",      end: ")+'",      startencode: "'+encodeHTML(" },
		split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML("}
	}, skip = /$^/;

	function resolveDefs(c, block, def) {
		return ((typeof block === 'string') ? block : block.toString())
		.replace(c.define || skip, function(m, code, assign, value) {
			if (code.indexOf('def.') === 0) {
				code = code.substring(4);
			}
			if (!(code in def)) {
				if (assign === ':') {
					def[code]= value;
				} else {
					eval("def['"+code+"']=" + value);
				}
			}
			return '';
		})
		.replace(c.use || skip, function(m, code) {
			var v = eval(code);
			return v ? resolveDefs(c, v, def) : v;
		});
	}

	function unescape(code) {
		return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, ' ');
	}

	doT.template = function(tmpl, c, def) {
		c = c || doT.templateSettings;
		var cse = c.append ? startend.append : startend.split, str, needhtmlencode, sid=0, indv;

		if (c.use || c.define) {
			var olddef = global.def; global.def = def || {}; // workaround minifiers
			str = resolveDefs(c, tmpl, global.def);
			global.def = olddef;
		} else str = tmpl;

		str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g,' ')
					.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,''): str)
			.replace(/'|\\/g, '\\$&')
			.replace(c.interpolate || skip, function(m, code) {
				return cse.start + unescape(code) + cse.end;
			})
			.replace(c.encode || skip, function(m, code) {
				needhtmlencode = true;
				return cse.startencode + unescape(code) + cse.end;
			})
			.replace(c.conditional || skip, function(m, elsecase, code) {
				return elsecase ?
					(code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
					(code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
			})
			.replace(c.iterate || skip, function(m, iterate, vname, iname) {
				if (!iterate) return "';} } out+='";
				sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
				return "';var arr"+sid+"="+iterate+";if(arr"+sid+"){var "+vname+","+indv+"=-1,l"+sid+"=arr"+sid+".length-1;while("+indv+"<l"+sid+"){"
					+vname+"=arr"+sid+"["+indv+"+=1];out+='";
			})
			.replace(c.evaluate || skip, function(m, code) {
				return "';" + unescape(code) + "out+='";
			})
			+ "';return out;")
			.replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r')
			.replace(/(\s|;|}|^|{)out\+='';/g, '$1').replace(/\+''/g, '')
			.replace(/(\s|;|}|^|{)out\+=''\+/g,'$1out+=');

		if (needhtmlencode && c.selfcontained) {
			str = "var encodeHTML=(" + encodeHTMLSource.toString() + "());" + str;
		}
		try {
			return new Function(c.varname, str);
		} catch (e) {
			if (typeof console !== 'undefined') console.log("Could not create a template function: " + str);
			throw e;
		}
	};

	doT.compile = function(tmpl, def) {
		return doT.template(tmpl, null, def);
	};

	exports.compile = doT.compile;

	/*
	*	模版调用
	*/
	exports.template = function(html,data){
		return doT.template(html)(data);
	};

});