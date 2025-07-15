// Every time copy this and paste into index.js  run the apis
//

const express = require('express');
const sql = require('mssql');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
const PORT = 3000;

// SQL Server config
const sqlConfig = {
    user: 'AlWessil',
    password: 'P@ssw0rd1',
    server: 'AWH-FILESRV',
    database: 'EmployeeDB',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// MongoDB config
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const employeeSchema = new mongoose.Schema({}, { strict: false });
const Employee = mongoose.model('Employee', employeeSchema);

// Route 1: GET employees from SQL
app.get('/employees', async (req, res) => {
    try {
        const pool = await sql.connect(sqlConfig);
        const result = await pool.request().query('SELECT * FROM EmployeeData');
        console.log(result.recordset); // 👈 Console output
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data');
    }
});

// Route 2: GET employees from SQL and push to MongoDB
app.post('/employees/sync', async (req, res) => {
    try {
        const pool = await sql.connect(sqlConfig);
        const result = await pool.request().query('SELECT * FROM EmployeeData');
        const employees = result.recordset;

        // Optional: Clear collection before inserting (depends on your needs)
        await Employee.deleteMany({});

        await Employee.insertMany(employees);

        console.log(`Inserted ${employees.length} records into MongoDB`);
        res.send(`Inserted ${employees.length} records into MongoDB`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error syncing data');
    }
});
    
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

