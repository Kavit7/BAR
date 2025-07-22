const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
app.use(bodyParser.json())
app.use(cors({
    origin: 'http://localhost:5173/Bar/', // your React/Vite frontend URL
    credentials: true
}));
app.use(express.json())
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});
app.use(session({
    secret: 'Bar@Kavit123', // change this to something strong
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true in production (HTTPS)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));
// First create the database if it doesn't exist
connection.query('CREATE DATABASE IF NOT EXISTS business_tracker', (err) => {
    if (err) {
        console.error('Error creating database:', err.message);
        return;
    }
connection.query(`USE business_tracker`)
connection.query(`CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50),
  password VARCHAR(100)
);`, (err)=> {
       console.log('Admin table created') 
    } )
    connection.query(`CREATE TABLE IF NOT EXISTS products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  buying_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  stock DECIMAL(10,2)
);`,
        (err)=> {
       console.log('Product table created') 
    })
connection.query(`CREATE TABLE IF NOT EXISTS sales (
            sale_id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT,
            quantity_sold INT,
            sale_date DATE,
            FOREIGN KEY (product_id) REFERENCES products(product_id)
        )`, (err) => {
            if (err) throw err;
            console.log('sales table created');
});
    connection.query(`CREATE TABLE IF NOT EXISTS expenses (
            expense_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            amount DECIMAL(10,2),
            date DATE
        )`, (err) => {
            if (err) throw err;
            console.log('expenses table created');
    });
    connection.query(`CREATE TABLE IF NOT EXISTS daily_sales_summary (
  summary_id INT AUTO_INCREMENT PRIMARY KEY,
  summary_date DATE UNIQUE,
  total_sales DECIMAL(10,2)
)`, (err) => {
  if (err) throw err;
  console.log('daily_sales_summary table created');
});
connection.query(`CREATE TABLE IF NOT EXISTS product_sales_summary (
    summary_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    quantity_sold INT,
    total_sale_amount DECIMAL(10,2),
    summary_date DATE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
)`, (err) => {
    if (err) throw err;
    console.log('product_sales_summary table created');
});

    console.log('Database ensured.');

    // Connect to the created database
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'business_tracker'
    });

    db.connect((err) => {
        if (err) {
            console.error('Failed to connect to business_tracker database:', err.message);
            return;
        }

        console.log('Connected to business_trackers database successfully');

        // You can place your table creation queries here if needed
    });
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    connection.query(
        'SELECT * FROM business_tracker.admin WHERE username = ?',
        [username],
        (err, results) => {
            if (err) {
                console.error('Database error during login:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length === 0 || results[0].password !== password) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = results[0];

            // Store user in session
           const Info= req.session.user = {
                id: user.id,
                username: user.username
            };

            res.json({
                success: true,
                message:`welcome ${req.session.user.username} Your Logged in successful`,
                user: Info
            });
        }
    );
});
//Login mildware 
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next()
    }
    else {
        res.status(401).json({error:'Unauthorized'})
    }
}


