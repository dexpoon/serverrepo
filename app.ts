let express     = require('express')
let path        = require('path')
let bodyParser  = require('body-parser')
let cors        = require('cors')
const passport  = require('passport');
let mongoose    = require('mongoose')
let config      = require('./config/database')
let logit       = require('./config/svrlogger')
let deploy      = require('./config/deploy')
let os          = require('os')

// connect to db using Mongoose
// Connect to AWS MongoDB Remote
//mongoose.connect(config.awsDB, { useMongoClient: true });

// db defaults to local DB
let db = config.localDB
let IPv4_IPs: any[] = []

if(deploy.LOCAL == true) {
    db = config.localDB;
}else 
if(deploy.DOCKER == true) {
    /*  Leaving this here in case I need it for something else
        This does not work, because running outside Docker, I get different IPs than inside Docker
        Docker only shows 2 Network Interfaces eth0 IP and lo for loopback 127.0.01
        and both IPs do not work
        Running this code here generates Ips that do work, but only when running from outside Docker..
        var interfaces = os.networkInterfaces();
        for (var key in interfaces) {
        var interfaceInfo=interfaces[key];
        console.log("key:", key)
        interfaceInfo.forEach(element => {    
            if(element.family == 'IPv4') 
            IPv4_IPs.push(element.address)
    });  
    }*/
    db = config.dockerDB;
 
}else
if(deploy.AWS ==true) {
    db = config.awsDB;
}


mongoose.connect(db, { useMongoClient: true });
//mongoose.Promise = global.Promise
mongoose.connection.on('connected', () => logit('Connected to: '+ db))
mongoose.connection.on('error', (err) => logit('Database error: ' + err))

// enable express
var app = express();

// enable parser to process forms
app.use(bodyParser.urlencoded({ extended: true })); // add support for url encoded req.body params
app.use(bodyParser.json()); // support for json req.body params

// enable Cross Origin Resource Sharing for all domains
app.use(cors());

// password middleware
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// point to the routers for users and tasks..
let assets      = require('./routes/assets');
let users       = require('./routes/users');
let tasks       = require('./routes/tasks');

app.use('/assets',      assets);
app.use('/users',       users);
app.use('/tasks',       tasks);

// set static folder for index.html
app.use(express.static(path.join(__dirname, 'public')));

// start server..
const PORT = 4444;
app.listen(process.env.PORT || PORT, () => logit('Server started on port: ' + PORT + ' ==== ' + new Date))