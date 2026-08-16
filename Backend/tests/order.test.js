const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../server');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

jest.mock('uuid', () => ({ v4: () => '123456789' }));

let mongoServer;
let restaurantId;
let tableNumber = 1;
let menuItem1;
let menuItem2;
let adminToken;
let otherToken;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);

  // Setup initial data
  const restaurant = await Restaurant.create({ name: 'Test Rest', email: 'test@example.com' });
  restaurantId = restaurant._id;

  const otherRestaurant = await Restaurant.create({ name: 'Other Rest', email: 'other@example.com' });

  await Table.create({ restaurantId, tableNumber: '1' });

  menuItem1 = await MenuItem.create({
    restaurantId, name: 'Burger', price: 10, category: 'Food', isAvailable: true
  });
  menuItem2 = await MenuItem.create({
    restaurantId, name: 'Fries', price: 5, category: 'Food', isAvailable: false
  });

  const admin = await User.create({ username: 'admin', password: 'password', restaurantId });
  adminToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1h' });

  const otherAdmin = await User.create({ username: 'other', password: 'password', restaurantId: otherRestaurant._id });
  otherToken = jwt.sign({ id: otherAdmin._id }, JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Order API', () => {
  afterEach(async () => {
    await Order.deleteMany({});
  });

  it('A. Price manipulation: backend must save correct MongoDB price', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('idempotency-key', 'key-1')
      .send({
        restaurantId,
        tableNumber,
        items: [{ itemId: menuItem1._id, name: 'Burger', qty: 2, price: 1 }],
        note: ''
      });
      
    expect(res.status).toBe(201);
    expect(res.body.totalAmount).toBe(20); // 2 * 10
    expect(res.body.items[0].price).toBe(10);
  });

  it('B. Name manipulation: backend must save correct MongoDB name', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('idempotency-key', 'key-2')
      .send({
        restaurantId,
        tableNumber,
        items: [{ itemId: menuItem1._id, name: 'Fake Burger', qty: 1 }],
        note: ''
      });
      
    expect(res.status).toBe(201);
    expect(res.body.items[0].name).toBe('Burger');
  });

  it('B2. Unavailable item: backend must reject', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('idempotency-key', 'key-3')
      .send({
        restaurantId,
        tableNumber,
        items: [{ itemId: menuItem2._id, name: 'Fries', qty: 1 }],
        note: ''
      });
      
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('unavailable');
  });

  it('C. Idempotency race: exactly one order must exist', async () => {
    const payload = {
      restaurantId,
      tableNumber,
      items: [{ itemId: menuItem1._id, name: 'Burger', qty: 1 }],
      note: ''
    };

    const req1 = request(app).post('/api/orders').set('idempotency-key', 'key-race').send(payload);
    const req2 = request(app).post('/api/orders').set('idempotency-key', 'key-race').send(payload);
    const req3 = request(app).post('/api/orders').set('idempotency-key', 'key-race').send(payload);

    const results = await Promise.all([req1, req2, req3]);
    
    // Status should be 200 or 201
    results.forEach(r => {
      expect([200, 201]).toContain(r.status);
    });
    
    const count = await Order.countDocuments({ idempotencyKey: 'key-race' });
    expect(count).toBe(1);
    
    const orderIds = results.map(r => r.body._id);
    expect(orderIds[0]).toBe(orderIds[1]);
    expect(orderIds[1]).toBe(orderIds[2]);
  });

  it('D. JWT/authorization: Unauthorized admin requests must be rejected', async () => {
    // No token
    const res1 = await request(app).get('/api/orders');
    expect(res1.status).toBe(401);

    const order = await Order.create({
      restaurantId, orderNumber: '1', tableNumber: 1, totalAmount: 10, items: []
    });

    // Customer without idempotency key
    const res2 = await request(app).get(`/api/orders/${order._id}`);
    expect(res2.status).toBe(403);
  });
});
