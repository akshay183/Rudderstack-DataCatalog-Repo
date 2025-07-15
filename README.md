# RudderStack Data Catalog API

This is a simplified version of a Data Catalog API service that manages events, properties, and tracking plans.

## Setup and Running

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. Clone the repository.
2. Run the following command in the root directory of the project:

   ```bash
   docker-compose up --build
   ```

The application will be running on `http://localhost:3000`.

## API Documentation

The base path for all API endpoints is `/api/v1`.

### Events

- `POST /events`: Create a new event.
- `GET /events`: Get all events.
- `GET /events/:id`: Get an event by ID.
- `PUT /events/:id`: Update an event.
- `DELETE /events/:id`: Delete an event.

### Properties

- `POST /properties`: Create a new property.
- `GET /properties`: Get all properties.
- `GET /properties/:id`: Get a property by ID.
- `PUT /properties/:id`: Update a property.
- `DELETE /properties/:id`: Delete a property.

### Tracking Plans

- `POST /tracking-plans`: Create a new tracking plan.
- `GET /tracking-plans`: Get all tracking plans.
- `GET /tracking-plans/:id`: Get a tracking plan by ID.
- `PUT /tracking-plans/:id`: Update a tracking plan.
- `DELETE /tracking-plans/:id`: Delete a tracking plan.
- `PATCH /tracking-plans/:trackingPlanId/event`: Upsert an event to a tracking plan.

## Design Decisions

- **Database**: MongoDB was chosen for its flexibility with semi-structured data and ease of use for this project.
- **Validation**: `express-validator` is used for request body validation to ensure data integrity.
- **Containerization**: Docker and Docker Compose are used to create a consistent development and deployment environment.

## Future Improvements

- **Testing**: Implement a comprehensive test suite with unit and integration tests.
- **Authentication and Authorization**: Add authentication and authorization to protect the API endpoints.
- **Advanced Validation**: Implement more advanced validation rules for properties.
- **API Documentation**: Use a tool like Swagger or OpenAPI to generate interactive API documentation.
- **CI/CD**: Set up a CI/CD pipeline to automate testing and deployment.
- **Logging**: Use a more robust logging library like Winston for structured logging.
- **Scalability**: For a production environment, consider using a more robust database solution and implementing a more scalable architecture.
- **Search**: Implement a search functionality to easily find events, properties, and tracking plans.
- **Versioning**: Implement API versioning to ensure backward compatibility.
- **Caching**: Implement caching to improve performance.
- **Rate Limiting**: Implement rate limiting to prevent abuse of the API.
- **Websockets**: Use websockets to provide real-time updates to clients.
- **GraphQL**: Consider using GraphQL to provide a more flexible API.
- **Webhooks**: Implement webhooks to notify other services of changes in the data catalog.
- **Data-flow**: Implement a data-flow diagram to visualize the flow of data between services.
- **UI**: Create a simple UI to interact with the API.
