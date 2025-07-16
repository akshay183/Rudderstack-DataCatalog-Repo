import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import tracking_plan_routes from '../src/routes/trackingPlanRoutes';
import event_routes from '../src/routes/eventRoutes';
import property_routes from '../src/routes/propertyRoutes';
import TrackingPlan from '../src/models/TrackingPlan';
import Event from '../src/models/Event';
import Property from '../src/models/Property';
// Import Jest functions
import { describe, it, beforeAll, afterAll, afterEach, expect } from '@jest/globals';
// Removed MongoMemoryServer import as we're using a real MongoDB instance

const app = express();
app.use(express.json());
app.use('/api/v1/tracking-plans', tracking_plan_routes);
app.use('/api/v1/events', event_routes);
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
}, 60000); // Increased timeout to 60 seconds

afterAll(async () => {
    try {
        console.log('Disconnecting from MongoDB...');
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('ERROR in afterAll:', error);
    }
}, 60000); // Increased timeout to 60 seconds

afterEach(async () => {
    try {
        console.log('Cleaning up test data...');
        await TrackingPlan.deleteMany({});
        await Event.deleteMany({});
        await Property.deleteMany({});
    } catch (error) {
        console.error('ERROR in afterEach:', error);
    }
});

describe('Tracking Plan API', () => {
    it('should create a new tracking plan', async () => {
        try {
            const response = await request(app)
                .post('/api/v1/tracking-plans')
                .send({
                    name: 'Test Tracking Plan',
                    description: 'This is a test tracking plan'
                });
            
            expect(response.status).toBe(201);
            expect(response.body.name).toBe('Test Tracking Plan');
        } catch (error) {
            console.error('ERROR in test "should create a new tracking plan":', error);
            throw error;
        }
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
        try {
            // Create a tracking plan first
            const trackingPlan = await request(app)
                .post('/api/v1/tracking-plans')
                .send({
                    name: 'Test Tracking Plan',
                    description: 'This is a test tracking plan'
                });
            
            if (!trackingPlan.body._id) {
                console.error('ERROR: No _id found in created tracking plan:', trackingPlan.body);
                throw new Error('Failed to get _id from created tracking plan');
            }
            
            // Fetch the tracking plan
            const response = await request(app).get(`/api/v1/tracking-plans/${trackingPlan.body._id}`);
            
            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Test Tracking Plan');
        } catch (error) {
            console.error('ERROR in test "should get a tracking plan by id":', error);
            throw error;
        }
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
