import request from 'supertest';
import express from 'express';
import app from './server.js';

describe('API endpoints', () => {
    test('POST /api/login with invalid credentials', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ username: 'wrong', password: 'wrong' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    test('POST /api/register', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({ username: 'newuser', password: '123', nickname: 'test' });


        expect([200, 400]).toContain(res.statusCode);
    });

    test('GET /chat with no question', async () => {
        const res = await request(app).get('/chat');

        expect(res.statusCode).toBe(200);
    });
});
