const mongoose = require('mongoose');
const config = require('../config/database')
const User = require('./user');
const logit = require('../config/svrlogger');

// Mongoose types allowed in a schema:
// String, Number, Date, Boolean, Buffer, ObjectId, Mixed, Array

// Task Schema
const TaskSchema = mongoose.Schema({
    id: { type: Number, required: false },      // ref and must be unique
    description: { type: String, required: true },
    notes: { type: String, required: false },
    status: { type: String, required: true, default: 'open' },
    priority: { type: String, required: true },
    category: { type: String, required: false },
    ddate: { type: String },                       // due date
    address: { type: String },                       // due date
    credos: { type: String },                       // due date
    docuName: { type: String },                       // due date
    username: { type: String, ref: 'User' },          // referring to a single user (username)    
    alerted: { type: Boolean, default: false, required: false }
});

const Task = module.exports = mongoose.model('Task', TaskSchema);

module.exports.getTaskById =
    (id, callback) => Task.findById(id, callback);


module.exports.getTaskByStatus =
    (status, callback) => {
        const query = { status: status }
        Task.find(query, callback);
    }

module.exports.getTaskByCategory =
    (category, callback) => {
        const query = { category: category }
        Task.find(query, callback);
    }

module.exports.addTask = (newTask, callback) => {
    logit('TASK::CREATE TASK CALLED!   ==> ENTERING');

    newTask.save((err) => {
        if (err) {
            logit('Failed to create Task');
            logit(err);
        }
        else {
            logit('Created Task: ' + JSON.stringify(newTask.description));
        }
    });
    logit('TASK::CREATE TASK CALLED!   ==> EXITING');

}


module.exports.getTaskByExternalId =
    (id, callback) => {
        const query = { id: id };
        Task.findOne(query, callback);
    }


// return the max id from DB for this collection
module.exports.maxIdTask = (callback) => {
    logit('TASK::MAX_ID::ENTER');
    const query = { "id": -1 };
    Task.find({}).sort(query).limit(1);
    logit('TASK::MAX_ID::EXIT');
}

module.exports.findMax = (callback) => {
    Task.find({}) // 'this' now refers to the Task class
        .sort({ "id": -1 })
        .limit(1)
        .exec(callback);
}

// return the updated Task object
module.exports.update = (task, callback) => {
    logit('TASK::UPDATE ENTERING , task: ' + task);
    if (task.id == '**' || task.id == null || task.id == undefined) {
        console.log('Looking up the MAX ID for update..');
        Task.findMax((err, maxResult) => { // FIND MAX_ID IN DB TO UPDATE..
            if (err) {
                logit('Failed to read maxID from DB || ' + err);
                return false;
            } else {
                task.id = maxResult[0].id;
                logit('maxID: ' + task.id);
            };
        });
    }

    let max_tries = 2;
    Task.findOne({ id: task.id }, (err, doc) => {
        if (err || doc === null) {
            logit('Failed to find Task to update ' + task.id);
            max_tries--;
            if (max_tries > 0)
                Task.findOne({ id: task.id }, (err, doc) => {
                    if (err || doc === null) {
                        logit('Failed to find Task to update ' + task.id);
                        max_tries--;
                    } else {
                        doc.description = task.description;
                        doc.status = task.status;
                        doc.priority = task.priority;
                        doc.category = task.category;
                        doc.docuName = task.docuName;
                        doc.ddate = task.ddate;
                        doc.notes = null;
                        doc.notes = task.notes;
                        doc.save(function (err) {
                            if (err) logit('Failed to save data: ' + notes);
                        });
                    }
                }) // findOne inside
        } // if err || doc === null
        else {
            doc.description = task.description;
            doc.status = task.status;
            doc.priority = task.priority;
            doc.category = task.category;
            doc.docuName = task.docuName;
            doc.ddate = task.ddate;
            doc.notes = null;
            doc.notes = task.notes;
            doc.save(function (err) {
                if (err) logit('Failed to save data: ' + notes);
            });
        }
    }) // findOne Outside

    logit('TASK::UPDATE EXITING');
}