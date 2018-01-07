
const {app, BrowserWindow,Menu,shell} = require('electron')
let fs = require("fs")
const ipcMain = require('electron').ipcMain
const globalShortcut = require('electron').globalShortcut
const database = require(__dirname+'/js/database');
let mainWindow = null;
let input_window = null;
let viewWindow = null;

var db_path =__dirname+"/data/data.json";

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});


app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 1000, height: 800});
  menucreate();
  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  database.db_init(db_path);
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  ipcMain.on('open-view' ,(event ,arg) => {
    if(viewWindow){
      viewWindow.emit('close');
      viewWindow  = null;
    }
    viewWindow = new BrowserWindow({ width: 800, height: 600 })
    viewWindow.setTitle(arg);
    viewWindow.loadURL('file://' + __dirname + '/data/'+arg+'/'+arg+'.html');
    viewWindow.on('closed', function() {
    viewWindow = null;
  });
})
});

app.on('activate', () =>
{
  database.db_init(db_path);
  if (mainWindow === null) {
        mainWindow = new BrowserWindow({width: 1000, height: 800,resizable:false});
        mainWindow.loadURL('file://' + __dirname + '/index.html');
        mainWindow.on('closed', function() {
            mainWindow = null;
        });
    }
});



let template = [{
  label: '文件',
  submenu: [{
    label: '新建笔记',
    accelerator: 'CmdOrCtrl+N',
    click:function(){
      if(mainWindow){
        mainWindow.webContents.send('info_create');
      }
    }
  },{
    label: '新建标签',
    accelerator: 'CmdOrCtrl+Shift+N',
    click:function(){
      if(mainWindow){
        mainWindow.webContents.send('info_create_label');
      }
    }
  },{
    type: 'separator'
  },{
    label: '导入',
    accelerator: 'CmdOrCtrl+O',
    click:function(){
      if(mainWindow){
        mainWindow.webContents.send('info_open');
      }
    }
  },{
    label: '保存',
    accelerator: 'CmdOrCtrl+S',
    click:function(){
      if(mainWindow){
        mainWindow.webContents.send('info_save');
      }
    }
  },{
    label: '导出',
    accelerator: 'CmdOrCtrl+Shift+W',
    click:function(){
      if(mainWindow){
        mainWindow.webContents.send('info_out');
      }
    }
  },{
    type: 'separator'
  },{
    label: '删除笔记',
    accelerator: 'CmdOrCtrl+D',
    click:function(){
      if(mainWindow){
        mainWindow.webContents.send('info_remove');
      }
    }
  },{
    label: '删除标签',
    accelerator: 'CmdOrCtrl+Shift+D',
    click:function(){
      if(mainWindow){
        mainWindow.webContents.send('info_remove_label');
      }
    }
  }]
},{
  label: '编辑',
  submenu: [{
    label: '撤销',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: '重做',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: '插入',
    accelerator: 'CmdOrCtrl+I',
    click:function(){
      if(mainWindow){
        mainWindow.webContents.send('info_insert');
      }
    }
  }, {
    type: 'separator'
  }, {
    label: '剪切',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: '复制',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: '粘贴',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: '全选',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }]
}, {
  label: '展示',
  submenu: [{
    label: '生成',
    accelerator: 'CmdOrCtrl+P',
    click:function(){
      if(mainWindow){
        mainWindow.webContents.send('info_show');
      }
    }
  },{
    type: 'separator'
  },{
    label: '切换开发者工具',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I'
      } else {
        return 'Ctrl+Shift+I'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.toggleDevTools();
      }
    }
  }]
}, {
  label: '窗口',
  role: 'window',
  submenu: [{
    label: '最小化',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: '关闭',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }, {
    type: 'separator'
  }, {
    label: '刷新',
    accelerator: 'CmdOrCtrl+R',
    click: function (item,focusedWindow) {
      if(focusedWindow){
        focusedWindow.reload();
      }else{
        app.emit('activate');
      }
    }
  }]
}, {
  label: '帮助',
  role: 'help',
  submenu: [{
    label:'作者：Ertuil'
  },{
    label:'个人网站',
    click:function () {
      shell.openExternal('http://ertuil.top')
    }
  },{
    label:'github',
    click:function () {
      shell.openExternal('https://github.com/andytt')
    }
  },{
    label: '学习更多',
    click: function () {
      shell.openExternal('http://electron.atom.io')
    }
  }]
}]

function menucreate(){
  if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
      label: name,
      submenu: [{
        label: `关于 ${name}`,
        role: 'about'
      }, {
        type: 'separator'
      }, {
        label: '服务',
        role: 'services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: `隐藏 ${name}`,
        accelerator: 'Command+H',
        role: 'hide'
      }, {
        label: '隐藏其它',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      }, {
        label: '显示全部',
        role: 'unhide'
      }, {
        type: 'separator'
      }, {
        label: '退出',
        accelerator: 'Command+Q',
        click: function () {
          app.quit()
        }
      }]
    })
  }
}
