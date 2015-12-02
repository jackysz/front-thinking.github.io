/**
 * Created by xjw919 on 15/11/6.
 */

window.addEventListener("error", function (e){
    console.log(2);
    console.log(e);
}, true);
window.onerror = function (msg, line, column, url, error){
    console.log(1);
};
(function(XHR) {
    "use strict";

    var open = XHR.prototype.open;
    var send = XHR.prototype.send;

    XHR.prototype.open = function(method, url, async, user, pass) {
        this._url = url;
        open.call(this, method, url, async, user, pass);
    };

    XHR.prototype.send = function(data) {
        var self = this;
        var oldOnReadyStateChange;
        var url = this._url;

        function onReadyStateChange() {
            if(self.readyState == 4 /* complete */) {
                /* This is where you can put code that you want to execute post-complete*/
                /* URL is kept in this._url */

                if(self.status == 404){
                    var msg = self.statusText;
                    var requrl = self._url;
                    reportException(2, );
                }
                console.log(self);
            }

            if(oldOnReadyStateChange) {
                oldOnReadyStateChange();
            }
        }

        if(!this.noIntercept) {
            if(this.addEventListener) {
                this.addEventListener("readystatechange", onReadyStateChange, false);
            } else {
                oldOnReadyStateChange = this.onreadystatechange;
                this.onreadystatechange = onReadyStateChange;
            }
        }

        send.call(this, data);
    }
})(XMLHttpRequest);