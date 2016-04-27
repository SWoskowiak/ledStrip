'use strict';

var awsIot = require('aws-iot-device-sdk'),
  leds = require('rpi-ws2801'),
  _ = require('lodash'),
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
  ledCount = 160,
  animationInterval = '';

console.log('Connecting to Amazon IoT...');
device = awsIot.device(iotSettings);
// On Amazon IoT connection
device.on('connect', function () {
  console.log('Amazon IoT connect Success');
  // Subscripe to Blinkie related topics
  device.subscribe('blinkie:fill');
  device.subscribe('blinkie:gif');
  device.subscribe('blinkie:clear');

  console.log('Awaiting messages...');
  // Connect LEDS
  leds.connect(ledCount);
  leds.clear();
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
  var rgb, data;

  console.log('message:', topic, payload.toString());
  // display some number or string (only reads first two characters in string)
  if (topic === 'blinkie:fill') {
    reset();
    try {
      data = JSON.parse(payload);
    } catch(e) {
      console.log('payload JSON is malformed:\n ' + payload);
      return;
    }
    leds.fill(rgb.r, rgb.g, rgb.b);
  }
  if (topic === 'blinkie:clear') {
    reset();
  }
  // Gif payload looks like
  // {
  //   "url" : "http://some-gif-url-here",
  //   "frameDelta: 20, (the milisecond delay you want between each frame)
  //   "loop": true, (continous play)
  //   "yOffset": 50 (we only read out a 1px high "slice" thats led)
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

    // pass off message data to frame builder
    frameBuilder(data.url, ledCount, data.yOffset).then(function (frames) {
      if (!frames) {
        console.log('Awaiting messages... ');
      } else {
        console.log('calling animate with: ' + frames.length + ' frames, delta: ' + data.frameDelta);
        animate(frames, data.frameDelta, data.loop);
      }
    });
  }
});
