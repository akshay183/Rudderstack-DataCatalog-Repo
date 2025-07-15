<!-- https://www.notion.so/Take-Home-Assignment-RudderStack-SDE-2-230d2bf0d49d80dcbe30cfff114c07fb -->

# RudderStack Data Catalog API

## Background

RudderStack's Data Catalog is a powerful feature that helps organisations manage and govern their customer data effectively. It provides a centralised repository for tracking customer data events, their properties, and validation rules through tracking plans.

In the data governance ecosystem, the Data Catalog plays a crucial role in ensuring data quality and consistency across an organisation's data collection infrastructure.

## Problem Statement

Your task is to design and implement a simplified version of a Data Catalog API service that manages the core entities and their relationships. This service will be used by data teams to organise their event tracking and ensure data quality through validation schemas.

## Core Concepts

### Events

Events represent user actions or system occurrences that are tracked. For example, "Button Click", "Page View", or "Purchase Completed". Each event:

- Has name, type, description as valid properties on the event.
- Contains metadata (like create_time, update_time) when it's created in the system
- Has associated properties that describe the event in detail
- Must have a unique combination of name and type within the system
- Has a `type` field which can have values from the following list : `["track", "identify", "alias", "screen", "page"]` only. No other type is allowed for an event.

An example payload which defines an event would be:

```json
{
   "name": "Product Clicked",
   "type": "track",
   "description": "User clicked on the product summary"
}

```

### Properties

Properties are attributes that provide context to events. For example, a "Purchase Completed" event might have properties like "product_id", "price", and "currency". Properties:

- Have a name, type (string, number, boolean, etc.), and description
- Valid values on type are `["string", "number", "boolean"]`. No other type is allowed on the property
- Contains metadata (like create_time, update_time) when it's created in the system
- May have validation rules (e.g., format, allowed values) ( `Optional`)
- Must have a unique combination of name and type within the system

An example payload to create property would look like:

```json

{
   "name": "price",
   "type": "number",
   "description": "price of the product"
}

```

### Tracking Plan

A TrackingPlan is a collection of events and their expected properties. It serves as a contract for data collection, ensuring consistency and quality. TrackingPlans:

- Group related events together
- Maintain relationships between events and their properties
- Have a unique name within the system
- Each property within the event has `required` key which defines if property is mandatory on the event or not
- Each event has `additionalProperties` key which defines if undefined properties are allowed to be present in the event or not

For example, an e-commerce application might have a "Purchase Flow" TrackingPlan that includes:

- Events like "Product Viewed", "Add to Cart", "Checkout Started", and "Purchase Completed"
- Each event with its required and optional properties

A simplified payload used to create Tracking Plan would look like following:

```json
{
  "name": "Purchase Flow",
  "description": "Events related to the purchase funnel",
  "events": [
    {
      "name": "Product Viewed",
      "description": "User viewed a product detail page",
      "properties": [
        {
          "name": "product_id",
          "type": "string",
          "required": true,
          "description": "Unique identifier for the product"
        },
        {
          "name": "price",
          "type": "number",
          "required": true,
          "description": "Product price",
        }
      ],
      "additionalProperties": "true"
    },
    {
      "name": "Purchase Completed",
      "description": "User completed a purchase",
      "properties": [
        {
          "name": "order_id",
          "type": "string",
          "required": true,
          "description": "Unique identifier for the order"
        },
        {
          "name": "total",
          "type": "number",
          "required": false,
          "description": "Total purchase amount",
        }
      ],
      "additionalProperties": "false"
    }
  ]
}

```

### Entity Relationships and Creation Flow

When creating or updating a TrackingPlan:

- If an Event referenced in the TrackingPlan doesn't exist in the system, it should be created automatically
- If a Property referenced in the TrackingPlan doesn't exist in the system, it should be created automatically
- If an Event or Property already exists, it should be attached as-is to the TrackingPlan without modification meaning if we try and attach property or event with name and type that already exists in system but with a different description, it should error out with proper `http status code`
- The API should handle these creation and attachment processes transparently

