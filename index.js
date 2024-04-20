require('dotenv').config();

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const app = express();
app.use(express.json());

const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const port = 3000;
const secretKey = process.env.ACCESS_TOKEN;

const connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
});

app.get("/", (req, res) => {
  res.json({ message: "C2G V1.2" });
});

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided.' });
  if(token === "Bearer null") return res.sendStatus(401); //U
  if(token === secretKey){
    next();
  }else return res.sendStatus(401);
}

app.get("/getUpdates",verifyToken, async (req, res) => {
  try {
      const data = await connection.promise().query(
          `SELECT * FROM products`
      );
      res.status(200).json(data[0]);
  } catch (err) {
      console.error("Error fetching updates:", err);
      res.status(500).json({
          message: "Error fetching updates",
          error: err
      });
  }
});

app.post("/login", verifyToken, async (req, res) => {
  const { username, password } = req.body;
  if (!username||password) {
    return res.status(400).json({ message: "Username and password is required in the query parameter." });
  }
  try{
      const data = await connection.promise().query(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        (err, results) => {
          if (err) {
            return res.status(500).json({ message: "Internal server error" });
          }
          if (results.length === 0) {
            return res.status(400).json({ message: "User not found" });
          }
          const user = results[0];
          if (user.password !== password) {
            return res.status(400).json({ message: "Wrong password" });
          }
          res.json({ message: "Login successful" });
        }
    );
    res.status(200).json(data[0]);
  } catch(err){
    console.error("Error fetching user: ", err);
    res.status(500).json({
        message: "Error fetching user!",
        error: err
    });
  }
});

app.get("/search", verifyToken, async (req, res) => {
  const brandName = req.query.brand;

  if (!brandName) {
      return res.status(400).json({ message: "Brand name is required in the query parameter." });
  }

  try {
      const data = await connection.promise().query(
          `SELECT * FROM products WHERE brand = ?`,
          [brandName]
      );

      res.status(200).json(data[0]);
  } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({
          message: "Error fetching products",
          error: err
      });
  }
});

app.get("/products", verifyToken,async(req, res) => {
    try {
        const data = await connection.promise().query(
          `SELECT *  from products;`
        );
        res.status(202).json({
          users: data[0],
        });
      } catch (err) { 
        res.status(500).json({
          message: err,
        });
      }
});

app.put('/product/:id',verifyToken, async (req, res) => {
  const id = req.params.id;
  const { barcode, brand, variant, volume, description } = req.body;
  if (!barcode || !brand || !variant ||!volume || !description) {
    return res.status(400).json({
      message: "Missing required fields.",
    });
  }
  try {
    const result = await connection.promise().query(
      `UPDATE products SET barcode=?, brand=?, variant=?, volume=?, description=? WHERE id=?`,
      [barcode, brand, variant,volume,description]
    );

    if (result[0].affectedRows > 0) {
      return res.status(201).json({
        message: "Product updated successfully",
      });
    } else {
      return res.status(500).json({
        message: "Error updating the product",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err,
    });
  }
});

app.post("/product",verifyToken, async (req, res) => {
  const { barcode, brand, variant,volume,description } = req.body;

  if (!barcode || !brand || !variant ||!volume || !description) {
    return res.status(400).json({
      message: "Missing required fields.",
    });
  }

  try {
    const result = await connection.promise().query(
      `INSERT INTO products (barcode, brand, variant,volume,description) VALUES (?, ?, ?, ?, ?);`,
      [barcode, brand, variant,volume,description]
    );

    if (result[0].affectedRows > 0) {
      return res.status(201).json({
        message: "Product added",
      });
    } else {
      return res.status(500).json({
        message: "Error adding product",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err,
    });
  }
});

app.listen(port, () => {
  console.log(`Cart2Go Listening to https://c2g.dev:${port}`);
});
