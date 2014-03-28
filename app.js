/**
 * Module dependencies
 **/

var express          = require('express')
  , http             = require('http')
  , path             = require('path')
  , routes           = require('./routes')
  , user             = require('./routes/user')
  , favicon          = require('static-favicon')
  , logger           = require('morgan')
  , stylus           = require('stylus')
  , nib              = require('nib')
  , cookieParser     = require('cookie-parser')
  , bodyParser       = require('body-parser')
  , EmployeeProvider = require('./employeeprovider').EmployeeProvider;

var app = express();

// view engine setup
app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});

  app.use(favicon());
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(cookieParser());
  app.use(express.methodOverride())
  app.use(app.router);
  app.use(require('stylus').middleware(path.join(__dirname, '/public')));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

function compile (str, path) {
  return stylus(str)
            .use(nib())
}

app.use(stylus.middleware({
  src: __dirname + '/public'
, compile: compile
}));

var employeeProvider = new EmployeeProvider('localhost', 27017);

// Routes

// index
app.get('/', function (req, res) {
  employeeProvider.findAll(function (error, emps) {
    res.render('index', {
      title: 'Employees'
    , employees: emps
    });
  });
});

// new employees
app.get('/employee/new', function (req, res) {
  res.render('employee_new', {
    title: 'New Employee'
  });
});

// save new employee
app.post('/employee/new', function(req, res){
    employeeProvider.save({
        title: req.param('title'),
        name: req.param('name')
    }, function( error, docs) {
        res.redirect('/')
    });
});

//update an employee
app.get('/employee/:id/edit', function(req, res) {
	employeeProvider.findById(req.param('_id'), function(error, employee) {
		res.render('employee_edit',
		{
			title: employee.title,
			employee: employee
		});
	});
});

//save updated employee
app.post('/employee/:id/edit', function(req, res) {
	employeeProvider.update(req.param('_id'),{
		title: req.param('title'),
		name: req.param('name')
	}, function(error, docs) {
		res.redirect('/')
	});
});

//delete an employee
app.post('/employee/:id/delete', function(req, res) {
	employeeProvider.delete(req.param('_id'), function(error, docs) {
		res.redirect('/')
	});
});

// update an employee

app.get('/employee/:id/edit', function (req, res) {
  employeeProvider.findById(req.param('_id')
    , function (error, employee) {
        res.render('employee_edit', {
          employee: employee
        });
    });
});

// save udated employee

app.post('/employee/:id/edit', function (req, res) {
  employeeProvider.update(req.param('id'), {
    title: req.param('title')
  , name: req.param('name')
  }, function (error, docs) {
    res.redirect('/')
  });
});

// delete an employee

app.post('/employee/:id/delete', function (req, res) {
  employeeProvider.delete(req.param('_id')
    , function (error, docs) {
        res.redirect('/')
    });
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
