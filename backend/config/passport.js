require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { getQuery, runQuery } = require('../database/database');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5001/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔍 Google OAuth profile:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName
    });

    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    const googleId = profile.id;

    if (!email) {
      return done(new Error('No email found in Google profile'), null);
    }

    // Check if user already exists by email
    let user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);

    if (user) {
      // User exists - update with Google ID if not set
      if (!user.google_id) {
        await runQuery(
          'UPDATE users SET google_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [googleId, user.id]
        );
        user.google_id = googleId;
      }
      console.log('✅ Existing user logged in via Google:', user.email);
      return done(null, user);
    } else {
      // Create new user
      const result = await runQuery(`
        INSERT INTO users (name, email, google_id, japanese_level, created_at, updated_at) 
        VALUES (?, ?, ?, 'N5', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [name, email, googleId]);

      const newUser = await getQuery('SELECT * FROM users WHERE id = ?', [result.id]);
      console.log('✅ New user created via Google OAuth:', newUser.email);
      return done(null, newUser);
    }

  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    return done(error, null);
  }
}));

// Microsoft OAuth Strategy (using passport-microsoft for Azure AD)
const MicrosoftStrategy = require('passport-microsoft').Strategy;

passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: "/api/auth/microsoft/callback",
  scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔍 Microsoft OAuth profile:', {
      id: profile.id,
      email: profile.emails?.[0]?.value || profile.userPrincipalName,
      name: profile.displayName
    });

    const email = profile.emails?.[0]?.value || profile.userPrincipalName;
    const name = profile.displayName;
    const microsoftId = profile.id;

    if (!email) {
      return done(new Error('No email found in Microsoft profile'), null);
    }

    // Check if user already exists by email
    let user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);

    if (user) {
      // User exists - update with Microsoft ID if not set
      if (!user.microsoft_id) {
        await runQuery(
          'UPDATE users SET microsoft_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [microsoftId, user.id]
        );
        user.microsoft_id = microsoftId;
      }
      console.log('✅ Existing user logged in via Microsoft:', user.email);
      return done(null, user);
    } else {
      // Create new user
      const result = await runQuery(`
        INSERT INTO users (name, email, microsoft_id, japanese_level, created_at, updated_at) 
        VALUES (?, ?, ?, 'N5', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [name, email, microsoftId]);

      const newUser = await getQuery('SELECT * FROM users WHERE id = ?', [result.id]);
      console.log('✅ New user created via Microsoft OAuth:', newUser.email);
      return done(null, newUser);
    }

  } catch (error) {
    console.error('❌ Microsoft OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;