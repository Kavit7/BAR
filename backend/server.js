const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const app = express();
const saltRounds = 10;

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: 'Bar@Kavit123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const uri = "mongodb://kavitpaul7:kavit%40123@cluster1-shard-00-00.tofibjn.mongodb.net:27017,cluster1-shard-00-01.tofibjn.mongodb.net:27017,cluster1-shard-00-02.tofibjn.mongodb.net:27017/business_tracker?ssl=true&replicaSet=atlas-xxxx-shard-0&authSource=admin&retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    await client.db("business_tracker").command({ ping: 1 });
    console.log("Connected successfully to MongoDB without SRV!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
const adminSchema = new mongoose.Schema({
    username: String,
    password: String
});

const productSchema = new mongoose.Schema({
    name: String,
    buying_price: Number,
    selling_price: Number,
    stock: Number
});

const saleSchema = new mongoose.Schema({
    product_id: mongoose.Schema.Types.ObjectId,
    quantity_sold: Number,
    sale_date: Date
});

const expenseSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    date: Date
});

const dailySalesSummarySchema = new mongoose.Schema({
    summary_date: { type: Date, unique: true },
    total_sales: Number
});

const Admin = mongoose.model('Admin', adminSchema);
const Product = mongoose.model('Product', productSchema);
const Sale = mongoose.model('Sale', saleSchema);
const Expense = mongoose.model('Expense', expenseSchema);
const DailySalesSummary = mongoose.model('DailySalesSummary', dailySalesSummarySchema);

const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.status(401).json({ error: 'Unauthorized' });
};

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
    try {
        const user = await Admin.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.session.user = { id: user._id, username: user.username };
        res.json({ success: true, message: `welcome ${user.username} Your Logged in successful`, user });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/product', isAuthenticated, async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/add', async (req, res) => {
    const { name, selling, buying, stock } = req.body;
    try {
        const product = new Product({ name, selling_price: selling, buying_price: buying, stock });
        await product.save();
        res.json({ message: 'Data added Successfully' });
    } catch {
        res.json({ error: 'fail to connect to database' });
    }
});

app.get('/edit/data/:id', async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) return res.json({ error: 'failed to load the data' });
    res.json({ message: 'data obtained successfully ...', result: product });
});

app.put('/edit/:id', async (req, res) => {
    const { name, selling, buying, stock } = req.body;
    try {
        await Product.findByIdAndUpdate(req.params.id, {
            name,
            selling_price: selling,
            buying_price: buying,
            stock
        });
        res.json({ message: 'Product updated successful' });
    } catch {
        res.json({ error: 'Failed to update the product' });
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch {
        res.json({ error: 'Failed to delete the product' });
    }
});

app.post('/api/save-sales', async (req, res) => {
    const { sales } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    if (!sales.length) return res.status(400).json({ message: 'No sales data provided' });

    let totalDaySales = 0;

    try {
        for (const { product_id, quantity_sold } of sales) {
            const product = await Product.findById(product_id);
            if (!product || quantity_sold > product.stock) {
                return res.status(400).json({ message: `Insufficient stock for product ${product_id}` });
            }

            await Sale.create({ product_id, quantity_sold, sale_date: today });

            totalDaySales += product.selling_price * quantity_sold;
            product.stock -= quantity_sold;
            await product.save();
        }

        const summary = await DailySalesSummary.findOne({ summary_date: today });
        if (summary) {
            summary.total_sales += totalDaySales;
            await summary.save();
        } else {
            await DailySalesSummary.create({ summary_date: today, total_sales: totalDaySales });
        }

        res.json({ message: 'Sales saved, stock updated, and daily summary updated!' });
    } catch (err) {
        res.status(500).json({ message: 'Server error during sales processing' });
    }
});

app.get('/api/expenses', async (req, res) => {
    const { date } = req.query;
    const filter = date ? { date: new Date(date) } : {};
    const expenses = await Expense.find(filter).sort({ _id: -1 });
    res.json(expenses.map(exp => ({
        id: exp._id,
        description: exp.name,
        amount: exp.amount,
        date: exp.date
    })));
});

app.post('/api/expenses', async (req, res) => {
    const { description, amount } = req.body;
    try {
        await Expense.create({ name: description, amount, date: new Date() });
        res.json({ message: 'Expense added' });
    } catch {
        res.status(500).json({ error: 'Failed to insert expense' });
    }
});

app.put('/api/expenses/:id', async (req, res) => {
    const { description, amount } = req.body;
    try {
        await Expense.findByIdAndUpdate(req.params.id, { name: description, amount });
        res.json({ message: 'Expense updated' });
    } catch {
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
