import express from 'express';
import { Hospede, Quarto, Reserva, Pagamento } from '../models/index.js';

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

router.get('/nova/:quartoId', requireAuth, async (req, res, next) => {
  try {
    const quarto = await Quarto.findById(req.params.quartoId).lean();
    if (!quarto || quarto.status !== 'Disponível') return res.redirect('/quartos');

    const hospedeExistente = await Hospede.findOne({ email: req.session.user.email }).lean();
    // Se o CPF for placeholder, não exibir na view
    if (hospedeExistente && typeof hospedeExistente.CPF === 'string' && hospedeExistente.CPF.startsWith('PLACEHOLDER-')) {
      hospedeExistente.CPF = '';
    }
    const hospede = hospedeExistente || { nome: '', CPF: '', telefone: '', endereco: '' };

    res.render('reservas/nova', {
      title: 'Fazer Reserva',
      page: 'reservas',
      quarto,
      hospede,
      error: null
    });
  } catch (err) {
    next(err);
  }
}); 

router.post('/nova/:quartoId', requireAuth, async (req, res, next) => {
  try {
    const { dataCheckIn, dataCheckOut, numeroHospedes, metodoPagamento, nome, CPF, telefone, endereco } = req.body;
    const quartoId = req.params.quartoId;

    const quarto = await Quarto.findById(quartoId);
    if (!quarto || quarto.status !== 'Disponível') return res.redirect('/quartos');

    const hospedeExistente = await Hospede.findOne({ email: req.session.user.email }).lean();
    const hospedeFormulario = hospedeExistente || { nome: '', CPF: '', telefone: '', endereco: '' };
    // garantir que placeholder CPF não apareça no formulário
    if (hospedeFormulario && typeof hospedeFormulario.CPF === 'string' && hospedeFormulario.CPF.startsWith('PLACEHOLDER-')) {
      hospedeFormulario.CPF = '';
    }

    if (new Date(dataCheckIn) >= new Date(dataCheckOut)) {
      return res.render('reservas/nova', {
        title: 'Fazer Reserva',
        page: 'reservas',
        quarto: quarto.toObject(),
        hospede: hospedeFormulario,
        error: 'A data de check-out deve ser posterior à data de check-in'
      });
    }

    if (parseInt(numeroHospedes) > quarto.capacidade) {
      return res.render('reservas/nova', {
        title: 'Fazer Reserva',
        page: 'reservas',
        quarto: quarto.toObject(),
        hospede: hospedeFormulario,
        error: `Este quarto comporta no máximo ${quarto.capacidade} pessoas`
      });
    }

    let hospede = await Hospede.findOne({ email: req.session.user.email });
    console.log('Hóspede encontrado:', hospede);
    console.log('Dados do formulário:', { nome, CPF, telefone, endereco });

    const isPlaceholderCpf = (cpf) => typeof cpf === 'string' && cpf.startsWith('PLACEHOLDER-');

    if (!hospede) {
      console.log('Criando novo hóspede...');
      const dadosHospede = {
        nome: nome,
        email: req.session.user.email,
        senha: req.session.user.senha,
        dataCadastro: new Date()
      };

      if (CPF && CPF.trim()) dadosHospede.CPF = CPF;
      if (telefone && telefone.trim()) dadosHospede.telefone = telefone;
      if (endereco && endereco.trim()) dadosHospede.endereco = endereco;
      if (req.session.user.dataNascimento) dadosHospede.dataNascimento = req.session.user.dataNascimento;

      // create and assign
      hospede = await Hospede.create(dadosHospede);
      console.log('Hóspede criado:', hospede);
    } else {
      const temDadosIncompletos = !hospede.CPF || isPlaceholderCpf(hospede.CPF) || !hospede.telefone || !hospede.endereco;
      if (temDadosIncompletos) {
        const updateData = {};
        if (( !hospede.CPF || isPlaceholderCpf(hospede.CPF) ) && CPF && CPF.trim()) updateData.CPF = CPF;
        if (!hospede.telefone && telefone && telefone.trim()) updateData.telefone = telefone;
        if (!hospede.endereco && endereco && endereco.trim()) updateData.endereco = endereco;
        if (!hospede.nome && nome && nome.trim()) updateData.nome = nome;

        console.log('Dados incompletos, atualizando:', updateData);
        if (Object.keys(updateData).length > 0) {
          hospede = await Hospede.findByIdAndUpdate(
            hospede._id,
            updateData,
            { new: true }
          );
          console.log('Hóspede atualizado:', hospede);
        }
      }
    }

    const dias = Math.ceil((new Date(dataCheckOut) - new Date(dataCheckIn)) / (1000 * 60 * 60 * 24));
    const valorTotal = dias * quarto.precoDiaria;

    const reserva = await Reserva.create({
      hospede: hospede._id,
      quarto: quarto._id,
      numeroHospedes: parseInt(numeroHospedes),
      checkIn: new Date(dataCheckIn),
      checkOut: new Date(dataCheckOut),
      status: 'Confirmada',
      total: valorTotal
    });

    const pagamento = await Pagamento.create({
      reserva: reserva._id,
      metodo: metodoPagamento,
      valor: valorTotal,
      status: 'Aprovado'
    });

    quarto.status = 'Ocupado';
    await quarto.save();

    // preparar hospede para exibição (esconder placeholder de CPF)
    let hospedeForView = hospede;
    try {
      hospedeForView = hospede.toObject();
    } catch (e) {
      // hospede já pode ser um objeto plain
      hospedeForView = hospedeForView || {};
    }
    if (hospedeForView && typeof hospedeForView.CPF === 'string' && hospedeForView.CPF.startsWith('PLACEHOLDER-')) {
      hospedeForView.CPF = '';
    }

    res.render('reservas/sucesso', {
      title: 'Reserva Confirmada',
      page: 'reservas',
      reserva: reserva.toObject(),
      quarto: quarto.toObject(),
      hospede: hospedeForView,
      pagamento: pagamento.toObject()
    });
  } catch (err) {
    next(err);
  }
});

export default router;