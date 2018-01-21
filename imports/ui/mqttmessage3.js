import { Template } from 'meteor/templating';

import { MQTTcollection } from '../api/MQTTcollection.js';

import './mqttmessage3.html';

Template.mqttmessage3.events({
  'click form'(event) {
    event.preventDefault();
    const target = event.currentTarget;
    var rmessage = "undefined";
    if(target.message.value=="on") rmessage="off";
    if(target.message.value=="off") rmessage="on";
    MQTTcollection.insert({ topic: target.topic.value, message: rmessage, broadcast: true });
  },
});


/*
Template.mqttmessage3.events({
  'submit .relayform'(event) {
    event.preventDefault();
    const target = event.target;
    var rmessage = "undefined";
    if(target.message=="on") rmessage="off";
    if(target.message=="off") rmessage="on";
    console.log("sending topic: " + target.topic);
    console.log("sending message: " + rmessage);
     MyCollection.insert({ topic: target.topic, message: rmessage, broadcast: true });
  },
});
*/
