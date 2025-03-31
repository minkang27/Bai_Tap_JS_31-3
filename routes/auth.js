var express = require("express");
var router = express.Router();
let userControllers = require("../controllers/users");
let { check_authentication } = require("../utils/check_auth");
let jwt = require("jsonwebtoken");
let constants = require("../utils/constants");

// Login - không yêu cầu đăng nhập
router.post("/login", async function (req, res, next) {
  try {
    let username = req.body.username;
    let password = req.body.password;
    let result = await userControllers.checkLogin(username, password);
    res.status(200).send({
      success: true,
      data: jwt.sign(
        {
          id: result,
          expireIn: new Date(Date.now() + 3600 * 1000).getTime(),
        },
        constants.SECRET_KEY
      ),
    });
  } catch (error) {
    next(error);
  }
});

// Signup - không yêu cầu đăng nhập
router.post("/signup", async function (req, res, next) {
  try {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let result = await userControllers.createAnUser(
      username,
      password,
      email,
      "user"
    );
    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Me - yêu cầu đăng nhập
router.get("/me", check_authentication, async function (req, res, next) {
  try {
    res.send({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
});

// Change password - yêu cầu đăng nhập
router.post(
  "/changepassword",
  check_authentication,
  async function (req, res, next) {
    try {
      let userId = req.user._id;
      let oldPassword = req.body.oldPassword;
      let newPassword = req.body.newPassword;

      // Xác minh mật khẩu cũ và cập nhật mật khẩu mới
      let result = await userControllers.changePassword(
        userId,
        oldPassword,
        newPassword
      );

      res.status(200).send({
        success: true,
        message: "Đã thay đổi mật khẩu thành công",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
