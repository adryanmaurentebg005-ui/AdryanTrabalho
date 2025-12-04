import express from 'express';
import { Hospede, Quarto, Reserva, Pagamento } from '../models/index.js';

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.tipo !== 'admin') {
    return res.redirect('/');
  }
  next();
}

// === DASHBOARD ADMIN ===
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const [hospedesCount, quartosCount, reservasCount, quartosDisponiveis, reservasPendentes, pagamentos] = await Promise.all([
      Hospede.countDocuments(),
      Quarto.countDocuments(),
      Reserva.countDocuments(),
      Quarto.countDocuments({ status: 'Disponível' }),
      Reserva.countDocuments({ status: 'Pendente' }),
      Pagamento.find()
    ]);

    const receitaTotal = pagamentos.filter(p => p.status === 'Aprovado').reduce((sum, p) => sum + p.valor, 0);

    const stats = {
      hospedes: hospedesCount,
      quartos: quartosCount,
      reservas: reservasCount,
      quartosDisponiveis,
      reservasPendentes,
      receitaTotal
    };

    res.render('admin/dashboard', {
      title: 'Dashboard Admin',
      page: 'admin',
      stats
    });
  } catch (err) {
    next(err);
  }
});

// ===== HÓSPEDES =====
router.get('/hospedes', requireAdmin, async (req, res, next) => {
  try {
    const hospedes = await Hospede.find().lean();
    res.render('admin/hospedes', {
      title: 'Gerenciar Hóspedes',
      page: 'admin',
      hospedes,
      error: null,
      success: null
    });
  } catch (err) {
    next(err);
  }
});
   
 
router.post('/hospedes', requireAdmin, async (req, res, next) => {
  try {
    const { nome, CPF, telefone, email, endereco, senha } = req.body;
    let { dataNascimento } = req.body;

    dataNascimento = parseLocalDate(dataNascimento);

    await Hospede.create({
      nome,
      CPF,
      telefone,
      email,
      endereco,
      dataNascimento,
      dataCadastro: new Date(),
      senha,
      tipo: 'cliente'
    });

    res.redirect('/admin/hospedes');
  } catch (err) {
    next(err);
  }
});
function parseLocalDate(dateStr) {
  const [ano, mes, dia] = dateStr.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}
router.post('/hospedes/:id/editar', requireAdmin, async (req, res, next) => {
  try {
    const dados = { ...req.body };

    if (dados.dataNascimento) {
      dados.dataNascimento = parseLocalDate(dados.dataNascimento);
    }

    await Hospede.findByIdAndUpdate(req.params.id, dados);
    res.redirect('/admin/hospedes');
  } catch (err) {
    next(err);
  }
});


router.post('/hospedes/:id/deletar', requireAdmin, async (req, res, next) => {
  try {
    await Hospede.findByIdAndDelete(req.params.id);
    res.redirect('/admin/hospedes');
  } catch (err) {
    next(err);
  }
});

// ===== QUARTOS =====
router.get('/quartos', requireAdmin, async (req, res, next) => {
  try {
    const quartos = await Quarto.find().lean();
    res.render('admin/quartos', { title: 'Gerenciar Quartos', page: 'admin', quartos });
  } catch (err) {
    next(err);
  }
});

router.post('/quartos', requireAdmin, async (req, res, next) => {
  try {
    const { numero, tipo, capacidade, precoDiaria, descricao, comodidades, imagem, status } = req.body;
    await Quarto.create({ numero, tipo, capacidade: parseInt(capacidade), precoDiaria: parseFloat(precoDiaria), descricao, comodidades: (comodidades||'').split(',').map(c=>c.trim()), imagem: imagem || 'https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=800', status });
    res.redirect('/admin/quartos');
  } catch (err) {
    next(err);
  }
});

router.post('/quartos/:id/editar', requireAdmin, async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.capacidade) update.capacidade = parseInt(update.capacidade);
    if (update.precoDiaria) update.precoDiaria = parseFloat(update.precoDiaria);
    if (update.comodidades) update.comodidades = update.comodidades.split(',').map(c=>c.trim());
    await Quarto.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/quartos');
  } catch (err) {
    next(err);
  }
}); 

router.post('/quartos/:id/deletar', requireAdmin, async (req, res, next) => {
  try {
    await Quarto.findByIdAndDelete(req.params.id);
    res.redirect('/admin/quartos');
  } catch (err) {
    next(err);
  }
});

// ===== RESERVAS =====
router.get('/reservas', requireAdmin, async (req, res, next) => {
  try {
    const reservas = await Reserva.find().populate('hospede').populate('quarto').lean();
    res.render('admin/reservas', { title: 'Gerenciar Reservas', page: 'admin', reservas });
  } catch (err) {
    next(err);
  }
});

router.post('/reservas/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const reserva = await Reserva.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (reserva && req.body.status === 'Cancelada') {
      await Quarto.findByIdAndUpdate(reserva.quarto, { status: 'Disponível' });
    }
    res.redirect('/admin/reservas');
  } catch (err) {
    next(err);
  }
});

router.post('/reservas/:id/deletar', requireAdmin, async (req, res, next) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (reserva) await Quarto.findByIdAndUpdate(reserva.quarto, { status: 'Disponível' });
    await Reserva.findByIdAndDelete(req.params.id);
    res.redirect('/admin/reservas');
  } catch (err) {
    next(err);
  }
});

// ===== PAGAMENTOS =====
router.get('/pagamentos', requireAdmin, async (req, res, next) => {
  try {
    const pagamentos = await Pagamento.find().lean();
    const pagamentosComDetalhes = await Promise.all(pagamentos.map(async p => {
      const reserva = await Reserva.findById(p.reserva).lean();
      const hospede = reserva ? await Hospede.findById(reserva.hospede).lean() : null;
      return { ...p, reserva, hospede };
    }));

    const totais = {
      aprovado: pagamentos.filter(p => p.status === 'Aprovado').reduce((sum, p) => sum + p.valor, 0),
      pendente: pagamentos.filter(p => p.status === 'Pendente').reduce((sum, p) => sum + p.valor, 0),
      total: pagamentos.reduce((sum, p) => sum + p.valor, 0)
    };

    res.render('admin/pagamentos', {
      title: 'Gerenciar Pagamentos',
      page: 'admin',
      pagamentos: pagamentosComDetalhes,
      totais
    });
  } catch (err) {
    next(err);
  }
});

router.post('/pagamentos/:id/status', requireAdmin, async (req, res, next) => {
  try {
    await Pagamento.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.redirect('/admin/pagamentos');
  } catch (err) {
    next(err);
  }
});

router.post('/pagamentos/:id/deletar', requireAdmin, async (req, res, next) => {
  try {
    await Pagamento.findByIdAndDelete(req.params.id);
    res.redirect('/admin/pagamentos');
  } catch (err) {
    next(err);
  }
});

export default router;
