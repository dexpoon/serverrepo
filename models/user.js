const mongoose  = require('mongoose');
const config    = require('../config/database')
const bcrypt    = require('bcryptjs')
const Task      = require('./task');
const Roles     = require('../config/roles');
const logit     = require('../config/svrlogger');


// User schema
const UserSchema = mongoose.Schema ({
  // _id:                number; // created and populated by DB, no need to declare
    username:         { type: String, required: true },     // ref primary key and should be unique
    name:             { type: String, required: true },  
    email:            { type: String, required: true },
    password:         { type: String, required: true },
    role:             { type: String, required:true, default: Roles.DOC_ROLE }, // IRole.name 
    business:         { type: String, required: false },         // IBusiness.name
    activationDate:   { type: String, required:true   },
    deactivationDate: { type: String, required:false  },
    status:           { type: String, required:false  },
    // Relationships
    tasks:            [ {type: Number, ref : 'Task'}]     // referring to Task.id
    
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById  = 
 (id, callback) => User.findById(id, callback);


module.exports.getUserByUsername = 
 (username, callback) => {
     const query = { username : username }
     User.findOne(query, callback);
 }


module.exports.addUser = function(newUser, callback){
   bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if(err) throw err;
        newUser.password = hash;
        newUser.save(callback);
      });
    });
  }

  module.exports.updateUser = function(username, newPassword, callback) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newPassword, salt, (err, hash) => {
        if(err) throw err;
        newHashedPassword = hash;
        User.update({ username: username }, { $set: { password: newHashedPassword }}, callback);
      });
    });      
  }
    /*if(err)
                return  {
                            "success": false,
                            "msg": 'Failed to change Password!',
                         }
                         return res.json(  {
                            success: true,
                            msg: 'Password Changed Successfully!',
                            user: updatedUser
                        });
    });
    */
  module.exports.comparePassword = function(candidatePassword, hash, callback){
      bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        logit('USER::COMPAREPASSWD ' + candidatePassword + ' <><> ' + hash);
        if(err) throw err;
        callback(null, isMatch);
      });
  }

module.exports.update = (user, callback) => {
  logit('USER::UPDATE ENTERING , User: ' + user);
  User.findOne({ _id: user._id }, function (err, doc){
      doc.username          = user.username;
      doc.name              = user.name;
      doc.email             = user.email;
      doc.password          = user.password;
      doc.role              = user.role;
      doc.business          = user.business;
      doc.activationDate    = user.activationDate;
      doc.deactivationDate  = user.deactivationDate; 
      doc.status            = user.status;
      doc.save();
    });
  logit('USER::UPDATE EXITING');
}    