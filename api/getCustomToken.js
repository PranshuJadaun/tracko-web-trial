import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let firebaseApp;
let auth;

try {
  console.log('Checking Firebase Admin initialization...');
  if (!getApps().length) {
    console.log('Initializing Firebase Admin...');
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.error('Missing Firebase Admin credentials');
      console.error('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set');
      console.error('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not set');
      throw new Error('Missing Firebase Admin credentials');
    }

    firebaseApp = initializeApp({
      credential: cert({
        projectId: "tracko-ext",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      })
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    console.log('Firebase Admin already initialized');
    firebaseApp = getApps()[0];
  }
  
  auth = getAuth(firebaseApp);
  console.log('Firebase Auth initialized successfully');
} catch (error) {
  console.error('Error during Firebase Admin initialization:', error);
  throw error;
}

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

    console.log('Creating custom token for user:', uid);
    
    // Create a custom token
    const customToken = await auth.createCustomToken(uid);
    console.log('Custom token created successfully');
    
    return res.status(200).json({ token: customToken });
  } catch (error) {
    console.error('Error in API handler:', error);
    // Always return JSON, even for errors
    return res.status(500).json({ 
      error: {
        code: error.code || 'FIREBASE_ERROR',
        message: error.message || 'Unknown error',
        details: error.stack,
        type: error.name
      }
    });
  }
} 