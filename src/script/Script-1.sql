create type cart_status as enum ('OPEN', 'ORDERED');

create table carts (
    id uuid PRIMARY KEY default uuid_generate_v4(),
    user_id uuid not null,
    created_at date not null,
    updated_at date not null,
    status cart_status not null
);

--drop table carts;

CREATE TABLE cart_items (
	cart_id uuid,
    product_id uuid,
    count integer,
    foreign key("cart_id") references "carts" ("id")
);

--drop table cart_items;


insert into carts (user_id, created_at, updated_at, status) values 
('e9122d65-0798-45bc-9759-ce84d242364e', '2022-04-06', '2022-04-06', 'OPEN'),
('57a3ba2c-a86e-4a24-b86c-3c316a8ddd77', '2022-04-06', '2022-04-06', 'ORDERED'),
('3f3fdaaa-d945-4e09-ba62-16f8e276f602', '2022-04-06', '2022-04-06', 'OPEN');

insert into cart_items (cart_id, product_id, count) values 
('e9649af7-0c8e-4c36-b5ec-eac97b037437', '7567ec4b-b10c-48c5-9345-fc73c48a80aa', 3),
('e9649af7-0c8e-4c36-b5ec-eac97b037437', '7567ec4b-b10c-48c5-9445-fc73c48a80a2', 2),
('e9649af7-0c8e-4c36-b5ec-eac97b037437', '7567ec4b-b10c-45c5-9345-fc73c48a80a1', 1),
('01c6143c-4fc3-421f-bd8d-989adbcb9040', '7567ec4b-b10c-48c5-9345-fc73c48a80a3', 2),
('01c6143c-4fc3-421f-bd8d-989adbcb9040', '7567ec4b-b10c-48c5-9345-fc73c48a80a0', 1),
('0a5b3ece-9c67-403d-88df-712e359a53f6', '7567ec4b-b10c-48c5-9345-fc73c48a80a2', 1),
('0a5b3ece-9c67-403d-88df-712e359a53f6', '7567ec4b-b10c-48c5-9345-fc73348a80a1', 1);

--DELETE FROM cart_items WHERE cart_id = 'e9649af7-0c8e-4c36-b5ec-eac97b037437' and product_id = '7567ec4b-b10c-48c5-9345-fc73c48a80aa' ;


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

