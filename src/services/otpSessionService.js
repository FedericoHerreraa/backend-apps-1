import { getAuth } from './firebaseAdmin.js';
import * as firestoreUserService from './firestoreUserService.js';
import * as firebaseAuthService from './firebaseAuthService.js';


export async function createSessionAfterOtpVerified(email) {
  const normalized = email.toLowerCase().trim();
  const auth = getAuth();

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(normalized);
  } catch (err) {
    if (err?.code !== 'auth/user-not-found') {
      throw err;
    }
    userRecord = await auth.createUser({
      email: normalized,
      emailVerified: true,
    });
  }

  const profile = await firestoreUserService.ensureUserDocument(userRecord.uid, {
    email: userRecord.email || normalized,
    displayName: userRecord.displayName || null,
  });

  const customToken = await auth.createCustomToken(userRecord.uid);
  const { idToken, refreshToken, expiresIn } = await firebaseAuthService.exchangeCustomTokenForIdToken(customToken);

  return {
    idToken,
    refreshToken,
    expiresIn,
    user: profile,
  };
}
