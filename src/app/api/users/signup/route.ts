import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '../../../lib/db';

interface RequestBody {
    email: string;
    password: string;
  }


  export async function POST(req: Request) {
    const { email, password }: RequestBody = await req.json();
  
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
  
    // Check if the user already exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
    if (result.rows.length > 0) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Insert the new user into the database
    try {
      const insertQuery = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *';
      const newUser = await pool.query(insertQuery, [email, hashedPassword]);
  
      return NextResponse.json({ message: 'User created successfully', user: newUser.rows[0] });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ message: 'Error occurred during sign up' }, { status: 500 });
    }
  }