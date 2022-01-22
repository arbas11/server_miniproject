const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');
const { basename } = require('path/posix');
const methodOverride = require('method-override')
const bcrypt = require('bcrypt');

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(methodOverride('_method'))

let incorect = () => alert('INCORECT!')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root1234',
    database: 'merchant_dibimbing'
});
app.get('/merchant', (req, res) => {
    res.render('merchant')
});
app.get('/merchant/register', (req, res) => {
    res.render('register')
});

app.post('/merchant/register', async (req, res) => {
    const { id, user_name, user_password, address, phone_num } = req.body;
    const hash = await bcrypt.hash(user_password, 10);
    const newMerchant = {
        id: id,
        user_name: user_name,
        user_password: hash,
        address: address,
        phone_num: phone_num
    };
    await connection.query('INSERT INTO merchant SET ?', newMerchant, (error, result) => {
        if (error) throw error;
        res.redirect(`/merchant/${id}/product`);
    });
});
app.get('/merchant/login', (req, res) => {
    res.render('login');
})
app.post('/merchant/login', async (req, res) => {
    const { id, password } = req.body;
    const q = await connection.query(`SELECT * FROM merchant WHERE id = "${id}"`, async (error, result, fields) => {
        if (error) throw error;
        const { user_password } = result[0];
        const valid = await bcrypt.compare(password, user_password)
        if (valid) {
            res.redirect(`/merchant/${id}/product`);
        } else if (valid == false) {
            res.redirect(`/merchant/login`);
        }
    });
})
app.delete('/merchant/:id/delete', (req, res) => {
    const { id, prodid } = req.params;
    let q = `DELETE FROM product WHERE merchant_id = ${id}`
    connection.query(q, function (error, result, fields) {
        if (error) throw error;
        let q = `DELETE FROM merchant WHERE id = ${id}`
        connection.query(q, function (error, result, fields) {
            if (error) throw error;
            res.redirect(`/merchant`)
        });
    });
})
// DELETE FROM product WHERE merchant_id = 'arbas11';
// DELETE FROM merchant WHERE id = 'arbas11';
app.get('/merchant/:id/product', (req, res) => {
    const { id } = req.params;
    let q = `SELECT * FROM product WHERE merchant_id = "${id}"`;
    connection.query(q, (error, result, fields) => {
        if (error) throw error;
        res.render('products/show', { result, id });
    });
})

app.post('/merchant/:id/product', (req, res) => {
    const { id } = req.params;
    const newProduct = req.body;
    newProduct['merchant_id'] = id;
    console.log(newProduct)
    console.log(newProduct)
    connection.query('INSERT INTO product SET ?', newProduct, (error, result) => {
        if (error) throw error;
        res.redirect(`/merchant/${id}/product`);
    });

})

app.get('/merchant/:id/product/new', (req, res) => {
    const { id } = req.params;
    res.render('products/new', { id })
})

app.get('/merchant/:id/product/:prodid/edit', (req, res) => {
    const { id, prodid } = req.params;
    console.log(req.params)
    var q = `SELECT * FROM product WHERE id = ${prodid}`;
    connection.query(q, (error, result, fields) => {
        if (error) throw error;
        res.render('products/edit', { result, id, prodid });
    });
})
app.patch('/merchant/:id/product/:prodid/edit', (req, res) => {
    const { id, prodid } = req.params;
    let newUpdate = {
    };
    newUpdate['product_name'] = req.body.product_name;
    newUpdate['quantity'] = req.body.quantity;
    newUpdate['price'] = req.body.price;
    let q = `UPDATE product SET ? WHERE id = ${prodid}`
    connection.query(q, newUpdate, function (error, result, fields) {
        if (error) throw error;
        res.redirect(`/merchant/${id}/product`)
    });
})
app.delete('/merchant/:id/product/:prodid/edit', (req, res) => {
    const { id, prodid } = req.params;
    let q = `DELETE FROM product WHERE id = ${prodid}`
    connection.query(q, function (error, result, fields) {
        if (error) throw error;
        res.redirect(`/merchant/${id}/product`)
    });
})

app.listen(3000, () => console.log('on port 3000'))