# ledStrip
Repo for embedded node.js application that controls a ws2801 led strip.

It operates by subcribing to amazon IoT messages containing blinkie:{action} topics


## Jenky Install Process

* Make sure device has its "Thing" representation on the amazon IoT page (save the permission files it generates)
* Git clone this repo onto device (the raspberry pi)
* Copy the generated permission files to the root of the project folder (when you made the amazon "Thing") on the device
NOTE: you will also need to create the root-CA file which you can get the contents of [HERE](https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem)
* Inside of index.js be sure to update the `iotSettings` object to match the files you copied over

Make sure you run `npm install` first and then run `node index` to start the application


## Topics:

Topic | Expected Payload (examples)
------------ | ------------- |
blinkie:fill | `{ "r": 255, "g": 200, "b": 200 }` |
blinkie:gif | `{ "url": "http://i.giphy.com/ngDsSVRk2Tg0o.gif", "frameDelta": 30, "loop": true, "yOffset": 127 }` |
blinkie:clear | `""` |

### fill

Fill will fill all leds with a solid color provided represented by the RGB values passed in

### gif

Loads a gif from a given URL and parse out a chunk of its pixel data at a given yOffset (defaults to 0)

Basically if your gif is 160x160 with 10 frames and you feed a yOffset of 80  you will effectively cut out a 160x1 slice out starting 80 pixels down.

NOTE: The width is fixed to 160px for now (the number of leds for this project's target strip) but if the gif's width is smaller it will only read up to the gif's max width.

### clear

This function requires no payload as it simply just clears the animation interval and turns all leds off
