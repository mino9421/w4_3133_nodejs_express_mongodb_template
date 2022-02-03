const express = require('express');
const employeeModel = require('../models/Employee');
const app = express();

//Read ALL
//http://localhost:8081/employees
app.get('/employees', async (req, res) => {
  const employees = await employeeModel.find({});
  //Sorting
  //use "asc", "desc", "ascending", "descending", 1, or -1
  //const employees = await employeeModel.find({}).sort({'firstname': -1});
  
  //Select Specific Column
  //const employees = await employeeModel.find({}).select("firstname lastname salary").sort({'salary' : 'desc'});  
  
  try {
    console.log(employees[0].surname)
    res.status(200).send(employees);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Read By ID
//http://localhost:8081/employee?id=60174acfcde1ab2e78a3a9b0
app.get('/employee', async (req, res) => {
  //const employees = await employeeModel.find({_id: req.query.id});
  //const employees = await employeeModel.findById(req.query.id);
  const employees = await employeeModel.find({_id: req.query.id}).select("firstname lastname salary");

  try {
    res.send(employees);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Search By First Name - PATH Parameter
//http://localhost:8081/employees/firstname/pritesh
app.get('/employees/firstname/:name', async (req, res) => {
  const name = req.params.name
  const employees = await employeeModel.find({firstname : name});
  
  //Using Virtual Field Name
  console.log(employees[0].fullname)

  //Using Instance method
  console.log(employees[0].getFullName())

  //Using Instance method
  console.log(employees[0].getFormatedSalary())

  try {
    if(employees.length != 0){
      res.send(employees);
    }else{
      res.send(JSON.stringify({status:false, message: "No data found"}))
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

//Search By First Name OR Last Name
//http://localhost:8081/employees/search?firstname=pritesh&lastname=patel
app.get('/employees/search', async (req, res) => {
  //console.log(req.query)
  if(Object.keys(req.query).length != 2){
    res.send(JSON.stringify({status:false, message: "Insufficient query parameter"}))
  }else{
    const fname = req.query.firstname
    const lname = req.query.lastname
    //{ $or: [{ name: "Rambo" }, { breed: "Pugg" }, { age: 2 }] },
    //const employees = await employeeModel.find({ $and: [{firstname : fname}, {lastname : lname}]});
    const employees = await employeeModel.find({ $or: [{firstname : fname}, {lastname : lname}]});
    ///Use below query for AND condition
    //const employees = await employeeModel.find({firstname : fname, lastname : lname});

    try {
      if(employees.length != 0){
        res.send(employees);
      }else{
        res.send(JSON.stringify({status:false, message: "No data found"}))
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
});


//Search By salary > 1000
//http://localhost:8081/employees/salary?value=1000
app.get('/employees/salary', async (req, res) => {
  //console.log(req.query)
  if(Object.keys(req.query).length != 1){
    res.send(JSON.stringify({status:false, message: "Insufficient query parameter"}))
  }else{
    const salary = req.query.value
  
    //const employees = await employeeModel.find({salary : {$gte : salary}});
    const employees = await employeeModel.find({}).where("salary").gte(salary);
    // <= 10000
    //const employees = await employeeModel.find({salary : {$lte : salary }});
    
    try {
      if(employees.length != 0){
        res.send(employees);
      }else{
        res.send(JSON.stringify({status:false, message: "No data found"}))
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
});

//Some more test queries
//http://localhost:8081/employees/test
app.get('/employees/test', async (req, res) => {
  try {
    const employees = employeeModel.
                        find({})
                        .where('lastname').equals('patel')
                        .where('salary').gte(1000.00).lte(10000.00)
                        .where('firstname').in(['pritesh', 'moksh'])
                        .limit(10)
                        .sort('-salary')
                        .select('firstname lastname salary')
                        .exec((err, data) => {
                          if (err){
                              res.send(JSON.stringify({status:false, message: "No data found"}));
                          }else{
                              res.send(data);
                          }
                        });
    } catch (err) {
      res.status(500).send(err);
    }
});

//Create New Record
/*
    //Sample Input as JSON
    //application/json as Body
    {
      "firstname":"Pritesh",
      "lastname":"Patel",
      "email":"p@p.com",
      "gender":"Male",
      "city":"Toronto",
      "designation":"Senior Software Engineer",
      "salary": 10000.50
    }
*/
//http://localhost:8081/employee
app.post('/employee', async (req, res) => {
  
    console.log(req.body)
    const employee = new employeeModel(req.body);
    
    try {
      await employee.save((err) => {
        if(err){
          //Custome error handling
          //console.log(err.errors['firstname'].message)
          //console.log(err.errors['lastname'].message)
          //console.log(err.errors['gender'].message)
          //console.log(err.errors['salary'].message)
          res.send(err)
        }else{
          res.send(employee);
        }
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });

//Update Record
//http://localhost:8081/employee/60174acfcde1ab2e78a3a9b0
app.patch('/employee/:id', async (req, res) => {
  try {
    console.log(req.body)
    const employee =  await employeeModel.findOneAndUpdate({ _id: req.params.id}, req.body, {new: true})
    //const employee =  await employeeModel.findByIdAndUpdate(req.params.id, req.body, {new: true})
    res.send(employee)
  } catch (err) {
    res.status(500).send(err)
  }
})

//Delete Record by ID
//http://localhost:8081/employee/5d1f6c3e4b0b88fb1d257237
app.delete('/employee/:id', async (req, res) => {
    try {
      const employee = await employeeModel.findByIdAndDelete(req.params.id)

      if (!employee) 
      {
        res.status(404).send(JSON.stringify({status: false, message:"No item found"}))
      }else{
        res.status(200).send(JSON.stringify({status: true, message:"Record Deleted Successfully"}))
      }
    } catch (err) {
      res.status(500).send(err)
    }
  })

  //Delete Record using findOneAndDelete()
//http://localhost:8081/employee/delete?emailid=5d1f6c3e4b0b88fb1d257237
app.get('/employee/delete', async (req, res) => {
  try {
    const employee = await employeeModel.findOneAndDelete({email: req.query.emailid})

    if (!employee) 
    {
      res.status(404).send(JSON.stringify({status: false, message:"No item found"}))
    }else{
      //employee.remove() //Update for Mongoose v5.5.3 - remove() is now deprecated
      res.status(200).send(JSON.stringify({status: true, message:"Record Deleted Successfully"}))
    }
  } catch (err) {
    res.status(500).send(err)
  }
})
module.exports = app

//Insert Multiple Records
/*
employeeModel.create(
  [{"firstname":"Keriann","lastname":"Qualtro","email":"kqualtro3@mediafire.com","gender":"Female","city":"Ulricehamn","designation":"Nurse Practicioner","salary":"9288.95"},
  {"firstname":"Bette","lastname":"Elston","email":"belston4@altervista.org","gender":"Female","city":"Xinhang","designation":"Staff Accountant III","salary":"3086.99"},
  {"firstname":"Editha","lastname":"Feasby","email":"efeasby5@ovh.net","gender":"Female","city":"San Francisco","designation":"Mechanical Systems Engineer","salary":"1563.63"},
  {"firstname":"Letizia","lastname":"Walrond","email":"lwalrond6@ibm.com","gender":"Male","city":"Ricardo Flores Magon","designation":"Research Associate","salary":"6329.05"},
  {"firstname":"Molly","lastname":"MacTrustrie","email":"mmactrustrie7@adobe.com","gender":"Female","city":"Banjarejo","designation":"Quality Control Specialist","salary":"4059.61"}]
)
*/