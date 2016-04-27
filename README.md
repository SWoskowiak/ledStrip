# ledStrip
Repo for embedded node.js application that controls a ws2801 led strip.

It operates by subcribing to amazon IoT messages containing blinkie:{action} topics

### Topics:

Topic | Expected Payload
------------ | ------------- |
blinkie:fill | `{ "r": 255, "g": 200, "b": 200 }` |
blinkie:gif | `{ "imgUrl": "http://i.giphy.com/ngDsSVRk2Tg0o.gif", "frameDelta": 30, "loop": true, "yOffset": 127 }` |
blinkie:clear | `""` |
