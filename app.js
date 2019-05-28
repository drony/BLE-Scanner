'use strict';

let theServer = null;

function onConnected() {
    document.querySelector('#progressbar').classList.add('hidden');
    document.querySelector('.connect-button').removeAttribute("disabled");
    console.log("BLE connected");
    dialog.close();    
}

function onDisconnected() {
    console.log("BLE disconnected");
    // document.querySelector('.connect-button').classList.remove('hidden');
    // document.querySelector('form').classList.remove('hidden');
}

function connect() {

    document.querySelector('.connect-button').setAttribute("disabled","");
    document.querySelector('#progressbar').classList.remove('hidden');

    navigator.bluetooth.requestDevice(
    {
        acceptAllDevices: true
    })
    .then(device => {
        console.log('> Found ' + device.name);
        console.log('Connecting to GATT Server...');
        device.addEventListener('gattserverdisconnected', onDisconnected)
        return device.gatt.connect();
    })
    .then(server => {
        theServer = server;
        console.log('Gatt connected');
        onConnected();

        log('Getting Services...');
        return server.getPrimaryServices();
    })
    .then(services => {
        log('Getting Characteristics...');
        let queue = Promise.resolve();
        services.forEach(service => {
          queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
            log('> Service: ' + service.uuid);
            characteristics.forEach(characteristic => {
              log('>> Characteristic: ' + characteristic.uuid + ' ' +
                  getSupportedProperties(characteristic));
            });
          }));
        });
        return queue;
    })
    .catch(error => {
        console.log('Argh! ' + error);
        document.querySelector('#progressbar').classList.add('hidden');
        document.querySelector('.connect-button').removeAttribute("disabled");
        var notification = document.querySelector('.mdl-js-snackbar');
        notification.MaterialSnackbar.showSnackbar(
            {
                message: 'Error while connecting to BLE, please try again.'
            }
        );
    });
}

function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
      if (characteristic.properties[p] === true) {
        supportedProperties.push(p.toUpperCase());
      }
    }
    return '[' + supportedProperties.join(', ') + ']';
}