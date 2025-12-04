import mongoose from 'mongoose';
import conexao from '../config/conexao.js';

const pagamentoSchema = new conexao.Schema({
  reserva: { type: conexao.Schema.Types.ObjectId, ref: 'Reserva', required: true },
  metodo: { type: String, required: true },
  valor: { type: Number, required: true },
  dataPagamento: { type: Date, default: Date.now },
  status: { type: String, default: 'Concluído' }
}, { timestamps: true });

const Pagamento = conexao.models && conexao.models.Pagamento
  ? conexao.models.Pagamento
  : conexao.model('Pagamento', pagamentoSchema);

export default Pagamento; 
