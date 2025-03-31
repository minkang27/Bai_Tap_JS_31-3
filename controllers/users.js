let userSchema = require("../schemas/user");
let roleSchema = require("../schemas/role");
let bcrypt = require("bcrypt");
module.exports = {
  getAllUsers: async function () {
    return userSchema.find({}).populate("role");
  },
  getUserById: async function (id) {
    return userSchema.findById(id).populate("role");
  },
  getUserByUsername: async function (username) {
    return userSchema
      .findOne({
        username: username,
      })
      .populate("role");
  },
  createAnUser: async function (username, password, email, roleI) {
    // Kiểm tra username đã tồn tại
    const existingUser = await this.getUserByUsername(username);
    if (existingUser) {
      throw new Error("Tên đăng nhập đã tồn tại");
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    let role = await roleSchema.findOne({
      name: roleI,
    });
    if (role) {
      let newUser = new userSchema({
        username: username,
        password: hashedPassword,
        email: email,
        role: role._id,
      });
      return await newUser.save();
    } else {
      throw new Error("Vai trò không tồn tại");
    }
  },
  updateUser: async function (id, body) {
    let user = await this.getUserById(id);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    if (body.username) user.username = body.username;
    if (body.email) user.email = body.email;

    if (body.role) {
      const role = await roleSchema.findOne({ name: body.role });
      if (!role) {
        throw new Error("Vai trò không tồn tại");
      }
      user.role = role._id;
    }

    await user.save();
    return user;
  },
  deleteUser: async function (id) {
    let user = await userSchema.findById(id);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    return await userSchema.findByIdAndDelete(id);
  },
  checkLogin: async function (username, password) {
    let user = await this.getUserByUsername(username);
    if (!user) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    } else {
      if (bcrypt.compareSync(password, user.password)) {
        return user._id;
      } else {
        throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    }
  },
  changePassword: async function (userId, oldPassword, newPassword) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Mật khẩu cũ không đúng");
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    return true;
  },
};
