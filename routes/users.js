const express   = require('express');
const User      = require('../models/user');
const passport  = require('passport');
const jwt       = require('jsonwebtoken');
const config    = require('../config/database');
let logit       = require('../config/svrlogger');
let UTILS       = require('../config/utils');

// Get the router
const router    = express.Router();

// route to register users
router.post('/register', (req, res, next) => {
    let newUser = new User ({
        name: req.body.name,
        email:req.body.email,
        username:req.body.username,
        password:req.body.password
    });    

    newUser.activationDate = NOW_DATE;
   

    User.addUser(newUser, (err, user) => {
    //newUser.save((err, user) => {
        logit('== in User.addUser ' + user);
        if(err) {
            logit('== in User.addUser: ERROR ' + err);
            res.json({success:false, msg:'Failed to register user'});
        } else {
            logit('== in User.addUser: SUCCESS ');
            res.json({success:true, msg:'User registered!'});    
        }    
    });   
});

// route to authenticate users
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user) 
            return res.json({success: false, msg: 'User not found'});
        
        User.comparePassword(password, user.password, (err, isMatch) => {
            logit('USERS::AUTHENTICATE ' + password + ' <><> ' + user.password);
            if(err) throw err;
            if(isMatch){
                const token = jwt.sign(user, config.secret, {
                    expiresIn: 604800 // 1 week
                  });
          
                return res.json(  {
                                success: true,
                                msg: 'Successful authentication!',
                                token: 'JWT '+token,
                                user: {
                                    id: user.id,
                                    name: user.name,
                                    username: user.username,
                                    email: user.email
                                }
                            });
            }else{
                return res.json({success: false, msg: 'Wrong password.'});
            }    
        })
    });    
});

// route to change passwords
router.post('/changepassword', (req, res, next) => {
    const username          = req.body.username;
    const newPassword       = req.body.newPassword;
    
    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user) 
            return res.json({success: false, msg: 'User not found'});
  

    User.updateUser(username, newPassword, (err, user) => {
        //newUser.save((err, user) => {
            logit('== in User.updateUser ' + user);
            if(err) {
                logit('== User.updateUser: ERROR ' + err.json());
                res.json({success:false, msg:'Failed to update user'});
            } else {
                logit('== User.updateUser: SUCCESS ');
                res.json({success:true, msg:'User updated!'});    
            }    
    });   
    });
});

/*    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user) 
            return res.json({success: false, msg: 'User not found'});
        
        return User.updateUser(newPassword);    
        
    });
 */       

// route to get a user's Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    res.json({user: req.user});
  });

// route to load all existing users
router.get('/userlist'  , (req, res, next) => {
    logit('Retrieving all existing users in MongoDB');
    User.find({}).exec((err, users) => {
        if(err)
            res.send('error occured while retrieving users');
        else
            res.json(users);
    });
  });

  router.get('/update/:id-:name-:email-:password-:role-:business-:activationDate-:deactivationDate-:status-:username'
            , (req, res, next) => {
    let editUser = new User ({  
                                _id:req.params.id,
                                name:req.params.name,
                                email:req.params.email,
                                password:req.params.password,
                                role:req.params.role,
                                business:req.params.business,
                                activationDate:req.params.activationDate,
                                deactivationDate:req.params.deactivationDate, 
                                status:req.params.status,
                                username:req.params.username
                                });   
                               
                            // switch back from A as a separator to - to store date in 
                            // dd-mm-yyyy format
                            if(editUser.activationDate !== undefined){
                                var tempDate = editUser.activationDate.replace(/A/g, "-");
                                editUser.activationDate   = tempDate; 
                            }

                            if(editUser.deactivationDate !== undefined) {
                                var tempDate = editUser.deactivationDate.replace(/A/g, "-");
                                editUser.deactivationDate   = tempDate; 
                            }
                            
        logit('USERS::UPDATE ENTERING: ' + editUser);
        User.update(editUser, (err, updatedUser) => {
            if(err) 
                return res.json({success: false, msg: 'Failed to update User ' + err});
            else
                return res.json({success: true, msg: 'Successfully updated User'});
            });
        logit('USERS::UPDATE EXITING');
            
});
module.exports = router;