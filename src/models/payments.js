"use server";

import pool from "@/lib/db";

// CREATE PAYMENT
export async function createPayment({
  user_id,
  payment_for_month,
  payment_status,
  amount,
  payment_success_notes = null,
}) {
  const query = `
        INSERT INTO payments (
            user_id,
            payment_for_month,
            payment_status,
            amount,
            payment_success_notes
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

  const values = [
    user_id,
    payment_for_month,
    payment_status,
    amount,
    payment_success_notes,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

// GET ALL PAYMENTS
export async function getAllPayments() {
  const { rows } = await pool.query(`
        SELECT * FROM payments
        ORDER BY id;
    `);
  return rows;
}

// GET PAYMENT BY ID
export async function getPaymentById(id) {
  const { rows } = await pool.query(`SELECT * FROM payments WHERE id = $1;`, [
    id,
  ]);
  return rows[0] || null;
}

// GET PAYMENTS BY USER ID (1-to-many relation)
export async function getPaymentsByUserId(user_id) {
  const { rows } = await pool.query(
    `SELECT * FROM payments WHERE user_id = $1 ORDER BY id;`,
    [user_id],
  );
  return rows;
}

// UPDATE PAYMENT (partial update)
export async function updatePayment(id, updates) {
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
        UPDATE payments
        SET ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING *;
    `;

  values.push(id);

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

// DELETE PAYMENT
export async function deletePayment(id) {
  const { rowCount } = await pool.query(`DELETE FROM payments WHERE id = $1;`, [
    id,
  ]);
  return rowCount > 0;
}
