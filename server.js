require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');

  const createSignupTrigger = `
    CREATE TRIGGER after_signup_insert
    AFTER INSERT ON signup
    FOR EACH ROW
    BEGIN
      INSERT INTO login (name, password) VALUES (NEW.name, NEW.password);
    END
  `;

  const createUpdateTrigger = `
    CREATE TRIGGER after_signup_update
    AFTER UPDATE ON signup
    FOR EACH ROW
    BEGIN
      UPDATE login SET name = NEW.name, password = NEW.password WHERE name = OLD.name;
    END
  `;

  db.query(createSignupTrigger, (err, result) => {
    if (err) console.log('Signup trigger already exists');
    else console.log('Signup trigger created');
  });

  db.query(createUpdateTrigger, (err, result) => {
    if (err) console.log('Update trigger already exists');
    else console.log('Update trigger created');
  });
});

app.post('/login', (req, res) => {
  const { name, password } = req.body;

  const sql = 'SELECT * FROM login WHERE name = ?';
  db.query(sql, [name], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      if (password === result[0].password) {
        res.json({ status: 'success', message: 'Login successful' });
      } else {
        res.json({ status: 'error', message: 'Invalid name or password' });
      }
    } else {
      res.json({ status: 'error', message: 'Invalid name or password' });
    }
  });
});

app.post('/signup', (req, res) => {
  const { name, email, password, mobile } = req.body;

  const sql = 'INSERT INTO signup (name, email, password, mobile) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, password, mobile], (err, result) => {
    if (err) throw err;

    res.json({ status: 'success', message: 'User created successfully' });
  });
});

app.get('/items', (req, res) => {
  const sql = 'SELECT * FROM items';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/items/:id', (req, res) => {
  const sql = 'SELECT * FROM items WHERE item_id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

app.post('/items', (req, res) => {
  const { name, category, price, quantity, description, weight } = req.body;
  const sql = 'INSERT INTO items (name, category, price, quantity, description, weight) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, category, price, quantity, description, weight], (err, result) => {
    if (err) throw err;
    res.json({ status: 'success', message: 'Item created successfully' });
  });
});

app.put('/items/:id', (req, res) => {
  const { name, category, price, quantity, description, weight } = req.body;
  const sql = 'UPDATE items SET name = ?, category = ?, price = ?, quantity = ?, description = ?, weight = ? WHERE item_id = ?';
  db.query(sql, [name, category, price, quantity, description, weight, req.params.id], (err, result) => {
    if (err) throw err;
    res.json({ status: 'success', message: 'Item updated successfully' });
  });
});


app.delete('/items/:id', (req, res) => {
    const sql = 'DELETE FROM items WHERE item_id = ?';
    db.query(sql, [req.params.id], (err, result) => {
      if (err) throw err;
      res.json({ status: 'success', message: 'Item deleted successfully' });
    });
});

app.get('/customer', (req, res) => {
  const { phone_number } = req.query;

  const sql = 'SELECT * FROM customer WHERE phone_number = ?';
  db.query(sql, [phone_number], (err, result) => {
    if (err) throw err;

    res.json(result);
  });
});

app.post('/customer', (req, res) => {
  const { name, phone_number, email } = req.body;

  const sql = 'INSERT INTO customer (name, phone_number, email) VALUES (?, ?, ?)';
  db.query(sql, [name, phone_number, email], (err, result) => {
    if (err) throw err;

    res.json({ status: 'success', message: 'Customer created successfully', customer: { id: result.insertId } });
  });
});

app.post('/bill', (req, res) => {
  const { customer_id, items } = req.body;

  items.forEach(item => {
    const { name, quantity, price, total } = item; 
    const priceNumber = Number(price.replace('Rs ', ''));
  
    const sql = 'INSERT INTO bill (customer_id, item_name, quantity, price, total) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [customer_id, name, quantity, priceNumber, total], (err, result) => { // Changed 'item_name' to 'name'
      if (err) throw err;
    });
  });

  res.json({ status: 'success', message: 'Bill created successfully' });
});

app.get('/bill/totalSalesOverall', (req, res) => {
  const { customer_id, startDate, endDate } = req.query;
  let sql = `SELECT SUM(total) AS total_sales FROM bill WHERE 1=1`;
  let params = [];

  if (customer_id) {
    sql += ' AND customer_id = ?';
    params.push(customer_id);
  }
  if (startDate && endDate) {
    sql += ' AND sale_date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  db.query(sql, params, (err, result) => {
    if (err) throw err;
    res.json({ status: 'success', total_sales: result[0].total_sales });
  });
});

app.get('/bill/salesCountOverall', (req, res) => {
  const { customer_id, startDate, endDate } = req.query;
  let sql = `SELECT COUNT(*) AS sales_count FROM bill WHERE 1=1`;
  let params = [];

  if (customer_id) {
    sql += ' AND customer_id = ?';
    params.push(customer_id);
  }
  if (startDate && endDate) {
    sql += ' AND sale_date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  db.query(sql, params, (err, result) => {
    if (err) throw err;
    res.json({ status: 'success', sales_count: result[0].sales_count });
  });
});
app.listen(process.env.PORT || '5000', () => {
  console.log(`Server started on port ${process.env.PORT || '5000'}`);
});