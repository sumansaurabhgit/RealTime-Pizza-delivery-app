const LocalStrategy=require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')


function init(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async(email, password, done) => {
        

        const user = await User.findOne({ email: email })
        if (!user) {
            return done(null,false,{message:'No user with email'})
        }
        bcrypt.compare(password, user.password).then(match => {
            if (match) {
                return done(null,user,{message:'Logged in successfully'})
            }
            return done(null,false,{message:'wrong username or password'})
        }).catch(err => {
            return done(null,false,{message:'something went wrong'})
        })
    }))

    passport.serializeUser((user,done) => {
        done(null,user._id)
    })

    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id); // Use async/await
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    });



}

module.exports = init;