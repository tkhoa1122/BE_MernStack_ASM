const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Members = require('../models/Member');
const { signToken } = require('../middleware/auth');

// Configure Google strategy if env vars are present
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = process.env;
const CALLBACK_URL = GOOGLE_CALLBACK_URL || '/oauth/google/callback';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          if (!email) return done(new Error('No email from Google'));
          let user = await Members.findOne({ email });
          if (!user) {
            user = await Members.create({
              email,
              password: Math.random().toString(36).slice(2), // random password (hashed by pre-save)
              name: profile.displayName || email.split('@')[0],
              isAdmin: false,
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  // Serialize / deserialize (not used for sessions but required by passport)
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const u = await Members.findById(id).lean();
      done(null, u);
    } catch (e) {
      done(e);
    }
  });

  // Start OAuth flow
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  // Callback — set JWT cookie and redirect
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
      // req.user is the member
      const token = signToken(req.user);
      res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
      res.redirect('/');
    },
  );
} else {
  // If not configured, provide stub routes that inform the developer
  router.get('/google', (req, res) => {
    res.status(501).send('Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  });
  router.get('/google/callback', (req, res) => {
    res.status(501).send('Google OAuth not configured.');
  });
}

module.exports = router;
