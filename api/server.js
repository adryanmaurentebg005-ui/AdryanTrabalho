import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import multer from 'multer';
import MongoStore from 'connect-mongo';
import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

/* ------------------------------
   CONFIGURAÇÕES PRINCIPAIS
--------------------------------*/
app.set('view engine', 'ejs');
app.set('views', join(__dirname, '../views'));
app.use(express.static(join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Vercel roda atrás de proxy HTTPS
app.set('trust proxy', 1);

/* ------------------------------
      SESSION FIX VERCEL
--------------------------------*/
const isProd = process.env.NODE_ENV === 'production';

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL || "mongodb+srv://aluno:123@cluster0.ddqnr3p.mongodb.net/pousada?retryWrites=true&w=majority",
      ttl: 60 * 60 * 24 // 1 dia
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
      httpOnly: true,
      secure: isProd,               // HTTPS em produção
      sameSite: isProd ? 'none' : 'lax'
    }
  })
);

/* ------------------------------
   VARIÁVEIS GLOBAIS PARA VIEWS
--------------------------------*/
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.user?.tipo === 'admin';
  next();
});

/* ------------------------------
         MULTER
--------------------------------*/
const storage = multer.memoryStorage();
export const upload = multer({ storage });

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
     RODAR LOCALMENTE
--------------------------------*/
if (!isProd) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

export default app;
