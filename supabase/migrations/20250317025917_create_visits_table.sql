create table visits (
  id text primary key,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  summary text,
  tool_calls jsonb
);
