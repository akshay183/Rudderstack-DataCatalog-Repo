1. name field in property/event should have words limit (3-65 letters) and should start with letter.
   description should have limit of 100 words.

2. DB Choice ->

Current Low-Scale (Single Server): MongoDB

1. Semmi Structured Data.
2. Simple Queries: Fast and easy find/insert operations.
3. Read-Light
4. No ACID Issues
5. Easy Setup: Quick to spin up for a personal project, no complex config.

Future Scaling: MongoDB

1. Heavy Reads: Replica sets scale reads to millions/sec with low lag, way smoother than SQL’s replicas.
2. Growing Writes: Sharding handles increased writes (even if not read often) without bottlenecks, unlike SQL’s primary node.
3. Simple Scaling: Add replica sets or shards easily, no need for SQL’s clunky sharding or replica management.
4. No ACID Needs: Eventual consistency fits, keeping performance high at scale.

5. For Non Functional ONE - implementing below ones
6. Docker Implementation
7.

8. DB Schema -
9. Pretty Straight forward schema for Events and Properties. Including all the fields mentioned in DOC + a unique identifier for each document in its collection - ref. And ofcourse the metadata as create_time and update_time + validation object field.
10. Schema for Tracking Plan should be like - events and and corresponding properties should not be saved as whole data - rather like
    {
    events: [] -> type of event -> {ref: event_id/event's ref, properties_refs: [properties_refs]}
    (this also includes {validation} field as well which is used for validation conditions, ex max_len, min_len (of string object name), required: true/false)
    }
    Also if a event/properties is not in system already we first add it to events/properties collection and then use there refs according to above.
    -> In case there is a matching event/property, but some data is overriden (ex. descritpon is diff) than you need to mention those overriden objects in custom_properties section.

11. API to create ->
    /api/v1/data-catalogue -> base path
    use generic succes and error response model for all APIs though

// For Tracking Plan ->

1. Create Tracking plan (Post or Put)
   -> /tracking-plan:
   it creates a tracking plan, having name(required) and descrption(optional)
   res -> tracking plan id/ref, create_time, update_time
2. Update Tracking Plan (Post/Put/Patch)
   -> /tracking-plan/{id}
   you can update name and description both, response(u think) and req(tracking_plan_ref/id)
3. Delete Tracking Plan (Delete)
   Just like update
4. upsert event (Patch/Post)
   -> /tracking-plan/event/
   given event body, 
    {
      events: [
        {
          name: "",
          type: "",
          validation: { // validation object has field-validation_field structure
            name: { 
              min_len: ,
              max_len: ,
            },
            description: { min_len: , max_len: },
          }
          properties: [
            {
              name: "",
              type: "",
              validation: {
                name: { 
                  min_len: ,
                  max_len: ,
                },
              },
              description: "",
              reqired: true/false (specifically for properties object)
            }
          ],
          additional_properties: true/false
        }
      ]
    }
  Following cases arise: (bellow is mentioned for Event, but valid for property as well)
    1. if event already there in tracking plan - error out - as we can't modify existing event/property.
    2. If event not there in tracking plan - then 2 cases arises:
      1. If event dont exist in system (events colleciton) - create a record in system and then follow alogrithm to add to tracking plan.
      2. if event exist in system - 
        a. but request payload has modification in some fields, or have some extra fields (ex description is changed in payload from system one) -> error out, as we only use exisitng in system one.
        b. no modification - just add it to tracking plan, i.e add event object with ref, and properties ref associated with event.
    * Imp point -> don't confuse modification wiht event object having properties. Properties are separate object in itself and has to be checked same way as above as event. 
      event and properties in tracking plan are kind of associate, not a field of event object. So event payload will always have properties but ofcourse event type in events collection wont have
      any field as properties. Events are same if apart from tracking plan's event's properties object matches with existing event object.

5. Get tracking Plan By id(tracking plan's one)
6. Get All tracking Plans

// For Event and Properties (/events and /properties)

1. Tracking Plan modification to there events and properties dont modify Events and properties in base collection.
2. We cant delete those Event and properties object which exist in any tracking plan.
3. We will have same CRUD APIs for both events and properties collection. (Read for both cases by id and all list of docs)

- Remember you dont need to change data in different collection in case of event update in tracking plan / in event colleciton change -> dont make any change in tracking plan coll as anyway
  its just using ref.

6. Validation
   we can have some validation for properties object in two ways:
1. In tracking plan it goes in custom_properties field as validation object
1. In validation field in properties object in properties collection.
   \*We focus on below validations on fields
1. name -> [events,properties, tracking-plan] -> max_len, min_len
1. type -> [event, properties] -> follow doc for what values it can take.
1. required -> [properties] -> if property is required or not in tracking plan, only for tracking plan
1. additional_properties -> [event] -> if other undefined properties are allowed or not for that event, only for tracking plan.
   For above cases, error out with suitable message and status code.

There are some other validation to ensure as well, but these don't require any field to get triggered from validation object. Rather it's condtionaly checked for certain fields combination

1. Event
   a. if type is not 'track' name should be empty. Error out accordingly.

- General Note ->

1. Above should be overidden to existing instructions if already exist on problem statemen/doc, For other Functional requirements and other instructions which
   exist - follow them anyway.
2. function/method/interface/enum/class name all should be CamelCase, and variable/proeprties should be snake_case.
3. Use Mongoose, Typescript, Mongodb, express, docker as tech stack. FOllow Rest principals.
4. Use Enums in request and response wherever you feel necessary.
5. events and properties are unique by name and type as compund key , while tracking plan just by name. Dedupe according to this.
6. While Erroring out, always think for suitable status code.
7. Type defination should be made to much complex, keep it simple. If there's no significant need to define type for a object - dont define, I am happy with any or some ugly OR of types.
8. We need to create docker image, and run everything in it.
9. Add necessary logs, just absolute necessary to debug and to show result/metrics.