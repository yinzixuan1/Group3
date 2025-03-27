import request from 'supertest';
import app from './server.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const TEST_PDF_PATH = path.join(__dirname, 'uploads', 'test.pdf');

describe('API endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authentication', () => {
    test('POST /api/login with invalid credentials - should return 401', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'wrong', password: 'wrong' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('POST /api/login with valid credentials - should return user data', async () => {
        // create first
        await User.create({ 
          username: 'testuser', 
          password: 'testpass', 
          nickname: 'Test User'
        });
      
        const res = await request(app)
          .post('/api/login')
          .send({ username: 'testuser', password: 'testpass' });
      
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('user');
        
        // certain cross-check
        expect(res.body.user).toMatchObject({
          username: 'testuser',
          nickname: 'Test User',
          _id: expect.any(String)
        });
        
      });

    test('POST /api/login with missing fields - should return 400', async () => {
      const tests = [
        { password: 'onlypassword' },
        { username: 'onlyusername' },
        {}
      ];

      for (const body of tests) {
        const res = await request(app)
          .post('/api/login')
          .send(body);
        expect(res.statusCode).toBe(400);
      }
    });
  });

  describe('Registration', () => {
    test('POST /api/register with new user - should return 200', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ 
          username: 'newuser', 
          password: '123', 
          nickname: 'Test' 
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      
      // 验证用户确实创建了
      const user = await User.findOne({ username: 'newuser' });
      expect(user).not.toBeNull();
    });

    test('POST /api/register with existing username - should return 400', async () => {
      // 先创建用户
      await User.create({ 
        username: 'existing', 
        password: '123', 
        nickname: 'Existing' 
      });

      const res = await request(app)
        .post('/api/register')
        .send({ 
          username: 'existing', 
          password: '123', 
          nickname: 'test' 
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Username already exists');
    });

  });

  describe('File Upload', () => {
    test('POST /upload with valid PDF - should return success', async () => {
      // make sure test pdf is running
      if (!fs.existsSync(TEST_PDF_PATH)) {
        fs.writeFileSync(TEST_PDF_PATH, 'PDF mock content');
      }

      const res = await request(app)
        .post('/upload')
        .attach('file', fs.createReadStream(TEST_PDF_PATH));

      expect(res.statusCode).toBe(200);
      expect(res.text).toMatch(/uploads\/.+? upload successfully/);
    });

    test('POST /upload with no file - should return 400', async () => {
      const res = await request(app).post('/upload');
      expect(res.statusCode).toBe(400);
    });

    // test('POST /upload with invalid file type - should return 400', async () => {
    //     const tempFile = path.join(__dirname, 'temp.txt');
    //     fs.writeFileSync(tempFile, 'This is not a PDF'); // Create an invalid file (non-PDF)
        
    //     const res = await request(app)
    //         .post('/upload')
    //         .attach('file', fs.createReadStream(tempFile)); // Attach the invalid file
        
    //     expect(res.statusCode).toBe(400); // Expecting a 400 for invalid file type
    //     expect(res.body.error).toBe('Only PDF files are allowed'); // Ensure the error message matches
        
    //     fs.unlinkSync(tempFile); // Clean up
    // });    
  });

  describe('Chat Endpoint', () => {
    let uploadedFilePath;

    beforeAll(async () => {
      // upload test file
      if (fs.existsSync(TEST_PDF_PATH)) {
        const res = await request(app)
          .post('/upload')
          .attach('file', fs.createReadStream(TEST_PDF_PATH));
        uploadedFilePath = res.text.replace(' upload successfully.', '');
      }
    });

    test('GET /chat with no question - should return validation error', async () => {
      const res = await request(app).get('/chat');
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('Please enter a valid question.');
    });

    // test('GET /chat with question but no file - should return error', async () => {
    //     jest.setTimeout(10000); 
      
    //     const freshApp = (await import('./server.js')).default;
    //     const res = await request(freshApp)
    //       .get('/chat')
    //       .query({ question: 'What is this?' });
      
    //     expect(res.statusCode).toBe(400);
    //     expect(res.body).toHaveProperty('error');
    // });
      

    // test('GET /chat with valid question and file - should return response', async () => {
    //     jest.setTimeout(30000);
    //     if (!uploadedFilePath) {
    //     // if beforeall failed, upload here
    //     const uploadRes = await request(app)
    //       .post('/upload')
    //       .attach('file', fs.createReadStream(TEST_PDF_PATH));
    //     uploadedFilePath = uploadRes.text.replace(' upload successfully.', '');
    //   }

    //   const res = await request(app)
    //     .get('/chat')
    //     .query({ question: 'What is this document about?' });

    //   expect(res.statusCode).toBe(200);
    //   expect(res.text).toBeTruthy();
    // }, 10000); 
  });

  describe('Error Handling', () => {
    test('GET non-existent endpoint - should return 404', async () => {
      const res = await request(app).get('/nonexistent');
      expect(res.statusCode).toBe(404);
    });

    test('POST /api/login with malformed JSON - should return 400', async () => {
      const res = await request(app)
        .post('/api/login')
        .set('Content-Type', 'application/json')
        .send('{"malformed": json}');
      
      expect(res.statusCode).toBe(400);
    });
  });
});