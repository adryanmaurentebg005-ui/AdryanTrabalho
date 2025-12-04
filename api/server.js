import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import multer from 'multer';

import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Corrigir caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

/* ------------------------------
   CONFIGURAÇÕES PRINCIPAIS
--------------------------------*/

app.set('view engine', 'ejs');
app.set('views', join(__dirname, '../views'));

// Servir arquivos estáticos
app.use(express.static(join(__dirname, '../public')));

// Body parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Method override (?_method=DELETE)
app.use(methodOverride('_method'));

// Session
app.use(session({
  secret: 'pousada-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Variáveis globais para views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.user && req.session.user.tipo === 'admin';
  next();
});

/* ------------------------------
     MULTER (uploads)
--------------------------------*/
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ------------------------------
       MODELS (caso tenha)
--------------------------------*/
// import X from '../models/X.js';
// import Y from '../models/Y.js';

/* ------------------------------
           ROTAS
--------------------------------*/
import indexRoutes from '../routes/index.js';
import authRoutes from '../routes/auth.js';
import quartosRoutes from '../routes/quartos.js';
import reservasRoutes from '../routes/reservas.js';
import adminRoutes from '../routes/admin.js';
import perfilRoutes from '../routes/perfil.js';

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/quartos', quartosRoutes);
app.use('/reservas', reservasRoutes);
app.use('/admin', adminRoutes);
app.use('/perfil', perfilRoutes);

/* ------------------------------
     INICIAR SERVIDOR LOCAL
--------------------------------*/
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

/* ------------------------------
     EXPORT PARA VERCEL
--------------------------------*/
export default app;
