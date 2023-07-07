const express = require('express');
const Task = require('../models/task');
const config = require('../config/database')
const router = express.Router();
const logit = require('../config/svrlogger');

// ============================== CREATE POST =========================================// 
router.post('/create/', (req, res, next) => {
    console.log(' ==== CREATE::Post_Request_Body: ', req.body)
    let newTask = new Task({
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
        id: '',
        ddate: req.body.ddate,
        category: req.body.category,
        username: req.body.username,
        notes: req.body.notes
    });

    // switch back from A as a separator to - to store date in 
    // dd-mm-yyyy format
    var tempDate = newTask.ddate.replace(/A/g, "-");
    newTask.ddate = tempDate;

    logit('TASKS::CREATE: ' + newTask);
    Task.findMax((err, maxResult) => { // FIND MAX_ID IN DB THEN CREATE..
        if (err) {
            logit('Failed to read maxID from DB || ' + err);
            return false;
        } else {
            newTask.id = maxResult[0].id + 1;
            logit('New maxID: ' + newTask.id);
            Task.addTask(newTask, (err, task) => {
                logit('== in Task.addTask ' + task);
                if (err) {
                    logit('== in Task.addTask: ERROR ' + err);
                    res.json({ success: false, msg: 'Failed to create task' });
                    return false;
                } else {
                    logit('== in Task.addTask: SUCCESS ');
                    res.json({ success: true, msg: 'Task created!' });
                    return true;
                }
            });
        }
    });
    
});

// ============================== UPDATE BASED ON POST ===============================================================//
router.put('/update/', (req, res, next) => {
    console.log(' ==== UPDATE::PUT_Request_Body: ', req.body)

    let editTask = new Task({
        description: req.body.description,
        notes: req.body.notes,
        status: req.body.status,
        priority: req.body.priority,
        id: req.body.id,
        ddate: req.body.ddate,
        category: req.body.category,
        docuName: req.body.docuName,
        username: req.body.username
    });

    // switch back from A as a separator to - to store date in 
    // dd-mm-yyyy format
    //var tempDate = editTask.ddate.replace(/A/g, "-");
    //editTask.ddate = tempDate;

    logit('TASKS::UPDATE ENTERING: ' + editTask);
    Task.update(editTask, (err, updatedTask) => {
        if (err)
            return res.json({ success: false, msg: 'Failed to update task ' + err });
        else
            return res.json({ success: true, msg: 'Successfully updated Task' });
    });
    logit('TASKS::UPDATE EXITING');

});

// ============================== LOAD TASKS LIST ======================================================//
// We categorize taksk into two main categories: ACTIV and PASSIV and ALL
router.get('/tasklist/:username-:option', (req, res, next) => {
    logit('USERNAME FROM REQ.HEADER: ' + req.params.username);
    logit('OPTION FROM REQ.HEADER: ' + req.params.option);
    if (req.params.option == 'ALL' || req.params.option == '' || req.params.option == null) {
        logit('== 1 ==');
        Task.find({ 'username': req.params.username }).exec((err, tasks) => {
            if (err)
                res.send('error occured while retrieving tasks');
            else {
                res.json(tasks);
            }
        });
    } else if (req.params.option == 'ACTIV') {
        logit('== 2 ==');
        Task.find({
            $or: [
                { 'username': req.params.username, 'category': 'Task' },
                { 'username': req.params.username, 'category': 'Aptm' },
                { 'username': req.params.username, 'category': 'Bill' }
            ]
        }).exec((err, tasks) => {
            if (err)
                res.send('error occured while retrieving tasks');
            else {
                res.json(tasks);
            }
        });
    } else if (req.params.option == 'PASSIV') {
        logit('== 3 ==');
        Task.find({
            $or: [
                { 'username': req.params.username, 'category': 'Info' },
                { 'username': req.params.username, 'category': 'HowTo' },
                { 'username': req.params.username, 'category': 'Asset' }
            ]
        }).exec((err, tasks) => {
            if (err)
                res.send('error occured while retrieving tasks');
            else {
                res.json(tasks);
            }
        });
    }/* else if (req.params.option == 'ASSET') {  NOW COVERED IN tab info
        logit('== 3 ==');
        Task.find({
            $or: [
                { 'username': req.params.username, 'category': 'Asset' }
            ]
        }).exec((err, tasks) => {
            if (err)
                res.send('error occured while retrieving tasks');
            else {
                res.json(tasks);
            }
        });
    }*/

});



