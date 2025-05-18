import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    // Log environment variables (without exposing sensitive data)
    const envInfo = {
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      clientEmailLength: process.env.FIREBASE_CLIENT_EMAIL?.length || 0,
      projectId: "tracko-ext"
    };

    console.log('Environment info:', envInfo);

    // Try to initialize Firebase Admin
    let firebaseApp;
    let auth;
    let initError = null;

    try {
      if (!getApps().length) {
        console.log('Initializing Firebase Admin...');
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        
        if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
          throw new Error('Missing Firebase Admin credentials');
        }

        // Log private key format (without exposing the actual key)
        console.log('Private key format:', {
          startsWith: privateKey.substring(0, 20) + '...',
          endsWith: '...' + privateKey.substring(privateKey.length - 20),
          containsNewlines: privateKey.includes('\n'),
          length: privateKey.length
        });

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
      console.error('Firebase initialization error:', error);
      initError = {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      };
    }

    // Return diagnostic information
    return res.status(200).json({
      success: !initError,
      environment: envInfo,
      firebase: {
        initialized: !!firebaseApp,
        hasAuth: !!auth,
        error: initError
      }
    });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
        type: 'HANDLER_ERROR'
      }
    });
  }
} 