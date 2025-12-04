import mongoose from 'mongoose';
import conexao from '../config/conexao.js';

const reservaSchema = new conexao.Schema({
  
  hospede: { type: conexao.Schema.Types.ObjectId, ref: 'Hospede', required: true },
  quarto: { type: conexao.Schema.Types.ObjectId, ref: 'Quarto', required: true },
  numeroHospedes: { type: Number, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  status: { type: String, default: 'Pendente' },
  total: { type: Number, default: 0 },
  criadoEm: { type: Date, default: Date.now }
}, { timestamps: true });

const Reserva = conexao.models && conexao.models.Reserva
  ? conexao.models.Reserva
  : conexao.model('Reserva', reservaSchema);

export default Reserva;
