import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  // In-memory fallback database for users so the app works reliably in AI Studio sandbox
  const memoryUsers = new Map<string, { firstName: string; lastName: string; username: string; password: string }>();
  const developerApps = new Map<string, { clientId: string; clientSecret: string; appName: string; redirectUri: string; owner: string }>();
  const authCodes = new Map<string, { username: string; clientId: string; redirectUri: string; expiresAt: number }>();

  // Attempt MySQL connection with graceful fallback
  let mysqlPool: any = null;
  try {
    mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'brtlg4exutshwgqmiirt-mysql.services.clever-cloud.com',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'utb2xw1clxaeh4ip',
      password: process.env.MYSQL_PASSWORD || 'PxZWT62NVyoQ2d4vg7qG',
      database: process.env.MYSQL_DATABASE || 'brtlg4exutshwgqmiirt',
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 5,
    });

    mysqlPool.query('SELECT 1', (err: any) => {
      if (err) {
        console.warn('[MySQL] Could not connect to remote MySQL database. Using in-memory fallback store.', err.message);
        mysqlPool = null;
      } else {
        console.log('[MySQL] Successfully connected to MySQL database!');
        // Ensure users table exists
        mysqlPool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `, (tableErr: any) => {
          if (tableErr) {
            console.warn('[MySQL] Could not create users table:', tableErr.message);
          } else {
            console.log('[MySQL] Users table verified/created successfully.');
          }
        });
      }
    });
  } catch (err) {
    console.warn('[MySQL] Error initializing MySQL pool. Using in-memory fallback store.');
    mysqlPool = null;
  }

  // API Routes
  app.post('/api/signup', async (req, res) => {
    try {
      const { firstName, lastName, username, password } = req.body;
      if (!username || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const cleanUsername = username.trim().toLowerCase();
      const hashedPassword = await bcrypt.hash(password, 10);

      if (mysqlPool) {
        mysqlPool.query(
          'INSERT INTO users (first_name, last_name, username, password) VALUES (?, ?, ?, ?)',
          [firstName, lastName, cleanUsername, hashedPassword],
          (err: any, result: any) => {
            if (err) {
              console.error('MySQL signup error:', err);
              if (err.code === 'ER_DUP_ENTRY' || memoryUsers.has(cleanUsername)) {
                return res.status(400).json({ message: 'Username already exists' });
              }
              memoryUsers.set(cleanUsername, { firstName, lastName, username: cleanUsername, password: hashedPassword });
              return res.status(200).json({ message: 'User registered successfully (fallback)' });
            }
            return res.status(200).json({ message: 'User registered successfully' });
          }
        );
      } else {
        if (memoryUsers.has(cleanUsername)) {
          return res.status(400).json({ message: 'Username already exists' });
        }
        memoryUsers.set(cleanUsername, { firstName, lastName, username: cleanUsername, password: hashedPassword });
        return res.status(200).json({ message: 'User registered successfully' });
      }
    } catch (error: any) {
      console.error('Signup exception:', error);
      res.status(500).json({ message: 'Error during sign-up' });
    }
  });

  app.post('/api/check-username', async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: 'Username is required' });
      }
      const cleanUsername = username.trim().toLowerCase();

      if (mysqlPool) {
        mysqlPool.query(
          'SELECT * FROM users WHERE username = ?',
          [cleanUsername],
          (err: any, results: any[]) => {
            if (err || !results || results.length === 0) {
              if (!memoryUsers.has(cleanUsername)) {
                return res.status(404).json({ message: "Sanscount doesn't exist!" });
              }
            }
            return res.json({ exists: true });
          }
        );
      } else {
        if (!memoryUsers.has(cleanUsername)) {
          return res.status(404).json({ message: "Sanscount doesn't exist!" });
        }
        return res.json({ exists: true });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Sanscount doesn't exist!" });
    }
  });

  app.post('/api/signin', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const cleanUsername = username.trim().toLowerCase();

      if (mysqlPool) {
        mysqlPool.query(
          'SELECT * FROM users WHERE username = ?',
          [cleanUsername],
          async (err: any, results: any[]) => {
            if (err || !results || results.length === 0) {
              const user = memoryUsers.get(cleanUsername);
              if (!user) {
                return res.status(404).json({ message: "Sanscount doesn't exist!" });
              }
              const match = await bcrypt.compare(password, user.password);
              if (!match) {
                return res.status(401).json({ message: "Incorrect password!" });
              }
              return res.json({ message: 'Sign in successful', user: { username: user.username, firstName: user.firstName } });
            }

            const dbUser = results[0];
            const storedPassword = dbUser.password || dbUser.sassword;
            let match = false;
            if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'))) {
              match = await bcrypt.compare(password, storedPassword);
            } else {
              match = password === storedPassword;
            }

            if (!match) {
              return res.status(401).json({ message: "Incorrect password!" });
            }

            return res.json({ message: 'Sign in successful', user: { username: dbUser.username, firstName: dbUser.first_name || dbUser.firstName } });
          }
        );
      } else {
        const user = memoryUsers.get(cleanUsername);
        if (!user) {
          return res.status(404).json({ message: "Sanscount doesn't exist!" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.status(401).json({ message: "Incorrect password!" });
        }
        return res.json({ message: 'Sign in successful', user: { username: user.username, firstName: user.firstName } });
      }
    } catch (error: any) {
      console.error('Signin exception:', error);
      res.status(500).json({ message: "Sanscount doesn't exist!" });
    }
  });

  // SansCounts Auth OAuth 2.0 Provider Endpoints for Developers
  app.post('/api/oauth/register-app', (req, res) => {
    const { appName, redirectUri, owner } = req.body;
    if (!appName || !redirectUri) {
      return res.status(400).json({ message: 'App Name and Redirect URI are required' });
    }
    const clientId = 'sc_' + crypto.randomBytes(12).toString('hex');
    const clientSecret = 'sc_sec_' + crypto.randomBytes(20).toString('hex');

    developerApps.set(clientId, { clientId, clientSecret, appName, redirectUri, owner: owner || 'developer' });
    res.json({ clientId, clientSecret, appName, redirectUri, message: 'SansCounts Auth App registered successfully' });
  });

  app.get('/api/oauth/authorize', (req, res) => {
    const { client_id, redirect_uri } = req.query;
    const appInfo = developerApps.get(String(client_id));
    if (!appInfo) {
      return res.status(400).json({ error: 'Invalid client_id' });
    }
    res.json({ status: 'active', appName: appInfo.appName, redirectUri: appInfo.redirectUri });
  });

  app.post('/api/oauth/token', async (req, res) => {
    const { client_id, client_secret, code } = req.body;
    const appInfo = developerApps.get(client_id);
    if (!appInfo || appInfo.clientSecret !== client_secret) {
      return res.status(401).json({ error: 'Invalid client credentials' });
    }
    const codeData = authCodes.get(code);
    if (!codeData || codeData.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired authorization code' });
    }
    authCodes.delete(code);
    const accessToken = 'sc_token_' + crypto.randomBytes(24).toString('hex');
    res.json({ access_token: accessToken, token_type: 'Bearer', username: codeData.username });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
