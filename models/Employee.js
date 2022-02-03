const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Please Enter First Name"],
    trim: true,
    lowercase:true
  },
  lastname: {
    type: String,
    alias: 'surname', //Family name
    required: [true, "Please Enter First Name"],
    trim: true,
    lowercase:true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase:true,
    minlength: 5,
    maxlength: 50,
    //custom validator for email
    validate: function(value) {
      var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      return emailRegex.test(value);
    }
  },
  gender: {
    type: String,
    require: true,
    enum: ['male', 'female', 'other']
  },
  city:{
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: Number,
    default: 0.0,
    min: [1000, 'low salary'],
    max: 25000,
    required: true,
    trim: true,
    validate: function(value) {
      if(value < 0){
        throw new Error("negative salary not allowed")
      }
    }
  },
  created: { 
    type: Date,
    default: Date.now,
    alias: 'createdat'
  },
  updatedat: { 
    type: Date,
    default: Date.now
  },
});

//Declare Virtual Fields
EmployeeSchema.virtual('fullName')
.get(function() {
  return `${this.firstname} ${this.lastname}`
})
.set(function(value) {
  console.log(value)
})

//Custom Schema Methods
//1. Instance Method Declaration
EmployeeSchema.methods.getFullName = function() {
  return `${this.firstname} ${this.lastname}`
}

EmployeeSchema.methods.getFormatedSalary = function() {
  return `$${this.salary}`
}

//2. Static method declararion
EmployeeSchema.static("getEmployeeByFirstName", function(value) {
  return this.find({firstname: value})
});

//Writing Query Helpers
EmployeeSchema.query.byFirstName = function(fnm) {
  return this.where({firstname: fnm})
}

// Moddleware
EmployeeSchema.pre('save', (next) => {
  console.log("Before Save")
  let now = Date.now()
   
  this.updatedat = now
  // Set a value for createdAt only if it is null
  if (!this.created) {
    this.created = now
  }
  
  // Call the next function in the pre-save chain
  next()
});

EmployeeSchema.pre('findOneAndUpdate', (next) => {
  console.log("Before findOneAndUpdate")
  let now = Date.now()
  this.updatedat = now
  console.log(this.updatedat)
  next()
});


EmployeeSchema.post('init', (doc) => {
  console.log('%s has been initialized from the db', doc._id);
});

EmployeeSchema.post('validate', (doc) => {
  console.log('%s has been validated (but not saved yet)', doc._id);
});

EmployeeSchema.post('save', (doc) => {
  console.log('%s has been saved', doc._id);
});

EmployeeSchema.post('remove', (doc) => {
  console.log('%s has been removed', doc._id);
});

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;