app.get('/product',isAuthenticated, (req, res) => {
    connection.query('SELECT * FROM products', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json(results);
    });
});
app.post("/add", (req, res) => {
    const { name, selling, buying, stock } = req.body
    const sql = "insert into products (name,selling_price,buying_price,stock) values (?,?,?,?) "
    connection.query(sql, [name, selling, buying, stock], (err, result) => {
        if (err) {
            res.json({ error: "fail to connect to database" })
            return;
        }
        res.json({message:"Data added Successfully", result })
    })
    
})
app.get("/edit/data/:id", (req, res) => {
    const id = req.params.id
    const sql = ` select name,selling_price,buying_price,stock from products where product_id =?`
    connection.query(sql, [id], (err, result) => {
        if (err) {
           return  res.json({error:"failed to load the data "})
        }
        res.json({message:"data obtained successfully ...",result})
    })
})
app.put("/edit/:id", (req, res) => {
    const id  = req.params.id
    const { name, selling, buying, stock, } = req.body
    const sql = `UPDATE products
    SET name=?,selling_price=?,buying_price=?,stock=? where product_id=?`
    connection.query(sql, [name, selling, buying, stock,id], (err, result) => {
        if (err) {
            res.json({ error: "Failed to update the product" })
            return
        }
     res.json({message : "Product updated successful",result})
    })
})
app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM products WHERE product_id=?'; // Use correct column name (if yours is product_id)

    connection.query(sql, [id], (err, result) => {
        if (err) {
            return res.json({ error: "Failed to delete the product" });
        }
        res.json({ message: "Product deleted successfully" });
    });
});
app.post('/api/save-sales', (req, res) => {
  const { sales } = req.body;
  const today = new Date().toISOString().slice(0, 10);
  let totalDaySales = 0;
  let completed = 0;
  let hasError = false;

  if (sales.length === 0) {
    return res.status(400).json({ message: 'No sales data provided' });
  }

  sales.forEach(({ product_id, quantity_sold }) => {
    if (hasError) return;

    // Step 1: Check stock availability
    connection.query(
      'SELECT stock, selling_price FROM products WHERE product_id = ?',
      [product_id],
      (err, results) => {
        if (err || results.length === 0) {
          hasError = true;
          return res.status(500).json({ message: 'Failed to retrieve product info' });
        }

        const { stock, selling_price } = results[0];

        if (quantity_sold > stock) {
          hasError = true;
          return res.status(400).json({ message: `Quantity exceeds available stock for product ${product_id}` });
        }

        // Step 2: Insert into sales
        connection.query(
          'INSERT INTO sales (product_id, quantity_sold, sale_date) VALUES (?, ?, ?)',
          [product_id, quantity_sold, today],
          (err) => {
            if (err) {
              hasError = true;
              return res.status(500).json({ message: 'Failed to save sales' });
            }

            totalDaySales += selling_price * quantity_sold;

            // Step 3: Update stock by subtracting quantity sold 👇👇👇
            connection.query(
              'UPDATE products SET stock = stock - ? WHERE product_id = ?',
              [quantity_sold, product_id],
              (err) => {
                if (err) {
                  hasError = true;
                  return res.status(500).json({ message: 'Failed to update stock' });
                }

                completed++;

                if (completed === sales.length && !hasError) {
                  connection.query(
                    `INSERT INTO daily_sales_summary (summary_date, total_sales) VALUES (?, ?)
                     ON DUPLICATE KEY UPDATE total_sales = total_sales + ?`,
                    [today, totalDaySales, totalDaySales],
                    (err) => {
                      if (err) {
                        return res.status(500).json({ message: 'Failed to update daily summary' });
                      }
                      res.json({ message: 'Sales saved, stock updated, and daily summary updated!' });
                    }
                  );
                }
              }
            );
          }
        );
      }
    );
  });
});
// 👉 Get all expenses (optionally filter by date)
app.get('/api/expenses', (req, res) => {
  const { date } = req.query;
  const query = date
    ? `SELECT * FROM expenses WHERE date = ? ORDER BY expense_id DESC`
    : `SELECT * FROM expenses ORDER BY expense_id DESC`;

  connection.query(query, date ? [date] : [], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results.map(exp => ({
      id: exp.expense_id,
      description: exp.name,
      amount: exp.amount,
      date: exp.date
    })));
  });
});

// 👉 Add new expense
app.post('/api/expenses', (req, res) => {
  const { description, amount } = req.body;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  connection.query(
    `INSERT INTO expenses (name, amount, date) VALUES (?, ?, ?)`,
    [description, amount, today],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to insert expense' });
      res.json({ message: 'Expense added' });
    }
  );
});

// 👉 Update an expense
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { description, amount } = req.body;

  connection.query(
    `UPDATE expenses SET name = ?, amount = ? WHERE expense_id = ?`,
    [description, amount, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update expense' });
      res.json({ message: 'Expense updated' });
    }
  );
});

