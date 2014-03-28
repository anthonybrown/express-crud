var Db = require('mongodb').Db
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server
  , BSON = require('mongodb').BSON
  , ObjectID = require('mongodb').ObjectID;

EmployeeProvider = function (host, port) {
  this.db = new Db('node-mongo-employee'
      , new Server(host, port, {safe: false}, {auto_reconnect: true}, {}), {w:1});
  this.db.open(function () {});
};

EmployeeProvider.prototype.getCollection = function (callback) {
  this.db.collection('employees', function (error, employee_collection) {
    if (error) {
      callback(error);
    } else {
      callback(null, employee_collection);
    }
  });
};

// find all employees

EmployeeProvider.prototype.findAll = function (callback) {
  this.getCollection(function (error, employee_collection) {
    if (error) {
      callback(error);
    } else {
      employee_collection.find().toArray(function(error, results) {
        if (error) {
          callback(error)
        } else {
          callback(null, results)
        }
      });
    }
  });
};

// save new employee

EmployeeProvider.prototype.save = function(employees, callback) {
  this.getCollection(function (error, employee_collection) {
    if (error) {
      callback(error)
    } else {
      if (typeof(employees.length) == 'undefined') {
        employees = [employees];
      }

      for(var i = 0; i < employees.length; i++) {
        employee = employees[i];
        employee.created_at = new Date();
      }

      employee_collection.insert(employees, function () {
        callback(null, employees);
      });
    }
  });
};

// find an employee by ID

EmployeeProvider.prototype.findById = function (id, callback) {
  this.getCollection(function(error, employee_collection) {
    if (error) {
      callback(error);
    } else {
      employee_collection.findOne({
        _id: employee_collection.db.bson_serializer.ObjectID.createFromHexString(id)
      }, function (error, result) {
            if (error) {
              callback(error)
            } else {
              callback(null, result);
            }
      });
    }
  });
};

// update an employee

EmployeeProvider.prototype.update = function (employeeId, employees, callback) {
  this.getCollection(function (error, employee_collection) {
    if (error) {
      callback(error);
    } else {
      employee_collection.update({
        _id: employee_collection.db.bson_serializer.ObjectID.createFromHexString(employeeId)
      }
        , employees
        , function (error, employees) {
            if (error) {
              callback(error);
            } else {
              callback(null, employees);
            }
        });
    }
  });
};

// delete employee

EmployeeProvider.prototype.delete = function (employeeId, callback) {
  this.getCollection(function (error, employee_collection) {
    if (error) callback(error);
    else {
      employee_collection.remove({
        _id: employee_collection.db.bson_serializer.ObjectID.createFromHexString(employeeId)
      }
      , function (error, employee) {
          if (error) {
            callback(error);
          } else {
            callback(null, employee);
          }
      });
    }
  });
};

exports.EmployeeProvider = EmployeeProvider;
