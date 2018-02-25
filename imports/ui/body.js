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

  check_if_stat(value){
     if(value=="true") return true;
     else return false;
  },
  mqttmessages() {  //mensajes con formato definitivo
    var localcollection = MQTTcollection.find({}, { sort: { topic: 1 } });
    var arr = {};
    var arr2= [];
    var index = [];
    var setRootTopic="devices";
    localcollection.forEach(function(item){

        var atopic = item.topic.split("/$elemento/");                       //separa la direccion del broker, de los nodos (elementos)
        if (atopic.length == 2) {                                          //revisa si se obtuvieron las 2 variables
          var ubicacion = atopic[0];                                       //parte deel topic que indica la ubicacion del elemento
          var elemento = atopic[1];                                        //parte del topic que posee variables sobre un elementos
          var aelemento= elemento.split("/");                              //divide al elemento en secciones de datos segun el arbol

          if(aelemento.length == 2){                                       //para variables homie framework
              var elementid = aelemento[0];
              var varid     = aelemento[1];

              if(varid.startsWith("\$implementation")){
                //obtener datos implementation

                arr[elementid] = arr[elementid] || [];
                arr[elementid]["implementation"] = arr[elementid]["implementation"] || item.message;
                arr[elementid]["location"] = arr[elementid]["location"] || ubicacion;

              } else if(varid.startsWith("\$name")) {
                  //obtener nombre variable
                  arr[elementid] = arr[elementid] || [];
                  arr[elementid]["name"] = arr[elementid]["name"] || item.message;

              } else if(varid.startsWith("\$localip")) {
                  //obtener unidad
                  arr[elementid] = arr[elementid] || [];
                  arr[elementid]["localip"] = arr[elementid]["localip"] || item.message;

              } else if(varid.startsWith("\$online")) {
                  //obtener valor variable
                  var onlinex = false;
                  if(item.message==false || item.message=="false" ) {
                      onlinex = false;
                  } else {
                      onlinex = true;
                  }
                  arr[elementid] = arr[elementid] || [];
                  arr[elementid]["online"] = arr[elementid]["online"] || onlinex;

              } else if(varid.startsWith("\$mac")) {
                  //obtener valor variable
                  arr[elementid] = arr[elementid] || [];
                  arr[elementid]["mac"] = arr[elementid]["mac"] || item.message;
              } else if(varid.startsWith("\$homie")) {
                  //obtener valor variable
                  arr[elementid] = arr[elementid] || [];
                  arr[elementid]["homie"] = arr[elementid]["homie"] || item.message;
              }
          } else if(aelemento.length == 3){
            if(aelemento[1].startsWith("\$")){                           //para STATS homie framework
                //datos de Homie framework
                var elementid = aelemento[0];
                var varid     = aelemento[1];
                var elementvar= aelemento[2];

                if(varid.startsWith("\$stats")){
                    //obtener tipo variable
                    arr[elementid]                                   = arr[elementid] || [];
                    arr[elementid]["variables"]                      = arr[elementid]["variables"] || [];
                    arr[elementid]["variables"][elementvar]          = arr[elementid]["variables"][elementvar] || [];
                    arr[elementid]["variables"][elementvar]["stats"] = arr[elementid]["variables"][elementvar]["stats"] || true;
                    arr[elementid]["variables"][elementvar]["value"] = arr[elementid]["variables"][elementvar]["value"] || item.message;
                    arr[elementid]["variables"][elementvar]["name"]  = arr[elementid]["variables"][elementvar]["name"]  || elementvar;

                } else if(varid.startsWith("\$fw")){
                    //obtener tipo variable
                    arr[elementid]                              = arr[elementid] || [];
                    arr[elementid]["fw"]                        = arr[elementid]["fw"] || [];
                    arr[elementid]["fw"][elementvar]            = arr[elementid]["fw"][elementvar] || [];
                    arr[elementid]["fw"][elementvar]["stats"]   = arr[elementid]["fw"][elementvar]["stats"] || true;
                    arr[elementid]["fw"][elementvar]["value"]   = arr[elementid]["fw"][elementvar]["value"] || item.message;
                    arr[elementid]["fw"][elementvar]["name"]    = arr[elementid]["fw"][elementvar]["name"]  || elementvar;

                }
            } else {                                                      //para variables
                var elementid = aelemento[0];
                var varid     = aelemento[1];
                var elementvar= aelemento[2];

                if(elementvar.startsWith("\$type")){
                    //obtener tipo variable
                    arr[elementid]                              = arr[elementid] || [];
                    arr[elementid]["variables"]                 = arr[elementid]["variables"] || [];
                    arr[elementid]["variables"][varid]          = arr[elementid]["variables"][varid] || [];

                    var typex =item.message;        //obtengo tipo variable
                    if (item.message=="relay") {    //si es relay, es actuador, discreto, 2 estados, se asigna topic de actuador
                           arr[elementid]["variables"][varid]["actuator"] = arr[elementid]["variables"][varid]["actuator"] || true;
                           arr[elementid]["variables"][varid]["actuator"] = arr[elementid]["variables"][varid]["discrete"] || true;
                           arr[elementid]["variables"][varid]["actuator"] = arr[elementid]["variables"][varid]["states"]   || 2;
                           arr[elementid]["variables"][varid]["topic"]    = arr[elementid]["variables"][varid]["topic"]    || ubicacion+"/\$elemento/"+elementid+"/"+varid+"/"+"state"+"/"+"set";
                    } else arr[elementid]["variables"][varid]["actuator"] = arr[elementid]["variables"][varid]["actuator"] || false;

                    if(item.message=="temperature") typex = "mdi mdi-thermometer";
                    if(item.message=="relay") typex = "mdi mdi-power";
                    if(item.message=="humidity") typex = "mdi mdi-water-percent";


                    arr[elementid]["variables"][varid]["stats"] = arr[elementid]["variables"][varid]["stats"] || false;
                    arr[elementid]["variables"][varid]["type"]  = arr[elementid]["variables"][varid]["type"]  || typex;

                } else if(elementvar.startsWith("name")) {
                    //obtener nombre variable
                    arr[elementid]                              = arr[elementid] || [];
                    arr[elementid]["variables"]                 = arr[elementid]["variables"] || [];
                    arr[elementid]["variables"][varid]          = arr[elementid]["variables"][varid] || [];
                    arr[elementid]["variables"][varid]["stats"] = arr[elementid]["variables"][varid]["stats"] || false;
                    arr[elementid]["variables"][varid]["name"]  = arr[elementid]["variables"][varid]["name"]  || item.message;

                } else if(elementvar.startsWith("unit")) {
                    //obtener unidad
                    arr[elementid]                              = arr[elementid] || [];
                    arr[elementid]["variables"]                 = arr[elementid]["variables"] || [];
                    arr[elementid]["variables"][varid]          = arr[elementid]["variables"][varid] || [];
                    arr[elementid]["variables"][varid]["stats"] = arr[elementid]["variables"][varid]["stats"] || false;
                    arr[elementid]["variables"][varid]["unit"]  = arr[elementid]["variables"][varid]["unit"]  || item.message;

                } else if(elementvar.startsWith("value")) {
                    //obtener valor variable
                    arr[elementid]                              = arr[elementid] || [];
                    arr[elementid]["variables"]                 = arr[elementid]["variables"] || [];
                    arr[elementid]["variables"][varid]          = arr[elementid]["variables"][varid] || [];
                    arr[elementid]["variables"][varid]["stats"] = arr[elementid]["variables"][varid]["stats"] || false;
                    arr[elementid]["variables"][varid]["value"] = arr[elementid]["variables"][varid]["value"] || item.message;

                }
            }
          } else if(aelemento.length == 4){                              //para actuador ($state/set), o ota/enable
                var elementid = aelemento[0];
                var varid     = aelemento[1];
                var elementvar= aelemento[2];
                var elementsub= aelemento[3];


                if(varid.startsWith("\$implementation") && elementvar.startsWith("ota") && elementsub.startsWith("enabled")){
                    //obtener estado OTA
                    arr[elementid]                                   = arr[elementid] || [];
                    arr[elementid]["variables"]                      = arr[elementid]["variables"] || [];
                    arr[elementid]["variables"][elementvar]          = arr[elementid]["variables"][elementvar] || [];
                    arr[elementid]["variables"][elementvar]["stats"] = arr[elementid]["variables"][elementvar]["stats"] || true;
                    arr[elementid]["variables"][elementvar]["value"] = arr[elementid]["variables"][elementvar]["value"] || item.message;
                    arr[elementid]["variables"][elementvar]["name"]  = arr[elementid]["variables"][elementvar]["name"]  || elementvar;

                } else if(elementvar.startsWith("state") && elementsub.startsWith("set")) {
                    //obtener state/set
                    //no lo necesito de momento, /state/set solo se usa como output, no hago nada
                }
          }

        } else {
          //no hago nada, la publicacion no pertenece al formato del protocolo, por lo tanto la ignoro
        }
    });
    var indux1=0;
    var indux2=0;
    var auxarr=[];
    for(var indux in arr){                                        //itero el contenido del arreglo creado
      var auxarr2 = [];
      for (var indx in arr[indux]["variables"]){
          auxarr2.push(arr[indux]["variables"][indx]);            //inyecto las variables en un arreglo
      }
      var auxarr3 = [];
      for (var indx in arr[indux]["fw"]){
          auxarr3.push(arr[indux]["fw"][indx]);                   //inyecto la info de firmware en un arreglo
      }                                                           //y ahora los inserto en una matriz de objetos
      auxarr[indux] = auxarr[indux] || [];
      auxarr[indux]["name"]=auxarr[indux]["name"] || arr[indux]["name"];
      auxarr[indux]["online"]=auxarr[indux]["online"] || arr[indux]["online"];
      auxarr[indux]["implementation"]=auxarr[indux]["implementation"] || arr[indux]["implementation"];
      auxarr[indux]["localip"]=auxarr[indux]["localip"] || arr[indux]["localip"];
      auxarr[indux]["mac"]=auxarr[indux]["mac"] || arr[indux]["mac"];
      auxarr[indux]["homie"]=auxarr[indux]["homie"] || arr[indux]["homie"];
      auxarr[indux]["variables"] = auxarr[indux]["variables"] || [];
      auxarr[indux]["variables"]=auxarr2;
      auxarr[indux]["fw"] = auxarr[indux]["fw"] || [];
      auxarr[indux]["fw"]=auxarr3;
    }
    for (var indexs in auxarr){
      arr2.push(auxarr[indexs]);      //e inserto la matriz en un arreglo, para ser iterado en un template
    }
    console.log(arr2);
    return arr2;
  },

});
