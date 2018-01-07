
var myInput = document.getElementById("raw_text");  
str = "    ";  
if(myInput.addEventListener ) {  
    myInput.addEventListener('keydown',this.keyHandler,false);  
} else if(myInput.attachEvent ) {  
    myInput.attachEvent('onkeydown',this.keyHandler); /* damn IE hack */  
}  
  
function keyHandler(e) {  
    var TABKEY = 9;  
    if(e.keyCode == TABKEY) {  
        insertText(myInput,str);  
        if(e.preventDefault) {  
            e.preventDefault();  
        }  
    }  
}  
function insertText(obj,str) {  
    if (document.selection) {  
        var sel = document.selection.createRange();  
        sel.text = str;  
    } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {  
        var startPos = obj.selectionStart,  
            endPos = obj.selectionEnd,  
            cursorPos = startPos,  
            tmpStr = obj.value;  
        obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);  
        cursorPos += str.length;  
        obj.selectionStart = obj.selectionEnd = cursorPos;  
    } else {  
        obj.value += str;  
    }  
}  