This approach allows for:

- Reuse of common Events and Properties across multiple TrackingPlans
- Maintaining consistency in Event and Property definitions
- Simplified TrackingPlan creation for users

## Requirements

### Functional Requirements

1. API Design and Implementation
    - Design RESTful API endpoints for all CRUD operations on Events, Properties, and TrackingPlans
    - Ensure proper error handling and status codes
    - Implement proper validation for API requests
2. Data Modeling
    - Design a database schema that accurately represents the entities and their relationships
    - Implement the data access layer
    - Handle data integrity constraints defined in Core Concepts appropriately

### Non-Functional Requirements

1. Code Quality
    - Write clean, maintainable TypeScript code
    - Follow best practices for naming, structure, and organisation
    - Include appropriate comments and documentation
2. Testing
    - Implement tests for critical paths in the application
    - Choose appropriate testing strategies based on your judgment
    - Document your testing approach
3. Infrastructure
    - Containerise the application using Docker
    - Include appropriate configuration options
    - Implement logging for important operations
4. Development Process
    - Use Git with clear, conventional commits
    - Document your design decisions and trade-offs
    - Provide clear setup and running instructions

## Deliverables

1. Source Code
    - Complete TypeScript implementation of the API
    - Database schema definitions and migrations
    - Configuration files and environment setup
2. Documentation
    - README with setup and running instructions
    - API documentation (endpoints, request/response formats)
    - Key design decisions and rationale
    - Future improvements or considerations
3. Docker Configuration
    - Dockerfile for the application
    - Docker Compose file (if using multiple services)
    - Environment configuration

## Evaluation Criteria

1. Technical Implementation
    - Correctness and completeness of the solution
    - API design and usability
    - Data model design and implementation
    - Code quality and organisation
2. Problem Solving
    - Understanding of the domain concepts
    - Approach to modelling relationships
    - Implementation of JSON schema generation
3. Engineering Practices
    - Testing approach and coverage
    - Documentation quality
    - Git usage and commit quality
    - Containerisation implementation
4. Extra Credit (Optional)
    - Performance considerations
    - Security implementations
    - Advanced validation features on `Properties`. For ex: `price` property is of type number and we want to represent that price should always be a positive number in catalog
    - API documentation using OpenAPI/Swagger
    - Simple UI implementation for interacting with the API if time permits

## AI Usage

We encourage the candidate to use advanced AI tools and assistants (like ChatGPT, Claude, GitHub Copilot, etc.) when solving this assignment. These tools can help with code generation, problem-solving, and implementation suggestions. However, please note the following important points:

1. **Responsibility**: Candidates are fully responsible for all code used in their submission, whether AI-generated or not.
2. **Understanding**: Candidates should thoroughly understand every line of code in their solution and be prepared to explain the implementation details, design decisions, and code flow during the review process.
3. **Quality Assurance**: All code, regardless of its source, must be reviewed, tested, and validated by the candidate to ensure it meets the requirements and follows best practices.
4. **Attribution**: While not required, it's appreciated if candidates note which parts of their solution were developed with AI assistance.

The goal is to evaluate your problem-solving approach, technical decision-making, and understanding of the domain concepts, not your ability to write code from scratch without tools.

## Time Expectation

This assignment is designed to be completed within one day. This constraint is intentional - we want to see how you prioritise features and manage scope under time pressure. Focus on delivering a working solution that addresses the core requirements, even if simplified. Document any design decisions, trade-offs made, and features you would implement given more time. We’re looking for quality code that solves the fundamental problem, not an exhaustive implementation.

## Submission Guidelines

1. Push your code to a public GitHub / GitLab repository
2. Ensure all documentation is included
3. Make sure the application can be run using Docker
4. Document any assumptions you made during implementation