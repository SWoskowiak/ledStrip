'use strict';

var awsIot = require('aws-iot-device-sdk'),
  leds = require('rpi-ws2801'),
  _ = require('lodash'),
  ip = require('ip'),
  device,
  iotSettings = {
    host: 'AB9CT7LOKIG9O.iot.us-east-1.amazonaws.com',
    port: 8883,
    clientId: 'blinkie',
    thingName: 'blinkie',
    caCert: 'root-CA.crt',
    clientCert: '150480e48f-certificate.pem.crt',
    privateKey: '150480e48f-private.pem.key'
  },
  frameBuilder = require('./actions/image'),
  animationInterval = '';

console.log('Connecting to Amazon IoT...');
device = awsIot.device(iotSettings);
// On Amazon IoT connection
device.on('connect', function () {
  console.log('Amazon IoT connect Success');
  // Subscripe to Blinkie related topics
  device.subscribe('blinkie:gif');
  device.subscribe('blinkie:clear');
  // Subscribe to General device topics
  device.subscribe('report');

  console.log('Awaiting messages...');
  // Connect LEDS
  //leds.connect(ledCount);
  //leds.clear();
});

/**
 * Simple reset function to clear existing intervals and turn off leds
 */
function reset() {
  clearInterval(animationInterval);
  leds.clear();
}

/**
 * Animate an array of frames out to our ws2801 led strip
 * @param  {Array}  frames      Array of frames built in actions/image.js
 * @param  {Number} frameDelta  Time between each frame (NOTE: ~15ms per frame seems to be the fastest we can animate)
 * @param  {Number} loop        Animation should continously loop
 */
function animate(frames, frameDelta, loop) {
  var frameCount = 0,
    curFrame,
    curFrameLen,
    i;

  // Set current interval loop up with animation
  animationInterval = setInterval(function () {
    if (!frames[frameCount]) {
      if (loop) {
        frameCount = 0;
      } else {
        console.log('END OF ANIMATION');
        reset();
        return;
      }
    }
    curFrame = frames[frameCount];
    curFrameLen = curFrame.length;
    // Set our animation up
    for (i = 0; i < curFrameLen; i++) {
      leds.setColor(i, curFrame[i]);
    }
    // Update LEDS
    leds.update();

    frameCount++;
  }, frameDelta);
}

// Runs when ANY topic message we subscribed to gets published
device.on('message', function (topic, payload) {
  var data,
  // Default values for blinkie:gif
  gifDefault = {
    url: '',
    yOffset: 0,
    loop: true,
    frameDelta: 50,
    ledCount: 160 // 160 just happens to be the length of our ledStrip
  };

  console.log('message:', topic, payload.toString());
  if (topic === 'blinkie:clear') {
    reset();
  }
  // Gif payload looks like
  // {
  //   "url" : "http://some-gif-url-here",
  //   "frameDelta: 20, (the milisecond delay you want between each frame)
  //   "loop": true, (continous play)
  //   "yOffset": 50 (we only read out a 1px high "slice" so specifiy what height you want that to happen)
  //   "ledCount": 160  (the length of the slice we want to count out)
  // }
  if (topic === 'blinkie:gif') {
    reset();
    // Try to parse the JSON payload
    try {
      data = JSON.parse(payload);
    } catch(e) {
      console.log('payload JSON is malformed:\n ' + payload);
      return;
    }
    // Merge data with defaults
    data = _.merge(gifDefault, data);

    if (data.url === '') {
      console.log('No url was specified!');
      console.log('Awaiting messages... ');
      return;
    }

    // pass off message data to frame builder
    frameBuilder(data.url, data.ledCount, data.yOffset).then(function (frames) {
      // Connect LEDS
      leds.connect(data.ledCount);

      if (!frames) {
        console.log('Awaiting messages... ');
      } else {
        console.log('calling animate with: ' + frames.length + ' frames, delta: ' + data.frameDelta);
        animate(frames, data.frameDelta, data.loop);
      }
    });
  }
  // When asked to report, pass back our ip and client ID
  if (topic === 'report') {
    device.publish('status', JSON.stringify({
      id: iotSettings.clientId,
      ip: ip.address()
    }));
  }
});
