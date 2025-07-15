import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import tracking_plan_routes from '../src/routes/trackingPlanRoutes';
import event_routes from '../src/routes/eventRoutes';
import property_routes from '../src/routes/propertyRoutes';
import TrackingPlan from '../src/models/TrackingPlan';
import Event from '../src/models/Event';
import Property from '../src/models/Property';
import { MongoMemoryServer } from 'mongodb-memory-server';

const app = express();
app.use(bodyParser.json());
app.use('/api/v1/tracking-plans', tracking_plan_routes);
app.use('/api/v1/events', event_routes);
app.use('/api/v1/properties', property_routes);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, { replicaSet: 'rs' });
}, 30000);

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
}, 30000);

afterEach(async () => {
    await TrackingPlan.deleteMany({});
    await Event.deleteMany({});
    await Property.deleteMany({});
});

describe('Tracking Plan API', () => {
    it('should create a new tracking plan', async () => {
        const response = await request(app)
            .post('/api/v1/tracking-plans')
            .send({
                name: 'Test Tracking Plan',
                description: 'This is a test tracking plan'
            });
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Test Tracking Plan');
    });

    it('should create a new tracking plan with events and properties', async () => {
        const response = await request(app)
            .post('/api/v1/tracking-plans')
            .send({
                name: 'Test Tracking Plan',
                description: 'This is a test tracking plan',
                events: [
                    {
                        name: 'Test Event',
                        type: 'track',
                        description: 'This is a test event',
                        additional_properties: false,
                        properties: [
                            {
                                name: 'Test Property',
                                type: 'string',
                                description: 'This is a test property',
                                required: true
                            }
                        ]
                    }
                ]
            });
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Test Tracking Plan');
        expect(response.body.events.length).toBe(1);
        expect(response.body.events[0].properties.length).toBe(1);
    });

    it('should get all tracking plans', async () => {
        await request(app)
            .post('/api/v1/tracking-plans')
            .send({
                name: 'Test Tracking Plan 1',
                description: 'This is a test tracking plan'
            });
        await request(app)
            .post('/api/v1/tracking-plans')
            .send({
                name: 'Test Tracking Plan 2',
                description: 'This is another test tracking plan'
            });
        const response = await request(app).get('/api/v1/tracking-plans');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it('should get a tracking plan by id', async () => {
        const trackingPlan = await request(app)
            .post('/api/v1/tracking-plans')
            .send({
                name: 'Test Tracking Plan',
                description: 'This is a test tracking plan'
            });
        const response = await request(app).get(`/api/v1/tracking-plans/${trackingPlan.body._id}`);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Test Tracking Plan');
    });

    it('should update a tracking plan', async () => {
        const trackingPlan = await request(app)
            .post('/api/v1/tracking-plans')
            .send({
                name: 'Test Tracking Plan',
                description: 'This is a test tracking plan'
            });
        const response = await request(app)
            .put(`/api/v1/tracking-plans/${trackingPlan.body._id}`)
            .send({
                name: 'Updated Test Tracking Plan',
                description: 'This is an updated test tracking plan'
            });
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Updated Test Tracking Plan');
    });

    it('should delete a tracking plan', async () => {
        const trackingPlan = await request(app)
            .post('/api/v1/tracking-plans')
            .send({
                name: 'Test Tracking Plan',
                description: 'This is a test tracking plan'
            });
        const response = await request(app).delete(`/api/v1/tracking-plans/${trackingPlan.body._id}`);
        expect(response.status).toBe(200);
    });

    it('should upsert an event to a tracking plan', async () => {
        const trackingPlan = await request(app)
            .post('/api/v1/tracking-plans')
            .send({
                name: 'Test Tracking Plan',
                description: 'This is a test tracking plan'
            });
        const response = await request(app)
            .patch(`/api/v1/tracking-plans/event`)
            .send({
                tracking_plan_id: trackingPlan.body._id,
                events: [
                    {
                        name: 'Test Event',
                        type: 'track',
                        description: 'This is a test event',
                        additional_properties: false,
                        properties: [
                            {
                                name: 'Test Property',
                                type: 'string',
                                description: 'This is a test property',
                                required: true
                            }
                        ]
                    }
                ]
            });
        expect(response.status).toBe(200);
        expect(response.body.events.length).toBe(1);
    });
});
