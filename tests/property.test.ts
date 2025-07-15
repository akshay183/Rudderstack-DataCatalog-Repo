import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import property_routes from '../src/routes/propertyRoutes';
import Property from '../src/models/Property';
import { MongoMemoryServer } from 'mongodb-memory-server';

const app = express();
app.use(bodyParser.json());
app.use('/api/v1/properties', property_routes);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Property.deleteMany({});
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
