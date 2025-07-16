import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import event_routes from "../src/routes/eventRoutes";
import Event from "../src/models/Event";
// Import Jest functions
import {
  describe,
  it,
  beforeAll,
  afterAll,
  afterEach,
  expect,
} from "@jest/globals";

const app = express();
app.use(express.json());
app.use("/api/v1/events", event_routes);

// Get MongoDB URI from environment or use default for Docker setup
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/test_db";

beforeAll(async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      waitQueueTimeoutMS: 30000,
      directConnection: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("ERROR in beforeAll:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    throw error;
  }
}, 60000);

afterAll(async () => {
  try {
    console.log("Disconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("ERROR in afterAll:", error);
  }
}, 60000);

afterEach(async () => {
  try {
    console.log("Cleaning up test data...");
    await Event.deleteMany({});
  } catch (error) {
    console.error("ERROR in afterEach:", error);
  }
});

describe("Event API", () => {
  it("should create a new event", async () => {
    const response = await request(app).post("/api/v1/events").send({
      name: "Test Event",
      type: "track",
      description: "This is a test event",
    });
    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Test Event");
  });

  it("should not create an event with a duplicate name and type", async () => {
    await request(app).post("/api/v1/events").send({
      name: "Test Event",
      type: "track",
      description: "This is a test event",
    });
    const response = await request(app).post("/api/v1/events").send({
      name: "Test Event",
      type: "track",
      description: "This is another test event",
    });
    expect(response.status).toBe(409);
  });

  it("should get all events", async () => {
    await request(app).post("/api/v1/events").send({
      name: "Test Event 1",
      type: "track",
      description: "This is a test event",
    });
    await request(app).post("/api/v1/events").send({
      name: "Test Event 2",
      type: "track",
      description: "This is another test event",
    });
    const response = await request(app).get("/api/v1/events");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it("should get an event by id", async () => {
    const event = await request(app).post("/api/v1/events").send({
      name: "Test Event",
      type: "track",
      description: "This is a test event",
    });
    const response = await request(app).get(`/api/v1/events/${event.body.ref}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Test Event");
  });

  it("should update an event", async () => {
    const event = await request(app).post("/api/v1/events").send({
      name: "Test Event",
      type: "track",
      description: "This is a test event",
    });
    const response = await request(app)
      .put(`/api/v1/events/${event.body.ref}`)
      .send({
        name: "Updated Test Event",
        type: "track",
        description: "This is an updated test event",
      });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated Test Event");
  });

  it("should delete an event", async () => {
    const event = await request(app).post("/api/v1/events").send({
      name: "Test Event",
      type: "track",
      description: "This is a test event",
    });
    const response = await request(app).delete(
      `/api/v1/events/${event.body.ref}`
    );
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Event deleted successfully");
  });
});
