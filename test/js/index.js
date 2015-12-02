var blc = require("broken-link-checker");

var html = '<a href="https://google.com">absolute link</a>';
html += '<a href="/path/to/resource.html">relative link</a>';
html += '<img src="http://fakeurl.com/image.png" alt="missing image"/>';

var htmlChecker = new blc.HtmlChecker(null, {
    link: function(result) {
        console.log(result.html.index, result.broken, result.html.text, result.url.resolved);
        //-> 0 false "absolute link" "https://google.com/"
        //-> 1 false "relative link" "https://mywebsite.com/path/to/resource.html"
        //-> 2 true null "http://fakeurl.com/image.png"
    },
    complete: function() {
        console.log("done checking!");
    }
});

htmlChecker.scan(html, "https://mywebsite.com");
