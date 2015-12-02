/**
 * Created by xjw919 on 15/11/4.
 */
Function.prototype.extend = function(fn) {
    var self = this;
    return function(){
        self.apply(this, arguments);
        fn.apply(this, arguments);
    };
};


window.onload = window.onload.extend(function() {
    console.log(2);
});