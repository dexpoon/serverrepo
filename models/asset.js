const mongoose  = require('mongoose');
const config    = require('../config/database')
const User      = require('./user');
const logit     = require('../config/svrlogger');

// Mongoose types allowed in a schema:
// String, Number, Date, Boolean, Buffer, ObjectId, Mixed, Array

// Asset Schema
const AssetSchema = mongoose.Schema ({
    id:             { type: String, required : true },      // ref and must be unique
    symbol:         { type: String, required: true },       // updatable through UI
    notes:          { type: String, required: false },      // updatable through UI
    wallet:         { type: String, required: false },      // updatable through UI
    count_owned:    { type: Number, required: false },      // updatable through UI
    staked:         { type: Number, required: false },      // updatable through UI
    url:            { type: String, required: false },      // updatable ONLY in DB
    credos:         { type: String, required: false },      // updatable ONLY in DB
    costbasis:      { type: Number, required: false },      // updatable ONLY in DB
    update:         { type: String, required: false },      // date as string when this asset was updated
    username:       { type: String, ref : 'User' }          // referring to a single user (username)    
});

const Asset = module.exports = mongoose.model('Asset', AssetSchema);

module.exports.getAssetById  = 
 (id, callback) => Asset.findById(id, callback);


module.exports.getAssetBySymbol = 
 (symbol, callback) => {
     const query = { symbol : symbol }
     Asset.find(query, callback);
}

// return the updated Task object
module.exports.update = (asset, callback) => {
    logit('ASSET::UPDATE ENTERING , asset: ' + asset);
    Asset.findOne({ id: asset.id }, (err, doc) => {
        if(err || doc === null) {
            let msg = 'Failed to find Asset to update ' + asset.id;
            logit(msg);
        } else { // only update fields with values coming as paramaters
            doc.symbol          = asset.symbol;
            doc.update          = new Date().toDateString(); // date as string when this asset was updated
			//doc.notes           = null;
           
            if(asset.wallet         !== 'XXXXX')
                doc.wallet          = asset.wallet;
            
            if(asset.count_owned    !== 'XXXXX')
                doc.count_owned     = asset.count_owned;
            
            if(asset.staked         !== 'XXXXX')
                doc.staked          = asset.staked;
           
            if(asset.notes          !== 'XXXXX')
                doc.notes           = asset.notes;
           
            doc.save(function(err) {
				if(err) logit('Failed to update Asset: ' + err);
			});
        }
      });
    logit('ASSET::UPDATE EXITING');
}