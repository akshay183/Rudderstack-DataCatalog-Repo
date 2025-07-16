import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import property_routes from '../src/routes/propertyRoutes';
import Property from '../src/models/Property';
// Import Jest functions
import { describe, it, beforeAll, afterAll, afterEach, expect } from '@jest/globals';

const app = express();
app.use(express.json());
app.use('/api/v1/properties', property_routes);

// Get MongoDB URI from environment or use default for Docker setup
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/test_db';

beforeAll(async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            waitQueueTimeoutMS: 30000,
            directConnection: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('ERROR in beforeAll:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
        }
        throw error;
    }
}, 60000);

afterAll(async () => {
    try {
        console.log('Disconnecting from MongoDB...');
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('ERROR in afterAll:', error);
    }
}, 60000);

afterEach(async () => {
    try {
        console.log('Cleaning up test data...');
        await Property.deleteMany({});
    } catch (error) {
        console.error('ERROR in afterEach:', error);
    }
});

describe('Property API', () => {
    it('should create a new property', async () => {
        const response = await request(app)
            .post('/api/v1/properties')
            .send({
                name: 'Test Property',
                type: 'string',
                description: 'This is a test property'
            });
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Test Property');
    });

    it('should not create a property with a duplicate name and type', async () => {
        await request(app)
            .post('/api/v1/properties')
            .send({
                name: 'Test Property',
                type: 'string',
                description: 'This is a test property'
            });
        const response = await request(app)
            .post('/api/v1/properties')
            .send({
                name: 'Test Property',
                type: 'string',
                description: 'This is another test property'
            });
        expect(response.status).toBe(409);
    });

    it('should get all properties', async () => {
        await request(app)
            .post('/api/v1/properties')
            .send({
                name: 'Test Property 1',
                type: 'string',
                description: 'This is a test property'
            });
        await request(app)
            .post('/api/v1/properties')
            .send({
                name: 'Test Property 2',
                type: 'number',
                description: 'This is another test property'
            });
        const response = await request(app).get('/api/v1/properties');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it('should get a property by id', async () => {
        const property = await request(app)
            .post('/api/v1/properties')
            .send({
                name: 'Test Property',
                type: 'string',
                description: 'This is a test property'
            });
        const response = await request(app).get(`/api/v1/properties/${property.body._id}`);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Test Property');
    });

    it('should update a property', async () => {
        const property = await request(app)
            .post('/api/v1/properties')
            .send({
                name: 'Test Property',
                type: 'string',
                description: 'This is a test property'
            });
        const response = await request(app)
            .put(`/api/v1/properties/${property.body._id}`)
            .send({
                name: 'Updated Test Property',
                type: 'string',
                description: 'This is an updated test property'
            });
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Updated Test Property');
    });

    it('should delete a property', async () => {
        const property = await request(app)
            .post('/api/v1/properties')
            .send({
                name: 'Test Property',
                type: 'string',
                description: 'This is a test property'
            });
        const response = await request(app).delete(`/api/v1/properties/${property.body._id}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Property deleted successfully');
    });
});
