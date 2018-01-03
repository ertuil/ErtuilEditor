
var fs = require('fs');
var path = require('path');
var database = require(__dirname+'/js/database');
var buildMarkdown = require(__dirname+'/js/buildMarkdown')
var phantom = require('phantom');
var ipcRenderer = require('electron').ipcRenderer;
const {dialog} = require('electron').remote;
const BrowserWindow = require('electron').remote.BrowserWindow;
var schedule = require("node-schedule");  

var db_path = __dirname+"/data/data.json";

var curr_label = '';
var curr_note = '';


ipcRenderer.on('info_create',function(){
    create_new();
});
ipcRenderer.on('info_create_label',function(){
    new_label()});
ipcRenderer.on('info_insert',function(){
    import_file()});
ipcRenderer.on('info_remove',function(){delete_note()});
ipcRenderer.on('info_remove_label',function(){delete_label()});
ipcRenderer.on('info_show',function(){build_mk()});
ipcRenderer.on('info_save',function(){save_note()});
ipcRenderer.on('info_out',function(){make_pdf()});

function removeAllChild(node_id)  
{  
    var div = document.getElementById(node_id);  
    while(div.hasChildNodes()) //当div下还存在子节点时 循环继续  
    {  
        div.removeChild(div.firstChild);  
    }  
}  


function removeDir(path){
    var files = [];  
    if(fs.existsSync(path)) {  
        files = fs.readdirSync(path);  
        files.forEach(function(file, index) {  
            var curPath = path + "/" + file;  
            if(fs.statSync(curPath).isDirectory()) { // recurse  
                removeDir(curPath);  
            } else { // delete file  
                fs.unlinkSync(curPath);  
            }  
        });  
        fs.rmdirSync(path);  
    }  
};

function isFile(path){  
    return fs.existsSync(path) && fs.statSync(path).isFile();  
}  

function isDir(path){  
    return fs.existsSync(path) && fs.statSync(path).isDirectory();  
}  

function createDirs(sel_id,node_id = ''){
    removeAllChild("labels");
    removeAllChild("notes");
    var flag = false;
    var labels = database.db_get_labels(db_path);
    var label_div = document.createElement("div");
    var sel_label = '';
    label_div.classList.add("list-group");
    for( idx in labels){
        var button = document.createElement('a');
        button.classList.add('list-group-item');
        if(labels[idx].id == sel_id){
            button.classList.add('active');
            sel_label = labels[idx].label_name;
            curr_label = labels[idx].label_name;
        }
        button.innerHTML = labels[idx].label_name;
        button.setAttribute("onclick", "createDirs("+labels[idx].id+")");
        label_div.appendChild(button);
    }

    document.getElementById('labels').appendChild(label_div);

    var notes = database.db_get_notes_by_label(db_path,sel_label);

    var ul = document.createElement('ul');
    ul.className = "list-unstyled";
    var ul_title = document.createElement('li');
    ul_title.innerHTML = "<h3><span class=\"glyphicon glyphicon-bookmark\"></span>\t"+sel_label+"</h3>";
    ul.appendChild(ul_title);
    for(idx in notes){
        var li = document.createElement('li');
        var h3 = document.createElement('button');
        h3.setAttribute("style","width:100%;text-align: center;")
        h3.classList.add('btn');
        h3.classList.add('btn-default')
        h3.innerHTML = "&nbsp;&nbsp;&nbsp;"+notes[idx].note_name;
        if(notes[idx].note_name == node_id){
            curr_note = notes[idx].note_name;
            h3.classList.add('btn-success');
            flag = true;
        }else{

            h3.classList.add('btn-default');
        }
        h3.setAttribute("onclick","load_file('"+notes[idx].note_name+"')");
        li.appendChild(h3);
        ul.appendChild(li);
    }
    if(flag == false){
        document.getElementById("raw_title").value = '';
        document.getElementById("raw_text").value = '';
        curr_note = '';
    }
    document.getElementById('notes').appendChild(ul);
}

function load_file(note_name){
    if(save_note() == 1){
        return;
    }
    var note_info = database.db_get_note_by_name(db_path,note_name);
    if(note_info.length == 0){
        dialog.showErrorBox('错误', '没有该文件！');
    }else{
        var title_div = document.getElementById("raw_title");
        var content_div = document.getElementById("raw_text");
        if(note_name == 'new note'){
            title_div.value = '';
            content_div.value = '';
        }else{
            title_div.value = note_name;
            content_div.value = fs.readFileSync(__dirname+"/data/"+note_name+"/"+note_name+".md",'utf-8');
        }
        curr_label = note_info[0].label_name;
        curr_note = note_name;
        createDirs(database.db_get_id_by_name(db_path,note_info[0].label_name),note_name);
        create_menu();
    }
}

