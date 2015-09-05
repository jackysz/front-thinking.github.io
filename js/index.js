/*
 * @author: front-thinking
 * @date: 2015-09-05
 * @mail: xjw919@qq.com
*/
$(document).ready(function() {
    $('#fullpage').fullpage({
        sectionsColor: ['#4285f4', '#ea4335', '#fbbc05', '#4285f4', '#34a853', '#ea4335'],
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