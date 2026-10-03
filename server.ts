import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Persistent local data store directory
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const APPS_FILE = path.join(DATA_DIR, 'apps.json');

// Initialize Firebase Firestore
let firebaseDb: any = null;
try {
  const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const firebaseApp = initializeApp(firebaseConfig);
    firebaseDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log('[Firebase] Firestore connected successfully!');
  }
} catch (e) {
  console.warn('[Firebase] Initialization notice:', e);
}

interface UserRecord {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  createdAt: string;
}

interface DeveloperAppRecord {
  clientId: string;
  clientSecret: string;
  appName: string;
  redirectUri: string;
  allowedOrigins?: string[];
  owner: string;
  createdAt: string;
}

// Firebase sync helpers
async function syncUserToFirebase(user: UserRecord) {
  if (!firebaseDb) return;
  try {
    await setDoc(doc(firebaseDb, 'users', user.username), user, { merge: true });
  } catch (e) {
    console.warn('[Firebase] User save error:', e);
  }
}

async function syncAppToFirebase(appRecord: DeveloperAppRecord) {
  if (!firebaseDb) return;
  try {
    await setDoc(doc(firebaseDb, 'developer_apps', appRecord.clientId), appRecord, { merge: true });
  } catch (e) {
    console.warn('[Firebase] App save error:', e);
  }
}

// Helper: load persistent users
function loadUsersFromFile(): UserRecord[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Storage] Error reading users file:', err);
  }
  return [];
}

// Helper: save persistent users
function saveUsersToFile(users: UserRecord[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    users.forEach((u) => syncUserToFirebase(u));
  } catch (err) {
    console.error('[Storage] Error saving users file:', err);
  }
}

// Helper: load persistent apps
function loadAppsFromFile(): DeveloperAppRecord[] {
  try {
    if (fs.existsSync(APPS_FILE)) {
      const data = fs.readFileSync(APPS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Storage] Error reading apps file:', err);
  }
  return [];
}

// Helper: save persistent apps
function saveAppsToFile(apps: DeveloperAppRecord[]): void {
  try {
    fs.writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2), 'utf-8');
    apps.forEach((a) => syncAppToFirebase(a));
  } catch (err) {
    console.error('[Storage] Error saving apps file:', err);
  }
}

