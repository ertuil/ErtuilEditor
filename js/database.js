var low = require('lowdb');
var fs = require('fs');
var path = require('path')
const FileSync = require('lowdb/adapters/FileSync')

function db_init(db_path){
    if(! fs.existsSync(db_path)){
        fs.createWriteStream(db_path);
        const adapter = new FileSync(db_path);
        var db = low(adapter);
        db.defaults({ label:[],notes:[],info:{} }).write();
        db.get('label').push({id: 1,label_name :'default'}).write();
        db.set('info.note_num',0).write();
        db.set('info.label_num',1).write();
    }
}


function db_insert_note(db_path,name,label){
    const adapter = new FileSync(db_path);
    var db = low(adapter);
    if(db.get('notes').find({ note_name: name }).size().value() >=1 ){
        db.get('notes').find({ note_name: name }).assign({label_name : label}).write();   
    }else{
        var id = db.get('info.note_num').value() + 1;
        db.get('notes').push({id: id,note_name : name ,label_name : label}).write();
        db.set('info.note_num',id).write();
    }
}

function db_insert_label(db_path,label){
    const adapter = new FileSync(db_path);
    var db = low(adapter);
    if(db.get('label').filter({label_name : label}).size().value() > 0){
        return;
    }else{
        var id = db.get('info.label_num').value() + 1;
        db.get('label').push({id: id,label_name :label}).write();
        db.set('info.label_num',id).write();
    }
}

function db_get_labels(db_path){
    const adapter = new FileSync(db_path);
    var db = low(adapter);
    return db.get('label').value();
}

function db_get_notes_by_label(db_path,label_name){
    const adapter = new FileSync(db_path);
    var db = low(adapter);
    return db.get('notes').filter({label_name:label_name}).value();
}

function db_get_note_by_name(db_path,name){
    const adapter = new FileSync(db_path);
    var db = low(adapter);
    return db.get('notes').filter({note_name:name}).value();
}

function db_get_id_by_name(db_path,name){
    const adapter = new FileSync(db_path);
    var db = low(adapter);
    return db.get('label').find({label_name:name}).value().id;
}

function db_change_node_name(db_path,old_name,new_name){
    const adapter = new FileSync(db_path);
    var db = low(adapter);
    db.get('notes').find({note_name:old_name}).assign({note_name:new_name}).write();
}

function db_remove_node(db_path,old_name){
    const adapter = new FileSync(db_path);
    var db = low(adapter);
    db.get('notes').remove({note_name:old_name}).write();
}

function db_change_label(db_path,name,label){
    const adapter = new FileSync(db_path);
    var db = low(adapter);
    db.get('notes').find({note_name:name}).assign({label_name : label}).write();
}

function db_remove_label(db_path,label){
    const adapter = new FileSync(db_path);
    var db = low(adapter);
    if(db_get_notes_by_label(db_path,label).length > 0){
        return -1;
    }else if(label == 'default'){
        return -2;
    }else{
        db.get('label').remove({label_name:label}).write();
        return 0;
    }
}

function db_get_node_number(db_path){
    const adapter = new FileSync(db_path);
    var db = low(adapter);
    return db_get_note_by_name.get('info.label_num').value();
}


exports.db_get_node_number = db_get_node_number;
exports.db_change_label = db_change_label;
exports.db_init = db_init;
exports.db_insert_note = db_insert_note;
exports.db_get_labels = db_get_labels;
exports.db_get_notes_by_label = db_get_notes_by_label;
exports.db_get_note_by_name = db_get_note_by_name;
exports.db_get_id_by_name = db_get_id_by_name;
exports.db_change_node_name = db_change_node_name;
exports.db_remove_node = db_remove_node;
exports.db_insert_label = db_insert_label;
exports.db_remove_label = db_remove_label;