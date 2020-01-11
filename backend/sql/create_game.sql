CREATE TABLE game (
  game_id serial PRIMARY KEY,
  p1_id int REFERENCES "user"(user_id),
  p2_id int REFERENCES "user"(user_id),
  board text,
  state text,
  p1_holding text,
  p2_holding text,
  turn integer NOT NULL REFERENCES "user"(user_id),
  count integer DEFAULT 0,
  update_date date
);