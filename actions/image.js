'use strict';

var getPixel = require('get-pixels'),
  prevUrl, // Previous url we loaded
  prevPixels; // Previous store of pixels

/**
 * Builds frame data out of ndArray of pixels
 * @param  {ndArray} pixels   ndArray of pixels (https://www.npmjs.com/package/ndarray)
 * @param  {Number} ledCount  the number of leds this strip uses
 * @param  {Number} yOffset   the height we want to start slicing our frames at (defaults to 0)
 * @param  {Number} ledHeight the height of our ledStrip (defaults to 1)
 * @return {Array}           Frame data to animate through our led strip
 */
function buildFramesFromPixels(pixels, ledCount, yOffset, ledHeight) {
  var i, j, k, l,
  curFrame, color, frames = [],
  maxWidth, maxHeight;

  console.log('Building frame map...');

  // Make sure we attempt to grab valid values (don't step out of image size bounds)
  maxWidth = Math.min(ledCount, pixels.shape[1]);
  maxHeight = Math.min(ledHeight, pixels.shape[2]);
  yOffset = Math.min(maxHeight, yOffset);

  console.log('Frames: ' + pixels.shape[0] + ' - Dimensions: ' + pixels.shape[1] + 'x' + pixels.shape[2]);
  // For an animated gif in get-pixels it returns the following:
  // shape[0] = number of frames (i)
  // shape[1] = frame width (in pixels) (j)
  // shape[2] = frame height (in pixels) (k)
  // shape[3] = RGB(A) value of pixel at given offset (l)
  for (i = 0; i < pixels.shape[0]; i++) {
    curFrame = [];
    for (j = 0; j < maxWidth; j++) {
      for (k = yOffset; k < (maxHeight + yOffset); k++) {
        color = [];
        for (l = 0; l < 3; l++) {
          color.push(pixels.get(i, j, k, l));
        }
        curFrame.push(color);
      }
    }
    frames.push(curFrame);
  }
  console.log('Frame map complete.');
  return frames;
}

/**
 * Takes an url for a gif and converts it to frame data
 * @param  {String} url    url to a gif image
 * @param  {Number} ledCount  the number of leds this strip uses
 * @param  {Number} yOffset   the height we want to start slicing our frames at (defaults to 0)
 * @param  {Number} ledHeight the height of our ledStrip (defaults to 1)
 * @return {Promise}           returns promise that resolves once remote img is loaded and frame data is built
 */
module.exports = function (url, ledCount, yOffset, ledHeight) {

  ledHeight = ledHeight || 1;
  yOffset = yOffset || 0;

  // Returns a promise
  return new Promise(function (resolve, reject) {
    if ((url === prevUrl) && prevPixels) {
      console.log('Using existing pixel data for image: ' + url);
      resolve(buildFramesFromPixels(prevPixels, ledCount, yOffset, ledHeight));
    } else {
      console.log('\nDownloading image: ' + url + ' ....\n');
      // Call get-pixel
      getPixel(url, function (err, pixels) {
        if (err) {
          console.log('Image failed to load from: ' + url);
          resolve(false);
          return false;
        }
        prevUrl = url;
        prevPixels = pixels;
        resolve(buildFramesFromPixels(pixels, ledCount, yOffset, ledHeight));
      });
    }
  });
};
