var express = require("express");
var router = express.Router();
const roleSchema = require("../schemas/role");
let {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");

// GET - không yêu cầu đăng nhập
router.get("/", async function (req, res, next) {
  let roles = await roleSchema.find({});
  res.send({
    success: true,
    data: roles,
  });
});

// POST - yêu cầu quyền admin
router.post(
  "/",
  check_authentication,
  check_authorization(["admin"]),
  async function (req, res, next) {
    let body = req.body;
    let newRole = new roleSchema({
      name: body.name,
    });
    await newRole.save();
    res.status(200).send({
      success: true,
      data: newRole,
    });
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
      let role = await roleSchema.findById(id);

      if (role) {
        if (body.name) {
          role.name = body.name;
        }
        await role.save();
        res.status(200).send({
          success: true,
          data: role,
        });
      } else {
        res.status(404).send({
          success: false,
          message: "Vai trò không tồn tại",
        });
      }
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
      let role = await roleSchema.findById(id);

      if (role) {
        await roleSchema.findByIdAndDelete(id);
        res.status(200).send({
          success: true,
          message: "Đã xóa vai trò thành công",
        });
      } else {
        res.status(404).send({
          success: false,
          message: "Vai trò không tồn tại",
        });
      }
    } catch (error) {
      res.status(404).send({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
