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

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // For testing, just return the UID
    return res.status(200).json({ 
      message: 'Test successful',
      uid: uid,
      env: {
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
      }
    });
  } catch (error) {
    // Always return JSON, even for errors
    return res.status(500).json({ 
      error: 'Server error',
      details: error.message || 'Unknown error',
      type: 'json_error'
    });
  }
} 