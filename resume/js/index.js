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

    //console messages
    console.log('总有一句话让你陷入沉思！');
    console.log('总有一幅画让你叹为观止！');
    console.log('总有一片风景让你流连忘返！');
    console.log('总有一个故事让你泪流满面！');
    console.log('寻找动人的故事，展示美丽的风景，献给每一个你！');
    console.log('我们不是美的创造者，我们只是美的搬运工！');
    console.log('%c联系: xjw919@qq.com, 与我一起搬运美！', 'color: red;');
});