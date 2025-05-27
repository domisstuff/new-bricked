import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import cookie from 'cookie';

let initialized = false;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

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

  const { idToken } = req.body;
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    res.setHeader('Set-Cookie', cookie.serialize('session', sessionCookie, {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'Strict',
      maxAge: expiresIn / 1000,
    }));

    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
