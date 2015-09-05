/*
 * @author: front-thinking
 * @date: 2015-09-05
 * @mail: xjw919@qq.com
*/
$(document).ready(function() {
    $('#fullpage').fullpage({
        sectionsColor: ['#1bbc9b', '#4BBFC3', '#4ab4e8', '#1bbc9b', '#4BBFC3', '#4ab4e8'],
        anchors: ['firstPage', 'secondPage', '3rdPage', '4thpage', '5thPage', 'lastPage'],
        menu: false,
        scrollingSpeed: 1000,
        navigation: true,
        navigationPosition: 'left',
        'tooltips': ['Home', 'enducation', 'project', 'intern', 'qualification', 'contact'],
        slidesNavigation: true,
        slidesNavPosition: 'bottom',


        css3: true,
        loopBottom: true,
        loopHorizontal: true

    });
});