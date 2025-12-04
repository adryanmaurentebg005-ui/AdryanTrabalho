import mongoose from "mongoose";

const url = "mongodb+srv://aluno:123@cluster0.ddqnr3p.mongodb.net/pousada?retryWrites=true&w=majority&appName=Cluster0";

async function conectar() {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado ao MongoDB Atlas!");
  } catch (erro) {
    console.error("❌ Erro de conexão:", erro.message);
  }
}

conectar();

export default mongoose;
