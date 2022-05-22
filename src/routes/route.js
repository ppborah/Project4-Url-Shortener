const express = require("express");
const router = express.Router();
const {createShortUrl,redirect2LongUrl} =require('../controllers/urlController')

router.post("/url/shorten", createShortUrl);
router.get("/:urlCode", redirect2LongUrl);

router.all("/", function (req, res) {
  res
    .status(404)
    .send({ status: false, msg: "The api you requested is not available" });
});

module.exports = router;
