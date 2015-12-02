/**
 * Created by xjw919 on 15/10/28.
 */
var blc = require("broken-link-checker");

var html = '<a href="https://google.com">absolute link</a>';
html += '<a href="/path/to/resource.html">relative link</a>';
html += '<img src="http://fakeurl.com/image.png" alt="missing image"/>';

var options = {
    acceptedSchemes: ["http","https"],
    cacheExpiryTime: 3600000
};

var htmlChecker = new blc.HtmlChecker(options, {
    link: function(result) {
        console.log(result.html.index, result.broken, result.html.text, result.url.resolved, result.error);
        //-> 0 false "absolute link" "https://google.com/"
        //-> 1 false "relative link" "https://mywebsite.com/path/to/resource.html"
        //-> 2 true null "http://fakeurl.com/image.png"
        console.log(1);
    },
    complete: function() {
        console.log("done checking!");
    }
});

htmlChecker.scan(html, "https://mywebsite.com");