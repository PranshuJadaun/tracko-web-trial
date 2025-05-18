import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin only if it hasn't been initialized
if (!getApps().length) {
  try {
    console.log('Initializing Firebase Admin...');
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.error('Missing Firebase Admin credentials');
      console.error('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set');
      console.error('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not set');
      throw new Error('Missing Firebase Admin credentials');
    }

    initializeApp({
      credential: cert({
        projectId: "tracko-ext",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      })
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error; // Re-throw to prevent the app from running with invalid credentials
  }
}

const auth = getAuth();

export default async function handler(req, res) {
  // Set JSON content type for all responses
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Creating custom token for user:', uid);
    
    // Create a custom token
    const customToken = await auth.createCustomToken(uid);
    console.log('Custom token created successfully');
    
    return res.status(200).json({ token: customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    // Ensure we always return a JSON response
    return res.status(500).json({ 
      error: 'Failed to create custom token',
      details: error.message || 'Unknown error'
    });
  }
} 