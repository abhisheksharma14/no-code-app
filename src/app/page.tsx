'use client';

import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

export default function Home() {
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏦 Maersk Bank
          </h1>
          <p className="text-lg text-gray-600">
            Your digital banking solution powered by AI-assisted development
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg shadow-md">
            <button
              onClick={() => setCurrentView('login')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                currentView === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setCurrentView('signup')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                currentView === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex justify-center">
          {currentView === 'login' ? (
            <LoginForm />
          ) : (
            <SignupForm />
          )}
        </div>

        {/* API Features */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            API Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">User Management</h3>
              <p className="text-gray-600 text-sm">
                Create, read, update, and delete user accounts with proper validation
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">JWT Authentication</h3>
              <p className="text-gray-600 text-sm">
                Secure authentication with JSON Web Tokens and bcrypt password hashing
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">Data Validation</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive input validation using Zod schemas
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">Error Handling</h3>
              <p className="text-gray-600 text-sm">
                Proper HTTP status codes and error messages for all scenarios
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}