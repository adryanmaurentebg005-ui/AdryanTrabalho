import express from 'express';
import mongoose from 'mongoose';
import { Hospede } from '../models/index.js';

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth/login', {
    title: 'Login',
    page: 'login',
    error: null
  });
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (mongoose.connection.readyState === 1) {
      const user = await Hospede.findOne({ email, senha }).lean();
      if (user) {
        req.session.user = { id: String(user._id), nome: user.nome, email: user.email, tipo: user.tipo };
        return res.redirect('/');
      }
    } 

    return res.render('auth/login', {
      title: 'Login',
      page: 'login',
      error: 'Email ou senha incorretos'
    });
  } catch (err) {
    next(err);
  }
});

router.get('/cadastro', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth/cadastro', {
    title: 'Cadastro',
    page: 'cadastro',
    error: null,
    success: null
  });
});

router.post('/cadastro', async (req, res, next) => {
  try {
    const { nome, email, senha, confirmarSenha } = req.body;

    if (senha !== confirmarSenha) {
      return res.render('auth/cadastro', {
        title: 'Cadastro',
        page: 'cadastro',
        error: 'As senhas não coincidem',
        success: null 
      });
    }

    if (senha.length < 6) {
      return res.render('auth/cadastro', {
        title: 'Cadastro',
        page: 'cadastro',
        error: 'A senha deve ter pelo menos 6 caracteres',
        success: null
      });
    }

    const exists = await Hospede.findOne({ email }).lean();
    if (exists) {
      return res.render('auth/cadastro', {
        title: 'Cadastro',
        page: 'cadastro',
        error: 'Este email já está cadastrado',
        success: null
      });
    }

//const randomNumber = String(Math.floor(Math.random() * 1e11)).padStart(11, '0');
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; 
let randomString = "";

for (let i = 0; i < 11; i++) {
  randomString += chars.charAt(Math.floor(Math.random() * chars.length));
}

// Use a clear placeholder marker so we can treat it as "no CPF" elsewhere
const placeholderCPF = `PLACEHOLDER-${randomString}`;

    await Hospede.create({ 
      nome, 
      email, 
      senha, 
      tipo: 'cliente', 
      dataCadastro: new Date(),
      CPF: placeholderCPF
    });
    
    return res.render('auth/cadastro', {
      title: 'Cadastro',
      page: 'cadastro',
      error: null,
      success: 'Cadastro realizado com sucesso! Faça login para continuar.'
    });
  } catch (err) {
    next(err);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

export default router;