// 👉 Delete an expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;

  connection.query(
    `DELETE FROM expenses WHERE expense_id = ?`,
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete expense' });
      res.json({ message: 'Expense deleted' });
    }
  );
});
app.get('/report', (req, res) => {
    let { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    // HTML date input always sends YYYY-MM-DD format
    const formattedDate = date; // No need for conversion

    const results = {
        success: true,
        daily: {},  // Changed structure to match frontend
        products: [] // Changed from product_report to products
    };

    const salesQuery = `
        SELECT IFNULL(SUM(s.quantity_sold * p.selling_price), 0) AS total_sales
        FROM sales s
        JOIN products p ON s.product_id = p.product_id
        WHERE s.sale_date = ?`;

    const expensesQuery = `
        SELECT IFNULL(SUM(amount), 0) AS total_expenses
        FROM expenses
        WHERE date = ?`;

    const productReportQuery = `
        SELECT p.name, 
               SUM(s.quantity_sold) AS quantity_sold, 
               SUM(s.quantity_sold * p.selling_price) AS total_sale_amount
        FROM sales s
        JOIN products p ON s.product_id = p.product_id
        WHERE s.sale_date = ?
        GROUP BY s.product_id`;

    connection.query(salesQuery, [formattedDate], (err, salesResult) => {
        if (err) return res.status(500).json({ error: 'Failed to get sales' });

        results.daily.total_sales = salesResult[0].total_sales;

        connection.query(expensesQuery, [formattedDate], (err, expensesResult) => {
            if (err) return res.status(500).json({ error: 'Failed to get expenses' });

            results.daily.total_expenses = expensesResult[0].total_expenses;

            connection.query(productReportQuery, [formattedDate], (err, productResults) => {
                if (err) return res.status(500).json({ error: 'Failed to get product report' });

                results.products = productResults;
                res.json(results);
            });
        });
    });
});
// Add this route to your existing Node.js server
app.get('/api/dashboard-stats',isAuthenticated, (req, res) => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Query to get total expenses (all time)
    const expensesQuery = `
        SELECT IFNULL(SUM(amount), 0) AS total_expenses 
        FROM expenses
    `;
    
    // Query to get total sales (all time)
    const salesQuery = `
        SELECT IFNULL(SUM(s.quantity_sold * p.selling_price), 0) AS total_sales
        FROM sales s
        JOIN products p ON s.product_id = p.product_id
    `;
    
    // Query to get today's sales summary
    const todaySalesQuery = `
        SELECT IFNULL(SUM(total_sales), 0) AS today_sales
        FROM daily_sales_summary
        WHERE summary_date = ?
    `;
    
    // Query to get today's expenses
    const todayExpensesQuery = `
        SELECT IFNULL(SUM(amount), 0) AS today_expenses
        FROM expenses
        WHERE date = ?
    `;
    
    // Execute all queries in parallel
    Promise.all([
        new Promise((resolve, reject) => {
            connection.query(expensesQuery, (err, results) => {
                if (err) return reject(err);
                resolve(results[0].total_expenses);
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(salesQuery, (err, results) => {
                if (err) return reject(err);
                resolve(results[0].total_sales);
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(todaySalesQuery, [today], (err, results) => {
                if (err) return reject(err);
                resolve(results[0].today_sales);
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(todayExpensesQuery, [today], (err, results) => {
                if (err) return reject(err);
                resolve(results[0].today_expenses);
            });
        })
    ])
    .then(([totalExpenses, totalSales, todaySales, todayExpenses]) => {
        res.json({
            success: true,
            total_expenses: parseFloat(totalExpenses),
            total_sales: parseFloat(totalSales),
            today_sales: parseFloat(todaySales),
            today_expenses: parseFloat(todayExpenses),
            today_profit: parseFloat(todaySales) - parseFloat(todayExpenses)
        });
    })
    .catch(err => {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    });
});
app.get('/api/weekly-stats', (req, res) => {
    // Calculate date range (last 7 days including today)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // 7 days total
    
    // Format dates for SQL (YYYY-MM-DD)
    const formatDate = (date) => date.toISOString().split('T')[0];
    const dateFormat = '%Y-%m-%d'; // Correct MySQL date format
    
    // Query to get daily sales for the last 7 days
    const salesQuery = `
        SELECT 
            DATE(s.sale_date) AS day,
            IFNULL(SUM(s.quantity_sold * p.selling_price), 0) AS sales
        FROM sales s
        JOIN products p ON s.product_id = p.product_id
        WHERE s.sale_date BETWEEN ? AND ?
        GROUP BY day
        ORDER BY day
    `;
    
    // Query to get daily expenses for the last 7 days
    const expensesQuery = `
        SELECT 
            DATE(date) AS day,
            IFNULL(SUM(amount), 0) AS expenses
        FROM expenses
        WHERE date BETWEEN ? AND ?
        GROUP BY day
        ORDER BY day
    `;
    
    // Execute both queries
    Promise.all([
        new Promise((resolve, reject) => {
            connection.query(salesQuery, [formatDate(startDate), formatDate(endDate)], 
            (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(expensesQuery, [formatDate(startDate), formatDate(endDate)], 
            (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        })
    ])
    .then(([salesData, expensesData]) => {
        // Create a map of all days in the week
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = {};
        
        // Initialize all days with default values
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dayName = daysOfWeek[date.getDay()];
            weeklyData[dayName] = {
                day: dayName,
                sales: 0,
                expenses: 0,
                profit: 0,
                loss: 0
            };
        }
        
        // Process sales data
        salesData.forEach(item => {
            const date = new Date(item.day);
            const dayName = daysOfWeek[date.getDay()];
            if (weeklyData[dayName]) {
                weeklyData[dayName].sales = parseFloat(item.sales) || 0;
            }
        });
        
        // Process expenses data
        expensesData.forEach(item => {
            const date = new Date(item.day);
            const dayName = daysOfWeek[date.getDay()];
            if (weeklyData[dayName]) {
                weeklyData[dayName].expenses = parseFloat(item.expenses) || 0;
                
                // Calculate profit/loss
                const profit = weeklyData[dayName].sales - weeklyData[dayName].expenses;
                if (profit >= 0) {
                    weeklyData[dayName].profit = profit;
                    weeklyData[dayName].loss = 0;
                } else {
                    weeklyData[dayName].profit = 0;
                    weeklyData[dayName].loss = Math.abs(profit);
                }
            }
        });
        
        // Convert to array in correct order (Sunday to Saturday)
        const result = Object.values(weeklyData);
        
        res.json({
            success: true,
            data: result
        });
    })
    .catch(err => {
        console.error('Error fetching weekly stats:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching weekly statistics',
            error: err.message
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); // optional: remove session cookie
        res.json({ success: true });
    });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
