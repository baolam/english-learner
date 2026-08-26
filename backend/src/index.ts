import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import routes from './routes';
import { invoke } from './services/anki.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const ANKI_CONNECT_URL = 'http://127.0.0.1:8765';

// Middleware
app.use(morgan('dev'));
app.use(cors()); // Allows connections from mobile and web on LAN
app.use(express.json());

// Routes
app.use('/api', routes);

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 LingoAnki Backend running at http://localhost:${PORT}`);
  console.log(`🌐 For LAN access (Mobile), use your local IP, e.g., http://192.168.1.X:${PORT}`);
  
  // Check AnkiConnect status
  try {
    const version = await invoke('version');
    console.log(`✅ Successfully connected to AnkiConnect (v${version})!`);
  } catch (err) {
    console.log(`⚠️  Could not connect to AnkiConnect at ${ANKI_CONNECT_URL}. Please ensure Anki is open and AnkiConnect add-on is installed.`);
  }
});
