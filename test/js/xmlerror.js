/**
 * Created by xjw919 on 15/11/18.
 */

function loadXMLDoc() {
    var xmlhttp;

    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();


    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
            if(xmlhttp.status == 200){
                document.getElementById("myDiv").innerHTML = xmlhttp.responseText;
            }
        }
    }

    xmlhttp.open("GET", "ajax_info.txt", true);
    xmlhttp.send();
}

loadXMLDoc();