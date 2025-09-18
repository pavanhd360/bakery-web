from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import sqlite3
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Initialize database
def init_db():
    conn = sqlite3.connect('bakery.db')
    cursor = conn.cursor()
    
    # Create products table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image_url TEXT
    )
    ''')
    
    # Create orders table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        total_amount REAL NOT NULL,
        order_date TEXT NOT NULL,
        status TEXT DEFAULT 'pending'
    )
    ''')
    
    # Create order_items table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )
    ''')
    
    # Create feedback table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    ''')
    
    # Insert sample products if table is empty
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        products = [
            ('Chocolate Cake', 25.99, 'Delicious chocolate cake with rich frosting', 'images/product1.jpg'),
            ('Croissant', 3.99, 'Buttery and flaky French pastry', 'images/product2.jpg'),
            ('Sourdough Bread', 5.99, 'Traditional sourdough bread', 'images/product3.jpg'),
            ('Cupcakes (6)', 12.99, 'Assorted cupcakes with different flavors', 'images/product4.jpg')
        ]
        cursor.executemany("INSERT INTO products (name, price, description, image_url) VALUES (?, ?, ?, ?)", products)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# API Routes
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = sqlite3.connect('bakery.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")
    products = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(products)

@app.route('/api/cart/checkout', methods=['POST'])
def checkout():
    data = request.json
    
    conn = sqlite3.connect('bakery.db')
    cursor = conn.cursor()
    
    # Create order
    cursor.execute(
        "INSERT INTO orders (customer_name, email, address, total_amount, order_date) VALUES (?, ?, ?, ?, ?)",
        (data['name'], data['email'], data['address'], data['total'], datetime.now().isoformat())
    )
    order_id = cursor.lastrowid
    
    # Add order items
    for item in data['items']:
        cursor.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
            (order_id, item['id'], item['quantity'], item['price'])
        )
    
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "order_id": order_id})

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    
    conn = sqlite3.connect('bakery.db')
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO feedback (name, email, message, created_at) VALUES (?, ?, ?, ?)",
        (data['name'], data['email'], data['message'], datetime.now().isoformat())
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)