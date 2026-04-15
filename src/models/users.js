"use server";

import pool from "@/lib/db";

// CREATE USER
export async function createUser({
  society = "Sarita Vihar",
  pocket,
  flat_number,
  access_pin_hash = null,
}) {
  const query = `
        INSERT INTO users (society, pocket, flat_number, access_pin_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
  const values = [society, pocket, flat_number, access_pin_hash];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

// GET ALL USERS
export async function getAllUsers() {
  const { rows } = await pool.query(`SELECT * FROM users ORDER BY id;`);
  return rows;
}

// GET USER BY ID
export async function getUserById(id) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1;`, [id]);
  return rows[0] || null;
}

// GET USER BY UID
export async function getUserByUID(uid) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE uid = $1;`, [
    uid,
  ]);
  return rows[0] || null;
}

// UPDATE USER (partial update supported)
export async function updateUser(id, updates) {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in updates) {
    fields.push(`${key} = $${index}`);
    values.push(updates[key]);
    index++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING *;
    `;

  values.push(id);

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

// DELETE USER
export async function deleteUser(id) {
  const { rowCount } = await pool.query(`DELETE FROM users WHERE id = $1;`, [
    id,
  ]);
  return rowCount > 0;
}

export async function getUsersWithDuePaymentsNested() {
  const query = `
        SELECT 
            u.id,
            u.society,
            u.pocket,
            u.flat_number,
            u.uid,
            u.access_pin_hash,
            json_agg(
                json_build_object(
                    'id', p.id,
                    'payment_for_month', p.payment_for_month,
                    'payment_status', p.payment_status,
                    'amount', p.amount,
                    'payment_success_notes', p.payment_success_notes
                )
            ) AS due_payments
        FROM users u
        INNER JOIN payments p
            ON u.id = p.user_id
        WHERE p.payment_status = 'due'
        GROUP BY u.id
        ORDER BY u.id;
    `;

  const { rows } = await pool.query(query);
  return rows;
}

export async function updateUserAccessPin(userId, access_pin_hash) {
  const query = `
        UPDATE users
        SET access_pin_hash = $1
        WHERE id = $2
        RETURNING id, access_pin_hash;
    `;

  const values = [access_pin_hash, userId];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

export async function getUserFullProfile(userId) {
  const query = `
        SELECT 
            u.id,
            u.society,
            u.pocket,
            u.flat_number,
            u.uid,
            u.access_pin_hash,

            -- user_info (1:1)
            json_build_object(
                'id', ui.id,
                'name', ui.name,
                'email', ui.email,
                'mobile_number', ui.mobile_number,
                'number_of_cars', ui.number_of_cars
            ) AS user_info,

            -- payments (1:many)
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', p.id,
                        'payment_for_month', p.payment_for_month,
                        'payment_status', p.payment_status,
                        'amount', p.amount,
                        'payment_success_notes', p.payment_success_notes
                    )
                    ORDER BY p.id
                ) FILTER (WHERE p.id IS NOT NULL),
                '[]'
            ) AS payments

        FROM users u
        LEFT JOIN user_info ui
            ON u.id = ui.user_id
        LEFT JOIN payments p
            ON u.id = p.user_id
        WHERE u.id = $1
        GROUP BY u.id, ui.id;
    `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}
