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

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
});

app.listen(port, () => {
  console.log(`Cart2Go Listening to https://c2g.dev:${port}`);
});

app.get("/", (req, res) => {
  res.json({ message: "C2G" });
});

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided.' });
  if(token === "Bearer null") return res.sendStatus(401); //U
  if(token === secretKey){
    next();
  }else return res.sendStatus(401);
}
//Send the websocket
function sendDataToClients() {
  connection.query('SELECT *  FROM products;', (error, results, fields) => {
    if (error) throw error;
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(results));
      }
    });
  });
}
//Websocket
wss.on('connection', function connection(ws) {
    console.log('New client connected');
  ws.on('close', function close() {
    console.log('Client disconnected');
  });
  wss.send("Connected");
  // Send data to newly connected client
  sendDataToClients();
});

//Show all products
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

//Update by ID
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

//Insert Product
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
