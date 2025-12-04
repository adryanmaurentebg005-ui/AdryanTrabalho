import express from 'express';
import { Hospede, Quarto, Reserva, Pagamento } from '../models/index.js';

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

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

router.get('/', requireAuth, async (req, res) => {
  const user = req.session.user;
  const { email } = user;

  try {
    const hospede = await Hospede.findOne({ email }).lean();
    // esconder CPF placeholder na view
    if (hospede && typeof hospede.CPF === 'string' && hospede.CPF.startsWith('PLACEHOLDER-')) {
      hospede.CPF = '';
    }
    if (!hospede) {
      return res.render('perfil/index', {
        title: 'Meu Perfil',
        page: 'perfil',
        user,
        hospede: null,
        reservas: [],
        success: null,
        error: 'Hóspede não encontrado'
      });
    }

    const reservasUsuario = await Reserva.find({ hospede: hospede._id })
  .populate('quarto')
  .populate('hospede')
  .sort({ criadoEm: -1 })
  .lean();

    res.render('perfil/index', {
      title: 'Meu Perfil',
      page: 'perfil',
      user,
      hospede,
      reservas: reservasUsuario,
      success: null,
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar perfil');
  }
});

router.get('/configuracoes', requireAuth, (req, res) => {
  res.render('perfil/configuracoes', {
    title: 'Configurações',
    page: 'perfil',
    success: null,
    error: null
  });
});

function parseLocalDate(dateStr) {
  const [ano, mes, dia] = dateStr.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

router.post('/atualizar', requireAuth, async (req, res) => {
  const { nome, telefone, endereco, CPF, fotoBase64 } = req.body;
  let { dataNascimento } = req.body;
  const user = req.session.user;

  if (dataNascimento) {
    dataNascimento = new Date(dataNascimento);
  }

  try {
    await Hospede.updateOne(
      { email: user.email },
      { nome, telefone, endereco, dataNascimento, CPF, fotoBase64 }
    );

    req.session.user.nome = nome;
    if (fotoBase64 && fotoBase64.startsWith("data:image")) {
      req.session.user.fotoBase64 = fotoBase64;
    }

    res.redirect('/perfil?success=Perfil atualizado com sucesso!');
  } catch (err) {
    console.error(err);
    res.redirect('/perfil?error=Erro ao atualizar perfil!');
  }
});

router.post('/mudar-senha', requireAuth, (req, res) => {
  const { senhaAtual, novaSenha, confirmarSenha } = req.body;
  const user = req.session.user;

  if (user.senha !== senhaAtual) {
    return res.render('perfil/configuracoes', {
      title: 'Configurações',
      page: 'perfil',
      error: 'Senha atual incorreta',
      success: null
    });
  }

  if (novaSenha !== confirmarSenha) {
    return res.render('perfil/configuracoes', {
      title: 'Configurações',
      page: 'perfil',
      error: 'As novas senhas não coincidem',
      success: null
    });
  }

  if (novaSenha.length < 6) {
    return res.render('perfil/configuracoes', {
      title: 'Configurações',
      page: 'perfil',
      error: 'A senha deve ter pelo menos 6 caracteres',
      success: null
    });
  }

  user.senha = novaSenha;
  req.session.user.senha = novaSenha;

  res.render('perfil/configuracoes', {
    title: 'Configurações',
    page: 'perfil',
    error: null,
    success: 'Senha alterada com sucesso!'
  });
});


router.post('/:id/cancelar-reserva', async (req, res, next) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (reserva) await Quarto.findByIdAndUpdate(reserva.quarto, { status: 'Disponível' });
    
    const quarto = await Quarto.findById(reserva.quarto).lean();
    let hospede = await Hospede.findById(reserva.hospede).lean();
    const pagamento = await Pagamento.findOne({ reserva: reserva._id }).lean();
    if (hospede && typeof hospede.CPF === 'string' && hospede.CPF.startsWith('PLACEHOLDER-')) {
      hospede.CPF = '';
    }
await Reserva.findByIdAndDelete(req.params.id);
   
res.render('perfil/cancelado', {
      title: 'Reserva Confirmada',
      page: 'reservas',
      reserva: reserva.toObject(),
      quarto,
      hospede,
      pagamento
    });

  } catch (err) {
    next(err);
  }
});


export default router;