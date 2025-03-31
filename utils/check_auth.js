let jwt = require("jsonwebtoken");
let constants = require("./constants");
var userControllers = require("../controllers/users");
module.exports = {
  check_authentication: async function (req, res, next) {
    try {
      if (!req.headers || !req.headers.authorization) {
        return res.status(401).send({
          success: false,
          message: "Bạn chưa đăng nhập",
        });
      }
      if (!req.headers.authorization.startsWith("Bearer")) {
        return res.status(401).send({
          success: false,
          message: "Bạn chưa đăng nhập",
        });
      }
      let token = req.headers.authorization.split(" ")[1];
      let result = jwt.verify(token, constants.SECRET_KEY);
      let user_id = result.id;

      if (result.expireIn < Date.now()) {
        return res.status(401).send({
          success: false,
          message: "Token hết hạn",
        });
      }

      let user = await userControllers.getUserById(user_id);
      if (!user) {
        return res.status(401).send({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).send({
        success: false,
        message: "Lỗi xác thực: " + error.message,
      });
    }
  },
  check_authorization: function (roles) {
    return function (req, res, next) {
      try {
        if (!req.user || !req.user.role) {
          return res.status(403).send({
            success: false,
            message: "Không có quyền truy cập",
          });
        }

        // Kiểm tra nếu role là object (khi đã populate) hoặc string
        let roleOfUser =
          typeof req.user.role === "object"
            ? req.user.role.name
            : req.user.role;

        if (roles.includes(roleOfUser)) {
          next();
        } else {
          return res.status(403).send({
            success: false,
            message: "Bạn không có quyền thực hiện hành động này",
          });
        }
      } catch (error) {
        return res.status(403).send({
          success: false,
          message: "Lỗi phân quyền: " + error.message,
        });
      }
    };
  },
};
