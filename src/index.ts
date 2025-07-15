import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import event_routes from './routes/eventRoutes';
import property_routes from './routes/propertyRoutes';
import tracking_plan_routes from './routes/trackingPlanRoutes';
import { error_handler } from './middleware/errorMiddleware';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rudderstack';

app.use(bodyParser.json());

app.use('/api/v1/events', event_routes);
app.use('/api/v1/properties', property_routes);
app.use('/api/v1/tracking-plans', tracking_plan_routes);

app.use(error_handler);

mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});
