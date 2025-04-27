const User = require("../../models/user");
const bcrypt = require("bcrypt");
const passport=require('passport')
function authController() {
  const _getRedirectedUrl = (req) => {
    return req.user.role==='Admin'?'/admin/orders':'/customers/order'
  }

  return {
    login(req, res) {
      res.render("auth/login");
    },
    postLogin(req, res, next) {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }
        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }
        req.logIn(user, (err) => {
          if (err) {
            req.flash("error", info.message);
            return next(err);
          }

          return res.redirect(_getRedirectedUrl(req));
        });
      })(req, res, next);
    },
    register(req, res) {
      res.render("auth/register");
    },
    async postRegister(req, res) {
      const { name, email, password } = req.body;

      // Validate request
      if (!name || !email || !password) {
        req.flash("error", "All fields are required");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }

      try {
        // Check if email exists (Fixed: Removed callback)
        const emailExists = await User.exists({ email: email });
        if (emailExists) {
          req.flash("error", "Email already taken");
          req.flash("name", name);
          req.flash("email", email);
          return res.redirect("/register");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
          name,
          email,
          password: hashedPassword,
        });

        await user.save(); // Save user
        return res.redirect("/");
      } catch (err) {
        console.error("Error in user registration:", err);
        req.flash("error", "Something went wrong");
        return res.redirect("/register");
      }
    },
    logout(req, res, next) {
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/login");
      });
    },
  };
}

module.exports = authController;