function create_new(){
    var title_div = document.getElementById("raw_title");
    title_div.value = '';
    var content_div = document.getElementById("raw_text");
    content_div.value = '';
    curr_note = 'new note';
    database.db_insert_note(db_path,curr_note,curr_label);
    createDirs(database.db_get_id_by_name(db_path,curr_label),curr_note);
}

function save_note(){
    var title = document.getElementById("raw_title").value;
    if(title != curr_note && database.db_get_note_by_name(db_path,title).length > 0){
        dialog.showErrorBox("文件名重复","请重新命名！");
        document.getElementById("raw_title").value = curr_note;
        return 1;
    }
    if(!title||title == ''){
        dialog.showErrorBox('无法保存！','未指定文件名。');
        return 2;
    }
    if(curr_note != title){
        if(curr_note == ''){
            database.db_insert_note(db_path,title,curr_label);
        }else{
            database.db_change_node_name(db_path,curr_note,title);
            if(fs.existsSync(__dirname+"/data/"+curr_note)){
                removeDir(__dirname+"/data/"+curr_note)
            }
        }
    }
    buildMarkdown.file_save(__dirname);
    curr_note = title;
    createDirs(database.db_get_id_by_name(db_path,curr_label),title);
    return 3;
}

function build_mk(){
    var title = document.getElementById("raw_title").value;
    if( title != curr_note && database.db_get_note_by_name(db_path,title).length > 0){
        dialog.showErrorBox("文件名重复","请重新命名！");
        document.getElementById("raw_title").value = curr_note;
        return ;
    }
    if(!title||title == ''){
        dialog.showErrorBox('无法保存！','未指定文件名。');
        return;
    }
    if(curr_note != title){
        if(curr_note == ''){
            database.db_insert_note(db_path,title,curr_label);
        }else{
            database.db_change_node_name(db_path,curr_note,title);
            if(fs.existsSync(__dirname+"/data/"+curr_note)){
                removeDir(__dirname+"/data/"+curr_note)
            }
        }
    }
    var styles = document.getElementById("styles").value;
    buildMarkdown.convert_mk(__dirname,styles);
    curr_note = title;
    createDirs(database.db_get_id_by_name(db_path,curr_label),title);
}

function new_label(){
    var text_area = document.createElement("div");
    text_area.classList.add('input-group');
    text_area.classList.add('form-group');
    var input = document.createElement('input');
    input.className='form-control';
    input.id = "input_id"
    input.type = 'text';
    input.setAttribute("onkeydown","onkeydowns()")
    var span = document.createElement('span');
    span.className = "input-group-btn";
    var button = document.createElement('button');
    button.classList.add('btn');
    button.classList.add('btn-primary');
    button.setAttribute("onclick","load_new_label()");
    button.innerHTML = "确定";
    span.appendChild(button);
    text_area.appendChild(input);
    text_area.appendChild(span);
    document.getElementById('labels').appendChild(text_area);
    input.focus();
}

function load_new_label(){
    var label = document.getElementById("input_id").value;
    if(!label ||label == ''){
        return ;
    }
    database.db_insert_label(db_path,label);
    curr_label = label;
    createDirs(database.db_get_id_by_name(db_path,curr_label));
}

function onkeydowns(){
    if(event.keyCode ==13){
        load_new_label();
    }
}

function create_menu(){
    removeAllChild("selector");
    var labels = database.db_get_labels(db_path);
    var sel = document.getElementById('selector');
    sel.setAttribute("onchange","listen_selecter()");
    for(idx in labels){
        var opt = document.createElement('option');
        opt.innerHTML = labels[idx].label_name;
        if(labels[idx].label_name == curr_label){
            opt.selected = true;
        }else{
            opt.selected = false;
        }
        sel.appendChild(opt);
    }
}

function listen_selecter(){
    var label = document.getElementById('selector').value;
    if(label != curr_label){
        curr_label = label;
        database.db_change_label(db_path,curr_note,curr_label);
        createDirs(database.db_get_id_by_name(db_path,curr_label),curr_note);
    }
    
}

