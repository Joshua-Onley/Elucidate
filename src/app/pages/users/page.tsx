'use client';
import { useState, useEffect } from 'react';

// Define types for the user data
interface User {
  id: number;
  name: string;
  email: string;
  bio?: string; // Optional bio field
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]); // Use the User type for users state
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        // Explicitly type the error as an instance of Error
        if (err instanceof Error) {
          setError(`Failed to fetch users: ${err.message}`);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchUsers();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      
      {error && <p className="text-red-500">{error}</p>}
      
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="border p-4 rounded">
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            {user.bio && <p>Bio: {user.bio}</p>} {/* Conditionally display bio */}
          </li>
        ))}
      </ul>
    </main>
  );
}