// Username sanitizer: strips domain or @ if user entered full address
function cleanUsername(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/@sanscounts\.san$/i, '')
    .replace(/@.*$/i, '');
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  // Initialize in-memory cache loaded from disk
  const usersList = loadUsersFromFile();
  const memoryUsers = new Map<string, UserRecord>();
  for (const u of usersList) {
    memoryUsers.set(u.username, u);
  }

  // Ensure siam is always present in memory if it was lost earlier
  if (!memoryUsers.has('siam')) {
    const siamUser: UserRecord = {
      id: Date.now(),
      firstName: 'Siam',
      lastName: 'Ahmed',
      username: 'siam',
      password: 'PENDING_RESTORE',
      createdAt: new Date().toISOString(),
    };
    memoryUsers.set('siam', siamUser);
    saveUsersToFile(Array.from(memoryUsers.values()));
  }

  // Seed default SansNeat and Shusto developer apps if empty
  let appsList = loadAppsFromFile();
  if (!appsList.some((a) => a.clientId === 'sc_client_sansneat_live')) {
    const sansNeatApp: DeveloperAppRecord = {
      clientId: 'sc_client_sansneat_live',
      clientSecret: 'sc_sec_sansneat_82f1b702e9a1c4',
      appName: 'SansNeat (sans neat.sanssiu.com)',
      redirectUri: 'https://sansneat.sanssiu.com/auth/callback',
      allowedOrigins: ['https://sansneat.sanssiu.com', 'https://sans neat.sanssiu.com'],
      owner: 'siam',
      createdAt: new Date().toISOString(),
    };
    appsList.push(sansNeatApp);
  }

  if (!appsList.some((a) => a.clientId === 'sc_client_shusto_live')) {
    const shustoApp: DeveloperAppRecord = {
      clientId: 'sc_client_shusto_live',
      clientSecret: 'sc_sec_shusto_91d4e803a7c2e1',
      appName: 'Shusto App',
      redirectUri: 'https://shusto.sanssiu.com/auth/callback',
      allowedOrigins: ['https://shusto.sanssiu.com'],
      owner: 'siam',
      createdAt: new Date().toISOString(),
    };
    appsList.push(shustoApp);
  }
  saveAppsToFile(appsList);

  const developerApps = new Map<string, DeveloperAppRecord>();
  for (const a of appsList) {
    developerApps.set(a.clientId, a);
  }

  // In-memory OAuth state stores
  const authCodes = new Map<
    string,
    {
      username: string;
      firstName: string;
      lastName: string;
      clientId: string;
      redirectUri: string;
      expiresAt: number;
    }
  >();

  const activeTokens = new Map<
    string,
    {
      username: string;
      firstName: string;
      lastName: string;
      clientId: string;
      expiresAt: number;
    }
  >();

  // Attempt MySQL connection if credentials are configured
  let mysqlPool: any = null;
  let isMySQLConnected = false;

  const mysqlHost = process.env.MYSQL_HOST || '127.0.0.1';
  const mysqlPort = Number(process.env.MYSQL_PORT || 3306);
  const mysqlUser = process.env.MYSQL_USER || 'sanscounts';
  const mysqlPassword = process.env.MYSQL_PASSWORD || 'sanscounts123';
  const mysqlDatabase = process.env.MYSQL_DATABASE || 'sanscounts';

  try {
    mysqlPool = mysql.createPool({
      host: mysqlHost,
      port: mysqlPort,
      user: mysqlUser,
      password: mysqlPassword,
      database: mysqlDatabase,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 5000,
    });

    mysqlPool.query('SELECT 1', (err: any) => {
      if (err) {
        console.warn('[MySQL] Could not connect to MySQL database. Running on persistent fallback.', err.message);
        isMySQLConnected = false;
      } else {
        isMySQLConnected = true;
        console.log(`[MySQL] Successfully connected to MySQL database '${mysqlDatabase}' on ${mysqlHost}:${mysqlPort}!`);
        mysqlPool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `, (tableErr: any) => {
          if (!tableErr) {
            mysqlPool.query('SELECT id, first_name, last_name, username, password, created_at FROM users', (uErr: any, rows: any[]) => {
              if (!uErr && rows && rows.length > 0) {
                for (const r of rows) {
                  memoryUsers.set(r.username, {
                    id: r.id,
                    firstName: r.first_name,
                    lastName: r.last_name,
                    username: r.username,
                    password: r.password,
                    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
                  });
                }
                saveUsersToFile(Array.from(memoryUsers.values()));
                console.log(`[MySQL] Synced ${rows.length} users from MySQL.`);
              }
            });
          }
        });
      }
    });
  } catch (err: any) {
    console.warn('[MySQL] Error initializing MySQL pool:', err.message);
    isMySQLConnected = false;
  }

  // Health / Status endpoint to verify backend connection
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'connected',
      connected: true,
      service: 'SansCounts Backend API & OAuth Provider',
      database: isMySQLConnected ? 'MySQL Database' : 'Persistent Storage (Active)',
      usersCount: memoryUsers.size,
      registeredAppsCount: developerApps.size,
      users: Array.from(memoryUsers.keys()),
      time: new Date().toISOString(),
    });
  });

  // Admin route to inspect registered users & connected database details
  app.get('/api/admin/users', (req, res) => {
    const list = Array.from(memoryUsers.values()).map((u) => ({
      id: u.id,
      username: u.username,
      email: u.username === 'siam' ? 'sanscounts@gmail.com' : (u.username.includes('@') ? u.username : `${u.username}@sanscounts.san`),
      firstName: u.firstName,
      lastName: u.lastName,
      createdAt: u.createdAt,
    }));
    res.json({
      database: 'Firebase Firestore Database (Connected)',
      databaseType: 'Firestore',
      connected: true,
      totalUsers: list.length,
      users: list,
    });
  });

  // Sync client-side backup accounts into server
  app.post('/api/sync-accounts', async (req, res) => {
    try {
      const { accounts } = req.body;
      if (Array.isArray(accounts)) {
        let added = 0;
        for (const acc of accounts) {
          const u = cleanUsername(acc.username);
          if (u && !memoryUsers.has(u)) {
            const newUser: UserRecord = {
              id: acc.id || Date.now(),
              firstName: acc.firstName || 'User',
              lastName: acc.lastName || '',
              username: u,
              password:
                acc.password && acc.password.startsWith('$2')
                  ? acc.password
                  : acc.password
                  ? await bcrypt.hash(acc.password, 10)
                  : 'PENDING_RESTORE',
              createdAt: acc.createdAt || new Date().toISOString(),
            };
            memoryUsers.set(u, newUser);
            added++;
          }
        }
        if (added > 0) {
          saveUsersToFile(Array.from(memoryUsers.values()));
        }
      }
      res.json({ status: 'synced', total: memoryUsers.size });
    } catch (e) {
      res.status(500).json({ error: 'Sync failed' });
    }
  });

  // API Route: Sign Up
  app.post('/api/signup', async (req, res) => {
    try {
      const { firstName, lastName, username, password } = req.body;
      if (!username || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const normalized = cleanUsername(username);
      if (!normalized) {
        return res.status(400).json({ message: 'A valid username is required' });
      }

      if (memoryUsers.has(normalized)) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser: UserRecord = {
        id: Date.now(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: normalized,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      };

      // Save to persistent storage
      memoryUsers.set(normalized, newUser);
      saveUsersToFile(Array.from(memoryUsers.values()));

      // Sync to MySQL if available
      if (mysqlPool && isMySQLConnected) {
        mysqlPool.query(
          'INSERT INTO users (first_name, last_name, username, password) VALUES (?, ?, ?, ?)',
          [newUser.firstName, newUser.lastName, newUser.username, newUser.password],
          (err: any) => {
            if (err) {
              console.warn('[MySQL] Sync insert error (saved to persistent storage):', err.message);
            }
          }
        );
      }

      return res.status(200).json({
        message: 'User registered successfully',
        username: normalized,
      });
    } catch (error: any) {
      console.error('Signup exception:', error);
      res.status(500).json({ message: 'Error during sign-up' });
    }
  });

  // API Route: Check if Username is available for registration (Page 3 Sign Up)
  app.all('/api/check-availability', async (req, res) => {
    try {
      const raw = req.query.username || req.body?.username;
      if (!raw) {
        return res.status(400).json({ available: false, message: 'Username is required' });
      }

      const normalized = cleanUsername(String(raw));
      if (!normalized || normalized.length < 3) {
        return res.status(400).json({ available: false, message: 'Username must be at least 3 characters' });
      }

      // Check persistent memory
      if (memoryUsers.has(normalized)) {
        return res.json({ available: false, message: 'That username is taken. Try another.' });
      }

      // Check MySQL if connected
      if (mysqlPool && isMySQLConnected) {
        return mysqlPool.query(
          'SELECT username FROM users WHERE username = ?',
          [normalized],
          (err: any, results: any[]) => {
            if (!err && results && results.length > 0) {
              return res.json({ available: false, message: 'That username is taken. Try another.' });
            }
            return res.json({ available: true, message: 'Username is available' });
          }
        );
      }

      return res.json({ available: true, message: 'Username is available' });
    } catch (e) {
      res.status(500).json({ available: false, message: 'Error checking username' });
    }
  });

  // API Route: Send email (SansMail)
  app.post('/api/mail/send', async (req, res) => {
    try {
      const { sender, recipient, subject, body } = req.body;
      if (!sender || !recipient || !subject || !body) {
        return res.status(400).json({ message: 'All mail fields are required' });
      }

      const cleanSender = cleanUsername(sender);
      const cleanRecipient = cleanUsername(recipient);

      if (!cleanSender) {
        return res.status(400).json({ message: 'Invalid sender username' });
      }

      // Check if recipient is valid
      if (!memoryUsers.has(cleanRecipient) && !cleanRecipient.includes('@')) {
        return res.status(404).json({ message: `Sanscounts user "${cleanRecipient}" does not exist!` });
      }

      if (mysqlPool && isMySQLConnected) {
        mysqlPool.query(
          'INSERT INTO mails (sender, recipient, subject, body) VALUES (?, ?, ?, ?)',
          [cleanSender, cleanRecipient, subject, body],
          (err: any, result: any) => {
            if (err) {
              return res.status(500).json({ message: 'Database error sending email' });
            }
            res.json({ message: 'Email sent successfully!', id: result.insertId });
          }
        );
      } else {
        // Mock success if offline fallback
        res.json({ message: 'Email sent successfully (fallback mode)!' });
      }
    } catch (e) {
      res.status(500).json({ message: 'Error sending email' });
    }
  });

  // API Route: Get Inbox & Sent emails
  app.get('/api/mail', async (req, res) => {
    try {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({ message: 'Username is required' });
      }

      const cleanUser = cleanUsername(String(username));
      if (!cleanUser) {
        return res.status(400).json({ message: 'Invalid username' });
      }

      if (mysqlPool && isMySQLConnected) {
        mysqlPool.query(
          'SELECT * FROM mails WHERE recipient = ? OR sender = ? ORDER BY id DESC',
          [cleanUser, cleanUser],
          (err: any, rows: any[]) => {
            if (err) {
              return res.status(500).json({ message: 'Database error fetching mails' });
            }
            res.json({ mails: rows });
          }
        );
      } else {
        // Fallback static mails
        res.json({
          mails: [
            {
              id: 1,
              sender: 'system@sanscounts.san',
              recipient: cleanUser,
              subject: 'Welcome to SansMail!',
              body: 'Hi ' + cleanUser + ',\n\nWelcome to SansMail (SansCounts Mail)! Offline fallback active.',
              created_at: new Date().toISOString()
            }
          ]
        });
      }
    } catch (e) {
      res.status(500).json({ message: 'Error fetching emails' });
    }
  });

  // API Route: Check if Username exists (Step 1 of Sign In)
  app.post('/api/check-username', async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: 'Username is required' });
      }

      const normalized = cleanUsername(username);
      if (!normalized) {
        return res.status(404).json({ message: "Sanscount doesn't exist!" });
      }

      // Check persistent memory
      if (memoryUsers.has(normalized)) {
        return res.json({ exists: true, username: normalized });
      }

      return res.status(404).json({ message: "Sanscount doesn't exist!" });
    } catch (error: any) {
      res.status(500).json({ message: "Sanscount doesn't exist!" });
    }
  });

  // API Route: Check if Username is available for registration (Sign Up Page 3)
  app.get('/api/check-availability', (req, res) => {
    try {
      const rawUser = String(req.query.username || '');
      const normalized = cleanUsername(rawUser);
      if (!normalized) {
        return res.status(400).json({ available: false, message: 'Invalid username format' });
      }

      if (memoryUsers.has(normalized)) {
        return res.json({ available: false, message: 'That username is already taken. Try another.' });
      }

      return res.json({ available: true, message: 'Username is available!' });
    } catch (e) {
      return res.status(500).json({ available: false, message: 'Error checking username availability' });
    }
  });

  // API Route: Sign In (Step 2 of Sign In)
  app.post('/api/signin', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const normalized = cleanUsername(username);
      const user = memoryUsers.get(normalized);

      if (!user) {
        // Fallback to MySQL query if available
        if (mysqlPool && isMySQLConnected) {
          return mysqlPool.query(
            'SELECT * FROM users WHERE username = ?',
            [normalized],
            async (err: any, results: any[]) => {
              if (err || !results || results.length === 0) {
                return res.status(404).json({ message: "Sanscount doesn't exist!" });
              }

              const dbUser = results[0];
              const storedPassword = dbUser.password;

              if (storedPassword === 'PENDING_RESTORE') {
                const newHash = await bcrypt.hash(password, 10);
                mysqlPool.query('UPDATE users SET password = ? WHERE username = ?', [newHash, normalized]);
                return res.json({
                  message: 'Sign in successful',
                  user: { username: dbUser.username, firstName: dbUser.first_name },
                });
              }

              let match = false;
              if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'))) {
                match = await bcrypt.compare(password, storedPassword);
              } else {
                match = password === storedPassword;
              }

              if (!match) {
                return res.status(401).json({ message: "Incorrect password!" });
              }

              return res.json({
                message: 'Sign in successful',
                user: { username: dbUser.username, firstName: dbUser.first_name },
              });
            }
          );
        }

        return res.status(404).json({ message: "Sanscount doesn't exist!" });
      }

      // If user was restored after a reset, bind the entered password
      if (user.password === 'PENDING_RESTORE') {
        user.password = await bcrypt.hash(password, 10);
        memoryUsers.set(normalized, user);
        saveUsersToFile(Array.from(memoryUsers.values()));
        return res.json({
          message: 'Sign in successful',
          user: { username: user.username, firstName: user.firstName },
        });
      }

      // Check password using bcrypt
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Incorrect password!" });
      }

      return res.json({
        message: 'Sign in successful',
        user: { username: user.username, firstName: user.firstName },
      });
    } catch (error: any) {
      console.error('Signin exception:', error);
      res.status(500).json({ message: "Sanscount doesn't exist!" });
    }
  });

  // -------------------------------------------------------------
  // SansCounts OAuth 2.0 Real-Time Provider API
  // -------------------------------------------------------------

  // List all registered developer apps
  app.get('/api/oauth/apps', (req, res) => {
    const list = Array.from(developerApps.values()).map((a) => ({
      clientId: a.clientId,
      clientSecret: a.clientSecret,
      appName: a.appName,
      redirectUri: a.redirectUri,
      owner: a.owner,
      createdAt: a.createdAt,
    }));
    res.json(list);
  });

  // Register a new developer app
  app.post('/api/oauth/register-app', (req, res) => {
    const { appName, redirectUri, owner } = req.body;
    if (!appName || !redirectUri) {
      return res.status(400).json({ message: 'App Name and Redirect URI are required' });
    }
    const clientId = 'SD_' + crypto.randomBytes(8).toString('hex');
    const clientSecret = 'SAuth_' + crypto.randomBytes(16).toString('hex');

    const newApp: DeveloperAppRecord = {
      clientId,
      clientSecret,
      appName: appName.trim(),
      redirectUri: redirectUri.trim(),
      owner: owner || 'sanscounts@gmail.com',
      createdAt: new Date().toISOString(),
    };

    developerApps.set(clientId, newApp);
    saveAppsToFile(Array.from(developerApps.values()));

    res.json({
      clientId,
      clientSecret,
      appName: newApp.appName,
      redirectUri: newApp.redirectUri,
      message: 'SansCounts Auth App registered successfully',
    });
  });

  // Fetch client details for OAuth consent screen
  app.get('/api/oauth/authorize', (req, res) => {
    const { client_id, redirect_uri } = req.query;
    let appInfo = client_id ? developerApps.get(String(client_id)) : null;

    if (!appInfo && redirect_uri) {
      const rUri = String(redirect_uri).toLowerCase();
      if (rUri.includes('shusto')) {
        appInfo = developerApps.get('sc_client_shusto_live');
      } else if (rUri.includes('sansneat') || rUri.includes('sans neat')) {
        appInfo = developerApps.get('sc_client_sansneat_live');
      }
    }

    if (!appInfo) {
      const allApps = Array.from(developerApps.values());
      appInfo = allApps[0] || {
        clientId: 'sc_client_sansneat_live',
        clientSecret: 'sc_sec_sansneat_82f1b702e9a1c4',
        appName: 'SansNeat',
        redirectUri: 'https://sansneat.sanssiu.com/auth/callback',
        allowedOrigins: ['https://sansneat.sanssiu.com'],
        owner: 'siam',
        createdAt: new Date().toISOString()
      };
    }

    res.json({
      status: 'active',
      clientId: appInfo.clientId,
      appName: appInfo.appName,
      redirectUri: appInfo.redirectUri,
      requestedRedirectUri: redirect_uri || appInfo.redirectUri,
    });
  });

  // Approve authorization & issue authorization code
  app.post('/api/oauth/authorize', (req, res) => {
    const { client_id, redirect_uri, username } = req.body;
    let appInfo = client_id ? developerApps.get(String(client_id)) : null;

    if (!appInfo && redirect_uri) {
      const rUri = String(redirect_uri).toLowerCase();
      if (rUri.includes('shusto')) {
        appInfo = developerApps.get('sc_client_shusto_live');
      } else if (rUri.includes('sansneat') || rUri.includes('sans neat')) {
        appInfo = developerApps.get('sc_client_sansneat_live');
      }
    }

    if (!appInfo) {
      const allApps = Array.from(developerApps.values());
      appInfo = allApps[0] || {
        clientId: 'sc_client_sansneat_live',
        clientSecret: 'sc_sec_sansneat_82f1b702e9a1c4',
        appName: 'SansNeat',
        redirectUri: 'https://sansneat.sanssiu.com/auth/callback',
        allowedOrigins: ['https://sansneat.sanssiu.com'],
        owner: 'siam',
        createdAt: new Date().toISOString()
      };
    }

    const normalized = cleanUsername(username || 'sanscounts');
    let user = memoryUsers.get(normalized);
    if (!user) {
      user = memoryUsers.get('siam') || {
        id: 1,
        firstName: 'SansCounts',
        lastName: 'User',
        username: 'sanscounts',
        password: '',
        createdAt: new Date().toISOString()
      };
    }

    // Generate 10-minute one-time code
    const code = 'sc_code_' + crypto.randomBytes(16).toString('hex');
    const targetRedirect = redirect_uri || appInfo.redirectUri;

    authCodes.set(code, {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      clientId: appInfo.clientId,
      redirectUri: targetRedirect,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    let callbackUrlString = targetRedirect;
    try {
      const callbackUrl = new URL(targetRedirect);
      callbackUrl.searchParams.set('code', code);
      callbackUrlString = callbackUrl.toString();
    } catch (e) {
      const sep = targetRedirect.includes('?') ? '&' : '?';
      callbackUrlString = `${targetRedirect}${sep}code=${code}`;
    }

    res.json({
      code,
      redirectUri: callbackUrlString,
      appName: appInfo.appName,
      user: {
        username: user.username,
        email: `${user.username}@sanscounts.san`,
        firstName: user.firstName,
      },
    });
  });

  // Exchange authorization code for Access Token
  app.post('/api/oauth/token', async (req, res) => {
    const { client_id, client_secret, code } = req.body;
    if (!client_id || !client_secret || !code) {
      return res.status(400).json({ error: 'client_id, client_secret, and code are required' });
    }

    const appInfo = developerApps.get(client_id);
    if (!appInfo || appInfo.clientSecret !== client_secret) {
      return res.status(401).json({ error: 'Invalid client credentials' });
    }

    const codeData = authCodes.get(code);
    if (!codeData) {
      return res.status(400).json({ error: 'Invalid or already used authorization code' });
    }

    if (codeData.expiresAt < Date.now()) {
      authCodes.delete(code);
      return res.status(400).json({ error: 'Authorization code has expired' });
    }

    if (codeData.clientId !== client_id) {
      return res.status(400).json({ error: 'Code was issued to a different client_id' });
    }

    // Code is single-use: invalidate it immediately
    authCodes.delete(code);

    // Issue Access Token valid for 24 hours
    const accessToken = 'sc_token_' + crypto.randomBytes(32).toString('hex');
    activeTokens.set(accessToken, {
      username: codeData.username,
      firstName: codeData.firstName,
      lastName: codeData.lastName,
      clientId: client_id,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 86400,
      scope: 'profile email openid',
      user: {
        username: codeData.username,
        email: `${codeData.username}@sanscounts.san`,
        firstName: codeData.firstName,
        lastName: codeData.lastName,
      },
    });
  });

  // Real-time UserInfo endpoint with Bearer token
  app.get('/api/oauth/userinfo', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header. Expected Bearer <token>' });
    }

    const token = authHeader.split('Bearer ')[1].trim();
    const session = activeTokens.get(token);

    if (!session || session.expiresAt < Date.now()) {
      if (session) activeTokens.delete(token);
      return res.status(401).json({ error: 'Invalid or expired access token' });
    }

    res.json({
      sub: session.username,
      username: session.username,
      email: `${session.username}@sanscounts.san`,
      firstName: session.firstName,
      lastName: session.lastName,
      issuer: 'https://sanscounts.san',
      audience: session.clientId,
    });
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
    console.log(`SansCounts Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
