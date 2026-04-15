code a '.sql' which will create the following tables with the given relationships:

1. Table 'users' withe the following columns:

- id; as primary key
- society; not null, default value sarita vihar
- pocket; not null, char(1)
- flat_number; not null, int, unique
- uid; not null, uuid, unique
- access_pin_hash; nullable, text

1. Table 'payments' with the following columns:

- id; as primary key
- user.id; not null, as foreign key mapped to 'users' table, 1 row from users table can relate to multiple rows in payments table
- payment_for_month; not null, text
- payment_status; not null, enum ['pending', 'due']
- amount; not null, text
- payment_success_notes; nullable; json
