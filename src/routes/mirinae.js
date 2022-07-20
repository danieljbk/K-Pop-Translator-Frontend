import express from 'express';
const router = express.Router();

import puppeteer from 'puppeteer';
import Jimp from 'jimp';

import MirinaeOutput from '../models/mirinaeOutput.js';

router.get('/:textInput', async (req, res) => {
  // takes string, returns buffer
  const scrapeMirinae = async (text) => {
    const browser = await puppeteer.launch({
      defaultViewport: null,
    });

    let page = await browser.newPage();
    await page.goto('https://mirinae.io');

    // click on textarea and type. then, press enter.
    await page.click('#editable-source');
    await page.type('#editable-source', text);
    await page.type('#editable-source', String.fromCharCode(13));

    // wait until result loads
    await page.waitForSelector('.original-words');

    // manipulate body element
    await page.evaluate((selector) => {
      var body = document.querySelector(selector);
      body.style.minHeight = 'fit-content';
      body.style.backgroundColor = 'transparent';
    }, '#exploration'); // must pass in selector. if not, can't access element (for some reason)

    // clear unnecessary elements; as the popup classes change often, begin from the root
    await page.evaluate((selector) => {
      var root = document.querySelector(selector);
      var content = root.firstChild;
      var contentChildren = content.children;

      content.style.height = 'fit-content';
      content.style.minHeight = 'fit-content';

      // first get index of result
      let resultId;
      for (var i = 0; i < contentChildren.length; i++) {
        if (contentChildren[i].id === 'exploration-page') resultId = i;
      }

      var result = contentChildren[resultId];
      var resultChildren = result.children;

      // get rid of the extra height in the result
      result.style.minHeight = 'fit-content';
      result.style.padding = '0';

      // hide everything other than the explanation in the result
      for (var i = 0; i < resultChildren.length; i++) {
        if (
          resultChildren[i].firstChild.firstChild.id === 'svg-layout-template'
        )
          continue;
        else if (resultChildren[i].firstChild.id === 'translation') continue;
        else resultChildren[i].style.display = 'none';
      }

      // hide everything else in the content div
      for (var i = 0; i < contentChildren.length; i++) {
        if (i != resultId) contentChildren[i].style.display = 'none';

        `
      decided not to use remove due to difficulty with directly manipulating array
      if (i != resultId) content.removeChild(contentChildren[i]);
      `;
      }
    }, '#root'); // must pass in selector. if not, can't access element (for some reason)

    // take a screenshot of the screen
    const imageBuffer = await page.screenshot({
      omitBackground: true,
      fullPage: true,
    });

    await browser.close();

    return imageBuffer;
  };

  // takes buffer, returns buffer
  const autocropImage = async (imageBuffer) => {
    try {
      // read buffer and convert to PNG
      let image = await Jimp.read(imageBuffer);

      // automatically crop the empty space from the image
      image = image.autocrop(); // a JIMP function

      // convert back to buffer
      image = await image.getBufferAsync(Jimp.MIME_PNG);

      return image;
    } catch (err) {
      console.log(err);
    }
  };

  // search database for the specific text query
  const textInput = req.params.textInput;
  try {
    const result = await MirinaeOutput.findOne({ textInput });

    if (result) {
      return res.status(201).send(result.imageOutput);
    } else {
      // if output does not exist in database
      try {
        // scrape mirinae.io, take screenshot, and automatically crop extra space
        const imageBuffer = await scrapeMirinae(textInput);
        imageBuffer = await autocropImage(imageBuffer);

        // save buffer to database.
        mirinaeOutput = new MirinaeOutput({
          textInput,
          imageOutput: imageBuffer,
        });

        await mirinaeOutput.save();

        return res.status(200).send(imageBuffer);
      } catch (err) {
        console.error(err);
        return res.status(500).send('Server Error');
      }
    }
  } catch (e) {
    console.log(err);
    res.status(400).send();
  }
});

export default router;