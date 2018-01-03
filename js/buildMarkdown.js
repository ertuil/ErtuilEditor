var ipcRenderer = require('electron').ipcRenderer;
var fs = require('fs');
var path = require('path');
const BrowserWindow = require('electron').remote.BrowserWindow;
var marked = require('marked')

function file_save(path){
    var title = document.getElementById('raw_title').value;
    var content = document.getElementById('raw_text').value;
    if(title == ''){
        return;
    }
    // database.db_insert_note(db_path,title,'default');
    file_path = path+"/data/"+title+'/';
    createFolder(file_path+title+".md");
    fs.writeFileSync(file_path+title+".md", content);
}

function convert_mk(path,value = "css1.css"){
    var preword = "<!DOCTYPE html>\n\r \
<html>\n\r \
<head><meta charset=\"utf-8\"/><meta name=\"Application Author\" content=\"Ertuil\" /> \n\r\
<script type=\"text/x-mathjax-config\"> MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\\\(','\\\\)']]}});</script><script type=\"text/javascript\" src=\"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML\"></script> \n\r\
<link href=\""+path+"/css/vs.css\" rel=\"stylesheet\"> \n\r\
<link href=\""+path+"/css/"+value+"\" rel=\"stylesheet\"> \n\r\
<script src=\""+path+"/js/highlight.pack.js\"></script> \n\r\
<script>hljs.initHighlightingOnLoad();</script>\n\r\
</head>\n\r<body>\n\r"

var lastword = "</div></body></html>\n\r";
    var title = document.getElementById('raw_title').value;
    var content = document.getElementById('raw_text').value;
    if(title == ''){
        return;
    }
    // database.db_insert_note(db_path,title,'default');
    file_path = path+"/data/"+title+'/';
    createFolder(file_path+title+".md");
    fs.writeFileSync(file_path+title+".md", content);
    var rendererMD = new marked.Renderer();
    marked.setOptions({
        renderer: rendererMD,
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
    });
    fs.readFile(file_path+title+'.md', 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        data = preword + marked(data) + lastword;
        fs.writeFile(file_path+title+'.html', data, function(err) {
            if(err){
                console.log("convert failed.");
            }
        });
        ipcRenderer.send('open-view',title);
    });
};



var createFolder = function(to) {
    var sep = path.sep
    var folders = path.dirname(to).split(sep);
    var p = '';
    while (folders.length) {
        p += folders.shift() + sep;
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p);
        }
    }
};

exports.file_save = file_save;
exports.convert_mk = convert_mk;