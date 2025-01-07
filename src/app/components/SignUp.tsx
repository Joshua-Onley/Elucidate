'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import the useRouter hook

interface SignUpFormData {
    email: string;
    password: string;
}

export default function SignUp() {
    const [formData, setFormData] = useState<SignUpFormData>({
        email: '',
        password: '',
    });

    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const router = useRouter(); // Initialize the router

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Email and Password are required');
            return;
        }

        try {
            const res = await fetch('/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Corrected typo
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Signup Successful');
                setFormData({ email: '', password: '' });

                // Redirect to the home page (or any other page you want)
                router.push('/pages/home'); // '/' is the home page
            } else {
                setError(data.message || 'Failed to sign up');
            }
        } catch (err) {
            console.error(err); // Log error for debugging
            setError('Error during sign up');
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

            {error && <p className="text-red-500">{error}</p>}
            {message && <p className="text-green-500">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>



                <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
                    Sign Up
                </button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-sm">
                    Already have an account?{' '}
                    <button
                        onClick={() => router.push('/')}
                        className="text-blue-500 underline"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
}
