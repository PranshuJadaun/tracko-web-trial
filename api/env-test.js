export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    // Check if we can access environment variables
    const envCheck = {
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      clientEmailLength: process.env.FIREBASE_CLIENT_EMAIL?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelRegion: process.env.VERCEL_REGION
    };

    // Try to import Firebase Admin
    let firebaseAdminCheck = {
      canImport: false,
      error: null
    };

    try {
      const { initializeApp, cert, getApps } = await import('firebase-admin/app');
      const { getAuth } = await import('firebase-admin/auth');
      firebaseAdminCheck.canImport = true;
    } catch (error) {
      firebaseAdminCheck.error = {
        message: error.message,
        code: error.code,
        name: error.name
      };
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      firebaseAdmin: firebaseAdminCheck
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