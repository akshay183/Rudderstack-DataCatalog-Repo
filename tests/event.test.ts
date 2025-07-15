import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import event_routes from '../src/routes/eventRoutes';
import Event from '../src/models/Event';
import { MongoMemoryServer } from 'mongodb-memory-server';

const app = express();
app.use(bodyParser.json());
app.use('/api/v1/events', event_routes);

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
    await Event.deleteMany({});
});

describe('Event API', () => {
    it('should create a new event', async () => {
        const response = await request(app)
            .post('/api/v1/events')
            .send({
                name: 'Test Event',
                type: 'track',
                description: 'This is a test event'
            });
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Test Event');
    });

    it('should not create an event with a duplicate name and type', async () => {
        await request(app)
            .post('/api/v1/events')
            .send({
                name: 'Test Event',
                type: 'track',
                description: 'This is a test event'
            });
        const response = await request(app)
            .post('/api/v1/events')
            .send({
                name: 'Test Event',
                type: 'track',
                description: 'This is another test event'
            });
        expect(response.status).toBe(409);
    });

    it('should get all events', async () => {
        await request(app)
            .post('/api/v1/events')
            .send({
                name: 'Test Event 1',
                type: 'track',
                description: 'This is a test event'
            });
        await request(app)
            .post('/api/v1/events')
            .send({
                name: 'Test Event 2',
                type: 'track',
                description: 'This is another test event'
            });
        const response = await request(app).get('/api/v1/events');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it('should get an event by id', async () => {
        const event = await request(app)
            .post('/api/v1/events')
            .send({
                name: 'Test Event',
                type: 'track',
                description: 'This is a test event'
            });
        const response = await request(app).get(`/api/v1/events/${event.body._id}`);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Test Event');
    });

    it('should update an event', async () => {
        const event = await request(app)
            .post('/api/v1/events')
            .send({
                name: 'Test Event',
                type: 'track',
                description: 'This is a test event'
            });
        const response = await request(app)
            .put(`/api/v1/events/${event.body._id}`)
            .send({
                name: 'Updated Test Event',
                type: 'track',
                description: 'This is an updated test event'
            });
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Updated Test Event');
    });

    it('should delete an event', async () => {
        const event = await request(app)
            .post('/api/v1/events')
            .send({
                name: 'Test Event',
                type: 'track',
                description: 'This is a test event'
            });
        const response = await request(app).delete(`/api/v1/events/${event.body._id}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Event deleted successfully');
    });
});