// ============================== SEARCH USER TASKS ======================================================//
router.get('/search/:search-:username-:notes', (req, res, next) => {
    logit('[==]SEARCH ROUTE -- Retrieving Matching Tasks For User: ' + req.params.username + ', Search Term: ' + req.params.search);
    logit('[==]notes: ' + req.params.notes);
    let term = req.params.search;

    if (req.params.notes == 'exclude_notes') {
        Task.find({
            $or: [
                { 'username': req.params.username, 'description': { $regex: new RegExp(term, "i") } },
                { 'username': req.params.username, 'status': { $regex: new RegExp(term, "i") } },
                { 'username': req.params.username, 'priority': { $regex: new RegExp(term, "i") } },
                { 'username': req.params.username, 'category': { $regex: new RegExp(term, "i") } }
            ]
        }).exec((err, tasks) => {
            if (err)
                res.send('error occured while retrieving tasks');
            else {
                res.json(tasks);
                if (tasks !== null)
                    logit(tasks + '\n' + tasks.length + ' Tasks Loaded for User: ' + req.param('username'));
            }
        });
    } //);
    else if (req.params.notes == 'include_notes') {
        Task.find({
            $or: [
                { 'username': req.params.username, 'description': { $regex: new RegExp(term, "i") } },
                { 'username': req.params.username, 'notes': { $regex: new RegExp(term, "i") } },
                { 'username': req.params.username, 'status': { $regex: new RegExp(term, "i") } },
                { 'username': req.params.username, 'priority': { $regex: new RegExp(term, "i") } },
                { 'username': req.params.username, 'category': { $regex: new RegExp(term, "i") } },
                { 'username': req.params.username, 'credos': { $regex: new RegExp(term, "i") } },
                { 'username': req.params.username, 'docuName': { $regex: new RegExp(term, "i") } },
                { 'username': req.params.username, 'address': { $regex: new RegExp(term, "i") } }
            ]
        }).exec((err, tasks) => {
            if (err)
                res.send('error occured while retrieving tasks');
            else {
                res.json(tasks);
                if (tasks !== null)
                    logit(tasks + '\n' + tasks.length + ' Tasks Loaded for User: ' + req.param('username'));
            }
        });
    } //);

});


// route to delete tasks
// ============================== DELETE A TASK ========================================================//
router.delete('/:id', (req, res, next) => {
    Task.remove({ id: req.params.id }, (err, result) => {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
            logit('TASKS::DELETE, deleted task with id: ' + req.params.id);
        }
    });
});

// NOT REACHABLE FOR SOME REASON
// ============================== UPDATE NOT REACHABLE FOR NOW.. =========================================//
router.put('/update', (req, res, next) => {
    logit('TASKS::PUT: ENTERING');

    let editTask = new Task({
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
        id: req.body.id,
        username: req.body.username,
        ddate: req.body.ddate
    });


    Task.update(editTask, (err, updatedTask) => {
        if (err)
            res.send('Failed to update task: ' + err + ' for task: ' + editTask.id);
        else
            res.json(updatedTask);
    });
});

// ============================== CREATE ORIGINAL  not used =========================================// 
router.get('/create/:description-:status-:priority-:ddate-:category-:username-:notes', (req, res, next) => {
    let newTask = new Task({
        description: req.params.description,
        status: req.params.status,
        priority: req.params.priority,
        id: '',
        ddate: req.params.ddate,
        category: req.params.category,
        username: req.params.username,
        notes: req.params.notes
    });

    // switch back from A as a separator to - to store date in 
    // dd-mm-yyyy format
    var tempDate = newTask.ddate.replace(/A/g, "-");
    newTask.ddate = tempDate;

    logit('TASKS::CREATE: ' + newTask);
    Task.findMax((err, maxResult) => { // FIND MAX_ID IN DB THEN CREATE..
        if (err) {
            logit('Failed to read maxID from DB || ' + err);
            return false;
        } else {
            newTask.id = maxResult[0].id + 1;
            logit('New maxID: ' + newTask.id);
            Task.addTask(newTask, (err, task) => {
                logit('== in Task.addTask ' + task);
                if (err) {
                    logit('== in Task.addTask: ERROR ' + err);
                    res.json({ success: false, msg: 'Failed to create task' });
                    return false;
                } else {
                    logit('== in Task.addTask: SUCCESS ');
                    res.json({ success: true, msg: 'Task created!' });
                    return true;
                }
            });
        }
    });
});

// ============================== UPDATE GET NOT USED FOR NOW MIGRATING TO POST ===============================================================//
router.get('/update/:id-:description-:notes-:status-:priority-:ddate-:category-:docuName-:username', (req, res, next) => {
    let editTask = new Task({
        description: req.params.description,
        notes: req.params.notes,
        status: req.params.status,
        priority: req.params.priority,
        id: req.params.id,
        ddate: req.params.ddate,
        category: req.params.category,
        docuName: req.params.docuName,
        username: req.params.username
    });

    // switch back from A as a separator to - to store date in 
    // dd-mm-yyyy format
    var tempDate = editTask.ddate.replace(/A/g, "-");
    editTask.ddate = tempDate;

    logit('TASKS::UPDATE ENTERING: ' + editTask);
    Task.update(editTask, (err, updatedTask) => {
        if (err)
            return res.json({ success: false, msg: 'Failed to update task ' + err });
        else
            return res.json({ success: true, msg: 'Successfully updated Task' });
    });
    logit('TASKS::UPDATE EXITING');

});


module.exports = router;