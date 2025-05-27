import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import cookie from 'cookie';

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    initialized = true;
  }

  const cookies = cookie.parse(req.headers.cookie || '');
  const sessionCookie = cookies.session || '';

  try {
    const decoded = await getAuth().verifySessionCookie(sessionCookie, true);
    res.status(200).json({ uid: decoded.uid, email: decoded.email });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
