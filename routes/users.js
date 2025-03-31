var express = require("express");
var router = express.Router();
var userControllers = require("../controllers/users");
let jwt = require("jsonwebtoken");
let {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");
const constants = require("../utils/constants");

// GET ALL - yêu cầu quyền mod
router.get(
  "/",
  check_authentication,
  check_authorization(["admin", "mod"]),
  async function (req, res, next) {
    try {
      let users = await userControllers.getAllUsers();
      res.send({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET by ID - yêu cầu quyền mod (trừ khi là ID của chính mình)
router.get("/:id", check_authentication, async function (req, res, next) {
  try {
    const id = req.params.id;
    // Sửa lại logic kiểm tra ID của chính user
    const userId = req.user._id.toString();

    // Cho phép truy cập vào dữ liệu của chính mình không cần mod
    if (userId === id) {
      let user = await userControllers.getUserById(id);
      return res.send({
        success: true,
        data: user,
      });
    }

    // Với dữ liệu người dùng khác, yêu cầu quyền mod
    let userRole =
      typeof req.user.role === "object" ? req.user.role.name : req.user.role;

    if (!userRole || (userRole !== "admin" && userRole !== "mod")) {
      return res.status(403).send({
        success: false,
        message: "Không có quyền truy cập - Yêu cầu quyền Mod hoặc Admin",
      });
    }

    let user = await userControllers.getUserById(id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    res.send({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// CREATE - yêu cầu quyền admin
router.post(
  "/",
  check_authentication,
  check_authorization(["admin"]),
  async function (req, res, next) {
    try {
      let body = req.body;
      let newUser = await userControllers.createAnUser(
        body.username,
        body.password,
        body.email,
        body.role
      );
      res.status(200).send({
        success: true,
        data: newUser,
      });
    } catch (error) {
      res.status(404).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// UPDATE - yêu cầu quyền admin
router.put(
  "/:id",
  check_authentication,
  check_authorization(["admin"]),
  async function (req, res, next) {
    try {
      let id = req.params.id;
      let body = req.body;
      let updatedUser = await userControllers.updateUser(id, body);
      res.status(200).send({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      res.status(404).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// DELETE - yêu cầu quyền admin
router.delete(
  "/:id",
  check_authentication,
  check_authorization(["admin"]),
  async function (req, res, next) {
    try {
      let id = req.params.id;
      await userControllers.deleteUser(id);
      res.status(200).send({
        success: true,
        message: "Đã xóa người dùng thành công",
      });
    } catch (error) {
      res.status(404).send({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
