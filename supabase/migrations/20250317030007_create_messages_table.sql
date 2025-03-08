create table messages (
  id text primary key,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  session_id text not null references visits(id),
  original_text text not null,
  is_clinician boolean not null,
  translated_text text
);

create index messages_session_id_idx on messages(session_id);
