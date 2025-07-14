1. name field in property/event should be enum (integer) and Frontend should send them as integer enum only in request.
2. Why Choose MongoDB ->

  Current Low-Scale (Single Server):
  1. Semi-Structured Data: MongoDB’s document model handles JSON-like data (e.g., user profiles) without rigid schemas, perfect for your  flexible data needs.
  2. Simple Queries: Fast and easy find/insert operations (e.g., db.users.findOne({ user_id: "123" })) for your basic queries.
  3. Read-Heavy: Crushes reads with indexes, even on a single server, for your small dataset.
  4. No ACID Issues: Single server means no replication lag or consistency problems, and you don’t need strict ACID anyway.
  5. Easy Setup: Quick to spin up for a personal project, no complex config.

  Future Scaling:
  1. Heavy Reads: Replica sets scale reads to millions/sec with low lag, way smoother than SQL’s replicas.
  2. Growing Writes: Sharding handles increased writes (even if not read often) without bottlenecks, unlike SQL’s primary node.
  3. Semi-Structured Data: Native document model stays fast for dynamic data, beating SQL’s JSONB overhead.
  4. Simple Scaling: Add replica sets or shards easily, no need for SQL’s clunky sharding or replica management.
  5. No ACID Needs: Eventual consistency fits your vibe, keeping performance high at scale.
3. For Non Functional ONE - implementing below ones
  1. Docker Implementation
  2. Advanced Validation(ex - price should always be integer)