const express   = require('express');
const Asset      = require('../models/asset');
const logit     = require('../config/svrlogger');

const router    = express.Router();

// NOTE: WE DON;T HAVE CREATE FRO ASSETS, THEY ARE INSERTED VIA SCRIPT DIRECTLY INTO THE DATABASE AS THIS IS REFERENCE DATA
// IS NOT CREATED ALWAYS

// ============================== LOAD ASSET LIST FOR DISPLAY ======================================================//
router.get('/assetlist/:username'  , (req, res, next) => {
    
    logit('ASSETLIST::ENTERING');
   
    Asset.find({'username' : req.params.username}).exec((err, assets) => {
         if(err)
             res.send('error occured while retrieving assets');
         else{
             res.json(assets);
         }
     });
 
     logit('ASSETLIST::EXITING');

    });

// ============================== UPDATE ===============================================================//
router.put('/update/', (req, res, next) => {
    console.log(' ===== ASSET::UPDATE_PUT_REQUEST: ', req.body)
    let editAsset = new Asset ({  
                                symbol:req.body.symbol,
                                notes:req.body.notes,
                                wallet:req.body.wallet,
                                count_owned:req.body.count_owned,
                                id:req.body.id,
                                staked:req.body.staked,
                                username:req.body.username
                                });   

                            // switch back from A as a separator to - to store date in 
                            // dd-mm-yyyy format
                            //var tempDate = editAsset.update.replace(/A/g, "-");
                            //editAsset.update   = tempDate;   

        logit('ASSET::UPDATE ENTERING: ' + editAsset);
        Asset.update(editAsset, (err, updatedAsset) => {
            if(err) 
                return res.json({success: false, msg: 'Failed to update Asset ' + err});
            else
                return res.json({success: true, msg: 'Successfully updated Asset'});
            });
        logit('ASSET::UPDATE EXITING');
        
});

// ============================== UPDATE GET NOT USED SWITCHING TO PUT ===============================================================//
router.get('/update/:id-:symbol-:notes-:wallet-:count_owned-:staked-:username', (req, res, next) => {
    let editAsset = new Asset ({  
                                symbol:req.params.symbol,
                                notes:req.params.notes,
                                wallet:req.params.wallet,
                                count_owned:req.params.count_owned,
                                id:req.params.id,
                                staked:req.params.staked,
                                username:req.params.username
                                });   

                            // switch back from A as a separator to - to store date in 
                            // dd-mm-yyyy format
                            //var tempDate = editAsset.update.replace(/A/g, "-");
                            //editAsset.update   = tempDate;   

        logit('ASSET::UPDATE ENTERING: ' + editAsset);
        Asset.update(editAsset, (err, updatedAsset) => {
            if(err) 
                return res.json({success: false, msg: 'Failed to update Asset ' + err});
            else
                return res.json({success: true, msg: 'Successfully updated Asset'});
            });
        logit('ASSET::UPDATE EXITING');
        
});


module.exports = router;