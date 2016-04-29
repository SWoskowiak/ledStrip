# ledStrip
Repo for embedded node.js application that controls a ws2801 led strip.

It operates by subcribing to amazon IoT messages containing blinkie:{action} topics


## Jenky Install Process

* Make sure device has its "Thing" representation on the amazon IoT page
* Be sure to save the permission files it generates and copy the iot settings object it gives you
* Git clone this repo onto device (the raspberry pi)
* Copy the generated permission files to the root of the project folder (when you made the amazon "Thing") on the device
NOTE: you will also need to create the root-CA file which you can get the contents of [HERE](https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem)
* Inside of index.js be sure to update the `iotSettings` object to match the one you copied earlier

Make sure you run `npm install` first and then run `node index` to start the application


## Topics:

Topic | Expected Payload (examples)
------------ | ------------- |
blinkie:gif | `{ "url": "http://i.giphy.com/ngDsSVRk2Tg0o.gif", "frameDelta": 30, "loop": true, "yOffset": 10, "ledCount": 160 }` |
blinkie:clear | `""` |

### gif

Loads a gif from a given URL and parse out a chunk of its pixel data at a given yOffset (defaults to 0)

Basically if your gif is 160x160 with 10 frames and you feed a yOffset of 80  you will effectively cut out a 160x1 slice out starting 80 pixels down.

NOTE: There is bounds checking vs the image's size, if you attempt to step outside image bounds either in width or yOffset then it will read only up to image's bound and ignore the rest. 

Only `url` is required, the rest will be filled with the defaults listed below:

```JSON
  {
    "yOffset": 0,
    "loop": true,
    "frameDelta": 50
  };
```

### clear

This function requires no payload as it simply just clears the animation interval and turns all leds off
