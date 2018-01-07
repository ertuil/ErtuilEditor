
var fs = require('fs');
var path = require('path');

function removeAllChild(node_id)  
{  
    var div = document.getElementById(node_id);  
    while(div.hasChildNodes()) //当div下还存在子节点时 循环继续  
    {  
        div.removeChild(div.firstChild);  
    }  
}  

function isFile(path){  
    return fs.existsSync(path) && fs.statSync(path).isFile();  
}  

function isDir(path){  
    return fs.existsSync(path) && fs.statSync(path).isDirectory();  
}  

function createDirs(){
    removeAllChild("note_filter");
    var panels =document.createElement("div");
    panels.classList.add("panel-group")
    panels.id = "accordion";
    files = fs.readdirSync(__dirname+"/data/");
    for(idx1 in files){
        var file = files[idx1];
        if(isDir(__dirname+"/data/"+file)){
            var panel = document.createElement("div");
            panel.classList.add("panel");
            panel.classList.add("panel-default");
            var panel_title = document.createElement("div");
            panel_title.classList.add("panel-heading");
            var h_title = document.createElement("h4");
            // h_title.className = "panel-title";
            h_title.innerHTML = file;
            var a = document.createElement("a");
            a.classList.add('panel-title');
            a.setAttribute("data-toggle", "collapse");
            a.setAttribute("data-parent", "#accordion");
            // a.setAttribute("href", "#collapse"+idx1);
            a.setAttribute("onclick", "toggs"+idx1+"()");
            // a.innerHTML = file;
            a.appendChild(h_title);
            panel_title.appendChild(a);
            panel.appendChild(panel_title);
            var script = document.createElement("script");
            script.innerHTML = "\
            function toggs"+idx1+"(){\n\r\
                var elem = document.getElementById('collapse"+idx1+"')\n\r\
                elem.collapse('toggle')\n\r\
            }\
            "
            panel.appendChild(script);
            var items = document.createElement("div");
            items.id = "collapse"+idx1;
            items.classList.add("panel-collapse");
            items.classList.add("collapse");
            items.classList.add("in");
            var item = document.createElement("div");
            item.className = "panel-body"

            arcs = fs.readdirSync(__dirname+"/data/"+file+'/');
            for(idx2 in arcs){
                var arc = arcs[idx2];
                if(isDir(__dirname+"/data/"+file+'/'+arc)){
                    var a_items = document.createElement("a");
                    a_items.setAttribute('onclick','open_file('+file+','+arc+')');
                    a_items.innerHTML=arc;
                    item.appendChild(a_items);
                    item.appendChild(document.createElement('br'));
                }
            }

            items.appendChild(item);
            panel.appendChild(items);
            panels.appendChild(panel);
        }
    }
    var labels = document.getElementById("note_filter");
    labels.appendChild(panels);
}
