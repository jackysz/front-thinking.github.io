/**
 * Created by Administrator on 2015/11/30.
 */
var linkNodes = Array.prototype.slice.call(document.querySelectorAll("a"));
//���˵������ԡ�ê���յ�����
var valideLinkNodes = linkNodes.filter(function(ele){
    return !/^[#|javascript:]/.test(ele.getAttribute("href")) &&  /^[http|https]/.test(ele.href) && '' !== ele.getAttribute('href');
});
//�����������鲢ȥ��
var linkArray = valideLinkNodes.map(function(ele){return ele.href});
var linkArray2 = [];
(function unique(arr, newArr) {
    var num;

    if (-1 == arr.indexOf(num = arr.shift())) newArr.push(num);

    arr.length && unique(arr, newArr);
})(linkArray, linkArray2);
console.log(linkArray2);