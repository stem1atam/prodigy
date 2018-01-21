import { Template } from 'meteor/templating';

import { MQTTcollection } from '../api/MQTTcollection.js';


import './bootstrap.min.css';
import './demo.css';
import './material-dashboard.css';
import './appi-icons.css';
import './font-awesome.min.css';
import './materialdesignicons.min.css';

import './mqttmessage3.js';
import './body.html';

import './js/bootstrap.min.js';
import './js/material.min.js';
import './js/chartist.min.js';
import './js/arrive.min.js';
import './js/perfect-scrollbar.jquery.min.js';
import './js/bootstrap-notify.js';
import './js/material-dashboard.js';
import './js/demo.js';


Handlebars.registerHelper('Actuator', function(lvalue,options) {
    if (arguments.length < 1)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if( lvalue!="relay" ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

Template.body.helpers({

  mqttmessages2() {
    //var localcollection = MQTTcollection.find( {topic : {$regex: /^((?!.*\$.*).)/ }}, { sort: { topic: 1 } });
    var localcollection = MQTTcollection.find({}, { sort: { topic: 1 } });
    console.log(localcollection);
    var arr = {};
    var arr2= [];
    var index = [];
    var setRootTopic="devices";
    localcollection.forEach(function(item){
        var atopic = item.topic.split("/");
        var rootTopic = atopic[0];
        if (rootTopic==setRootTopic){
              var devicename = atopic[1];
              var variablename = atopic[2];
              var variableprop = atopic[3];
              var stats = false;
              arr[devicename] = arr[devicename] || [];
              arr[devicename]["name"] = arr[devicename]["name"] || devicename;
              arr[devicename]["variables"] = arr[devicename]["variables"] || [];
              if(variablename.startsWith("\$stats")){
                var variablename = atopic[3];
                var variableprop = "value";
                var stats = true;

              } else if(variablename.startsWith("\$online")){
                    var onlinex = false;
                    if(item.message==false || item.message=="false" ) {
                        onlinex = false;
                    } else {
                        onlinex = true;
                    }
                    arr[devicename]["online"] = arr[devicename]["online"] || onlinex;
              }

              if(!variablename.startsWith("\$")){
                arr[devicename]["variables"][variablename] = arr[devicename]["variables"][variablename] || [];
                arr[devicename]["variables"][variablename]["name"] = arr[devicename]["variables"][variablename]["name"] || variablename;
                arr[devicename]["variables"][variablename]["stats"] = arr[devicename]["variables"][variablename]["stats"] || stats;
                if(variableprop=="unit"){
                  arr[devicename]["variables"][variablename]["unit"]=arr[devicename]["variables"][variablename]["unit"] || item.message;
                }else if(variableprop=="value"){
                  arr[devicename]["variables"][variablename]["value"]=arr[devicename]["variables"][variablename]["value"] || item.message;
                } else if(variableprop=="\$type"){
                  var typex =item.message;
                  if (item.message=="relay") {
                        arr[devicename]["variables"][variablename]["actuator"]=arr[devicename]["variables"][variablename]["actuator"] || true;
                        arr[devicename]["variables"][variablename]["topic"]=arr[devicename]["variables"][variablename]["topic"] || setRootTopic+"/"+devicename+"/"+variablename+"/"+"state"+"/"+"set";
                  } else arr[devicename]["variables"][variablename]["actuator"]=arr[devicename]["variables"][variablename]["actuator"] || false;

                  if(item.message=="temperature") typex = "mdi mdi-thermometer";
                  if(item.message=="relay") typex = "mdi mdi-power";
                  if(item.message=="humidity") typex = "mdi mdi-water-percent";
                  arr[devicename]["variables"][variablename]["type"]=arr[devicename]["variables"][variablename]["type"] || typex;
                }
              }
        }
    });
    var indux1=0;
    var indux2=0;
    var auxarr=[];
    for(var indux in arr){
      var auxarr2 = [];
      for (var indx in arr[indux]["variables"]){
          auxarr2.push(arr[indux]["variables"][indx]);
      }
      auxarr[indux] = auxarr[indux] || [];
      auxarr[indux]["name"]=auxarr[indux]["name"] || arr[indux]["name"];
      auxarr[indux]["online"]=auxarr[indux]["online"] || arr[indux]["online"];
      auxarr[indux]["variables"] = auxarr[indux]["variables"] || [];
      auxarr[indux]["variables"]=auxarr2;
    }
    for (var indexs in auxarr){
      arr2.push(auxarr[indexs]);
    }
    console.log(arr2);
    return arr2;
  },
  check_if_stat(value){
     if(value=="true") return true;
     else return false;
  },
});
