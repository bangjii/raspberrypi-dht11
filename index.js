var sensorLib = require('node-dht-sensor');
const Gpio = require('pigpio').Gpio;
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8880 });
const ledA = new Gpio(26, {mode: Gpio.OUTPUT});
var sensorType = 11; // 11 for DHT11, 22 for DHT22 and AM2302
var sensorPin  = 17;  // The GPIO pin number for sensor signal

if (!sensorLib.initialize(sensorType, sensorPin)) {
    console.warn('Failed to initialize sensor');
    process.exit(1);
}

ledA.pwmWrite(0);
var tt, th;

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  //ws.send('something');
  setInterval(() => {
	//-------------
	var readout = sensorLib.read();
	var t = readout.temperature.toFixed(1);
	var h = readout.humidity.toFixed(1);
	if(tt != t || th != h){
		tt = t;
		th = h;
		console.log("Temperature: " + tt + "*C");
		console.log("Humidity: " + th + "%");		
		var msg = {"temperature": tt, "humidity": th};
		ws.send(JSON.stringify(msg));	
	}
	if (th > 61){
		ledA.pwmWrite(255);
	}
	else {
		ledA.pwmWrite(0);
	}
  }, 500);
});
