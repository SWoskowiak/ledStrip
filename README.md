# ledStrip
Repo for embedded node.js application that controls a ws2801 led strip.

It operates by subcribing to amazon IoT messages containing blinkie:{action} topics

### Topics:

Topic | Expected Payload
------------ | ------------- |
blinkie:fill | `{ "r": 255, "g": 200, "b": 200 }` |
blinkie:gif | <code>{ <br>"imgUrl":"http://i.giphy.com/ngDsSVRk2Tg0o.gif",<br>"frameDelta": 30, <br>"loop": true,<br> "yOffset": 127<br> }</code> |
blinkie:clear |  |