function delete_note(){
    database.db_remove_node(db_path,curr_note);
    if(curr_note == ''){
        dialog.showErrorBox('无法删除！','当前未选中文件！')
    }
    if( curr_note != '' && fs.existsSync(__dirname+"/data/"+curr_note)){
        removeDir(__dirname+"/data/"+curr_note)
    }
    curr_note = '';
    var label_id = database.db_get_id_by_name(db_path,curr_label);
    var note = database.db_get_notes_by_label(db_path,curr_label)[0];
    if(note) {
        createDirs(label_id,database.db_get_notes_by_label(db_path,curr_label)[0].note_name);
    }else{
        createDirs(label_id);
    }
}

function delete_label(){
    console.log(curr_label);
    var ans = database.db_remove_label(db_path,curr_label);
    if(ans == 0){
        curr_label = 'default';
    }else if(ans == -1){
        dialog.showErrorBox('不能删除！', '该标签非空.');
    }else{
        dialog.showErrorBox('一条错误信息', '默认标签不能删除');
    }
    createDirs(1);
    create_menu();
}

function import_file(){
    save_note();
    dialog.showOpenDialog({
        properties: ['openFile']
      }, function (files) {
        if (files){
            var dir_name = path.dirname(files[0]);
            var base_name = path.basename(files[0]);
            var desp = path.join(__dirname+'/data/'+curr_note+'/',base_name);
            var readStream = fs.createReadStream(files[0]);
            var writeStream = fs.createWriteStream(desp);
            readStream.pipe(writeStream);
            insertAtCursor(document.getElementById('raw_text'),"[]("+__dirname+'/data/'+curr_note+'/'+base_name+")")
        }
    })
}
function insertAtCursor(myField, myValue){
    if (document.selection){
        myField.focus();
        sel            = document.selection.createRange();
        sel.text    = myValue;
        sel.select();
    }else if (myField.selectionStart || myField.selectionStart == '0'){
        var startPos    = myField.selectionStart;
        var endPos        = myField.selectionEnd;
        var restoreTop    = myField.scrollTop;
        myField.value    = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
        if (restoreTop > 0){
            myField.scrollTop = restoreTop;
        }
        myField.focus();
        myField.selectionStart    = startPos + myValue.length;
        myField.selectionEnd    = startPos + myValue.length;
    } else {
        myField.value += myValue;
        myField.focus();
    }
}


function auto_save(){
    if(document.activeElement.id=="raw_title"){
        return ;
    }
    var info = document.getElementById('text_info');
    info.innerHTML = "自动保存!";
    var title = document.getElementById("raw_title").value;
    if(title != curr_note && database.db_get_note_by_name(db_path,title).length > 0){
        dialog.showErrorBox("文件名重复","请重新命名！");
        document.getElementById("raw_title").value = curr_note;
        return ;
    }
    if(!title||title == ''){
        setTimeout(function() {
            info.innerHTML = "";
        }, 1000);
        return;
    }
    if(curr_note != title){
        if(curr_note == ''){
            database.db_insert_note(db_path,title,curr_label);
        }else{
            database.db_change_node_name(db_path,curr_note,title);
            if(fs.existsSync(__dirname+"/data/"+curr_note)){
                removeDir(__dirname+"/data/"+curr_note)
            }
        }
    }
    buildMarkdown.file_save(__dirname);
    curr_note = title;
    createDirs(database.db_get_id_by_name(db_path,curr_label),title);
    setTimeout(function() {
        info.innerHTML = "";
    }, 1000);
}

function make_pdf(){
    var title = document.getElementById("raw_title").value;

    if(!title||title == ''){
        dialog.showErrorBox('无法保存！','未指定文件名。');
        return;
    }
    
    var readStream = fs.createReadStream(__dirname+'/data/'+curr_note+'/'+curr_note+'.html');
    var writeStream = fs.createWriteStream(__dirname+'/data/output.html');
    readStream.pipe(writeStream);

    var info = document.getElementById('text_info');
    info.innerHTML = "正在导出";
    build_mk();
    const options = {
        title: '导出',
        filters: [
          { name: 'PDF', extensions: ['pdf'] }
        ]
      }
      dialog.showSaveDialog(options, function (filename) {
        phantom.create().then(function(ph) {
            ph.createPage().then(function(page) {
             page.open("file://"+__dirname+'/data/output.html').then(function(status) {
              page.property('viewportSize',{width: 800, height: 600});
              page.render(filename).then(function(){
                info.innerHTML = "";
               ph.exit();
              });
             });
            });
        });
    });

}



var rule     = new schedule.RecurrenceRule();  
var times    = [1,21,31,41,51];  
rule.second  = times;  
schedule.scheduleJob(rule, function(){  
    auto_save();
});  