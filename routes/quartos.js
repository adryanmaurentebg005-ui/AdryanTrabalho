import express from 'express';
import Quarto from '../models/Quarto.js';


const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { tipo, search } = req.query;

    const filter = {};

    if (tipo && tipo !== 'Todos') {
      filter.tipo = tipo;
    }

   if (search && search.trim() !== '') {
    
  const isNumber = !isNaN(search); 

  filter.$or = [
    { numero: { $regex: search, $options: 'i' } },
    { tipo: { $regex: search, $options: 'i' } },
    { descricao: { $regex: search, $options: 'i' } },
    { status: { $regex: search, $options: 'i' } },
    { comodidades: { $regex: search, $options: 'i' } },
  ];

  if (isNumber) {
    filter.$or.push(
      { capacidade: Number(search) },
      { precoDiaria: Number(search) }
    );
  }
}

    const quartos = await Quarto.find(filter).lean();

    res.render('quartos/lista', { 
      title: 'Quartos', 
      page: 'quartos', 
      quartos,
      filtroAtual: tipo || 'Todos',
      search: search || '' 
    });
  } catch (err) {
    next(err);
  }
});


export default router;
