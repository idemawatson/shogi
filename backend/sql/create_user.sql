CREATE TABLE "user" (
  user_id serial PRIMARY KEY,
  name varchar(10) NOT NULL,
  password varchar(10) NOT NULL,
  UNIQUE ( name )
);