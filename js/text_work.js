
function text_counts(){
    var text = document.getElementById('raw_text').value;
    var row = text.split(/\n/).length;
    var char = text.length;
    var word = text.split(/[\n\t\s]/).length;
    var p1 = document.getElementById("text_count");
    p1.innerHTML = "统计："+"词数:"+word+"\t\t行数："+row+"\t\t字数："+char;
}

function info(value){
    var info = document.getElementById('text_info');
    switch(value){
        case 0:info.innerHTML = "";break;
        case 1:info.innerHTML = "新建一个新的笔记(ctrl+N)";break;
        case 2:info.innerHTML = "新建一个新的标签(ctrl+shift+N)";break;
        case 3:info.innerHTML = "删除选中的的笔记(ctrl+D)";break;
        case 4:info.innerHTML = "删除当前标签(ctrl+shift+D)";break;
        case 5:info.innerHTML = "更改当前笔记所属标签";break;
        case 6:info.innerHTML = "选择一个好看的样式";break;
        case 7:info.innerHTML = "插入文件、图片等(ctrl+I)";break;
        case 8:info.innerHTML = "保存当前笔记(ctrl+S)";break;
        case 9:info.innerHTML = "保存并展示当前笔记(ctrl+P)";break;
        case 10:info.innerHTML = "标签";break;
        case 11:info.innerHTML = "标签下的笔记";break;
        case 12:info.innerHTML = "在此输入题目";break;
        case 13:info.innerHTML = "导出为pdf";break;
    }
}