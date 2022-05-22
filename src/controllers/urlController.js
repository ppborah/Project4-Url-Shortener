const urlModel = require("../models/urlModel");
const { isValidRequestBody, isValid } = require("../utilities/validator");
const { nanoid } = require("nanoid");
const isUrl = require("is-url");
const redis = require("redis");
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  13190,
  "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const createShortUrl = async function (req, res) {
  try {
    let result;

    //Getting original url from user
    let longUrl = req.body.longUrl;

    //Validating url
    if (!isValidRequestBody(req.body))
      return res.status(400).send({ status: false, message: "No user input" });
    if (!isValid(longUrl))
      return res
        .status(400)
        .send({ status: false, message: "Url is required or not a valid one" });

    //Validating url
    longUrl = longUrl.trim();
    if (!isUrl(longUrl))
      return res
        .status(400)
        .send({ status: false, message: `${longUrl} is not a valid url` });

    //Getting data from cache
    let isCachedUrlData = await GET_ASYNC(`${longUrl}`);
    if (isCachedUrlData) {
      let cachedUrlData = JSON.parse(isCachedUrlData);
      result = {
        longUrl: cachedUrlData.longUrl,
        shortUrl: cachedUrlData.shortUrl,
        urlCode: cachedUrlData.urlCode,
      };
      return res
        .status(200)
        .send({ status: true, message: "success", data: result });
    }

    //If not present in cache
    else {
      //Generating unique url code
      let urlCode = longUrl.trim().slice(1, 3) + nanoid();

      //Checking uniqueness of url in database
      let isUniqueUrlCode = await urlModel.findOne({ urlCode: urlCode });
      if (isUniqueUrlCode)
        return res
          .status(400)
          .send({ status: false, message: `${urlCode} is already exist` });

      //Generating short url using base url plus urlCode
      let shortUrl = "localhost:3000/" + urlCode;

      //Saving data in database
      let saveData = { longUrl, shortUrl, urlCode };

      let saveUrl = await urlModel.create(saveData);
      result = {
        longUrl: saveUrl.longUrl,
        shortUrl: saveUrl.shortUrl,
        urlCode: saveUrl.urlCode,
      };

      await SET_ASYNC(`${longUrl}`, JSON.stringify(result));

      return res
        .status(201)
        .send({ status: true, message: "success", data: result });
    }
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
};

const redirect2LongUrl = async function (req, res) {
  try {
    let urlCode = req.params.urlCode;

    //Validating url
    if (!isValid(urlCode))
      return res
        .status(400)
        .send({
          status: false,
          message: `Url code is required or not a valid one`,
        });

    //Getting data from cache
    let isCachedUrlData = await GET_ASYNC(`${urlCode}`);

    if (isCachedUrlData) {
      let cachedUrlData = JSON.parse(isCachedUrlData);
      res.redirect(302, cachedUrlData.longUrl);
    }

    //If not present in cache
    else {
      let getData = await urlModel.findOne({ urlCode: urlCode });

      // if Url does not exist (in our database)
      if (!getData) {
        return res
          .status(404)
          .send({ status: false, message: "Url not found" });
      }

      //Setting in cache
      await SET_ASYNC(`${urlCode}`, JSON.stringify(getData));

      res.redirect(302, getData.longUrl);
    }
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
};

module.exports = { createShortUrl, redirect2LongUrl };
