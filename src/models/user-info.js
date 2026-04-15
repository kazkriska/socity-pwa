"use server";

import pool from "@/lib/db";

export async function createUserInfo({
  user_id,
  name = null,
  email = null,
  mobile_number = null,
  number_of_cars = null,
}) {
  const query = `
        INSERT INTO user_info (
            user_id, name, email, mobile_number, number_of_cars
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

  const values = [user_id, name, email, mobile_number, number_of_cars];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function getAllUserInfo() {
  const { rows } = await pool.query(`
        SELECT * FROM user_info
        ORDER BY id;
    `);
  return rows;
}

export async function getUserInfoById(id) {
  const { rows } = await pool.query(`SELECT * FROM user_info WHERE id = $1;`, [
    id,
  ]);
  return rows[0] || null;
}

export async function getUserInfoByUserId(user_id) {
  const { rows } = await pool.query(
    `SELECT * FROM user_info WHERE user_id = $1;`,
    [user_id],
  );
  return rows[0] || null;
}

export async function updateUserInfo(user_id, updates) {
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
        UPDATE user_info
        SET ${fields.join(", ")}
        WHERE user_id = $${index}
        RETURNING *;
    `;

  values.push(user_id);

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

export async function deleteUserInfo(user_id) {
  const { rowCount } = await pool.query(
    `DELETE FROM user_info WHERE user_id = $1;`,
    [user_id],
  );
  return rowCount > 0;
}
