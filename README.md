# 🏨 Sistema de Gerenciamento de Pousada

Projeto fullstack com backend em Node.js/Express + templates EJS e frontend gerenciado com Vite.

Este README foi atualizado para refletir a estrutura atual do repositório e instruções para rodar o projeto localmente.

## Requisitos
- Node.js v16+ (recomendado)
- npm

## Instalação
No diretório do projeto:

```bash
npm install
```

## Execução
- Iniciar API / servidor EJS:

```bash
npm start
# servidor Express roda em http://localhost:3111 por padrão
```

- Desenvolvimento frontend (Vite):

```bash
npm run dev
```

- Hot-reload do backend (opcional, se `nodemon` estiver instalado):

```bash
npm run server
```

## Estrutura do repositório (atual)

```
/ (repo root)
├── package.json                # Scripts e dependências (start, server, dev, build)
├── package-lock.json
├── vercel.json                 # Configuração de deploy (opcional)
├── README.md
├── api/                        # Backend Express + views EJS
│   ├── server.js               # Servidor Express (porta 3111)
│   ├── routes/                 # Rotas (index, auth, quartos, reservas, admin, perfil)
│   ├── models/                 # Modelos (Hospede.js, Quarto.js, Reserva.js, Pagamento.js)
│   ├── config/                 # `conexao.js` (config DB)
│   ├── public/                 # Arquivos estáticos (css, js, imagens)
│   └── views/                  # Templates EJS (index.ejs, admin/, auth/, etc.)
├── components/                 # Componentes frontend (React / UI)
├── styles/                     # Estilos globais
└── AdryanMaurenteProjeto/      # Subprojeto / pasta filha (antes um submodule)

```

Observações
- O servidor principal está em `api/server.js` e o `package.json` do projeto define `type: "module"`.
- A porta do servidor é `3111` por padrão (veja `api/server.js`).
- Se você deseja incluir o conteúdo de `AdryanMaurenteProjeto` neste repositório, copie a pasta sem o diretório `.git` e commite.

## Próximos passos sugeridos
- Verificar variáveis de ambiente e configurações de conexão ao banco (arquivo em `api/config/`).
- Adicionar instruções de deploy específicas, se necessário.

---

Se quiser, eu posso commitar esta alteração no `README.md` agora. Quer que eu faça o commit? 
# 🏨 Sistema de Gerenciamento de Pousada

Sistema completo de gerenciamento de pousada desenvolvido com **Node.js**, **Express**, **EJS**, HTML, CSS e JavaScript puro.

## 📋 Funcionalidades

### Área Pública
- **Página Inicial**: Apresentação da pousada com comodidades e informações
- **Visualização de Quartos**: Listagem de quartos disponíveis com filtros por tipo
- **Sistema de Reservas**: Formulário completo para fazer reservas online
- **Autenticação**: Sistema de login e cadastro de usuários

### Painel Administrativo
- **Dashboard**: Visão geral com estatísticas e métricas
- **Gestão de Hóspedes**: CRUD completo (Criar, Ler, Atualizar, Deletar)
- **Gestão de Quartos**: Gerenciamento de quartos com status e comodidades
- **Gestão de Reservas**: Controle de reservas com alteração de status
- **Gestão de Pagamentos**: Acompanhamento de pagamentos e receitas

## 🗂️ Entidades do Sistema

1. **Hóspede**: Nome, CPF, Telefone, Email, Endereço, Data de Nascimento
2. **Quarto**: Número, Tipo, Capacidade, Preço, Descrição, Comodidades, Status
3. **Reserva**: Check-in, Check-out, Hóspedes, Valor Total, Status
4. **Pagamento**: Valor, Método de Pagamento, Status, Data

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v14 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório ou baixe os arquivos

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

4. Acesse no navegador:
```
http://localhost:3000
```

### Desenvolvimento (com auto-reload)
```bash
npm run dev
```

## 🔐 Credenciais Padrão

**Administrador:**
- Email: `admin@pousada.com`
- Senha: `admin123`

## 📁 Estrutura do Projeto

```
/
├── server.js                 # Servidor Express principal
├── package.json              # Dependências do projeto
├── data/
│   └── database.js          # Simulação de banco de dados em memória
├── routes/
│   ├── index.js             # Rotas da página inicial
│   ├── auth.js              # Rotas de autenticação
│   ├── quartos.js           # Rotas de quartos
│   ├── reservas.js          # Rotas de reservas
│   └── admin.js             # Rotas administrativas
├── views/
│   ├── partials/
│   │   ├── header.ejs       # Cabeçalho e navegação
│   │   └── footer.ejs       # Rodapé
│   ├── auth/
│   │   ├── login.ejs        # Página de login
│   │   └── cadastro.ejs     # Página de cadastro
│   ├── quartos/
│   │   └── lista.ejs        # Listagem de quartos
│   ├── reservas/
│   │   ├── nova.ejs         # Formulário de reserva
│   │   └── sucesso.ejs      # Confirmação de reserva
│   ├── admin/
│   │   ├── sidebar.ejs      # Menu lateral admin
│   │   ├── dashboard.ejs    # Dashboard
│   │   ├── hospedes.ejs     # Gestão de hóspedes
│   │   ├── quartos.ejs      # Gestão de quartos
│   │   ├── reservas.ejs     # Gestão de reservas
│   │   └── pagamentos.ejs   # Gestão de pagamentos
│   └── index.ejs            # Página inicial
└── public/
    ├── css/
    │   └── style.css        # Estilos CSS
    └── js/
        └── main.js          # Scripts JavaScript
```

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Template Engine**: EJS
- **Sessões**: express-session
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Ícones**: Font Awesome
- **Armazenamento**: Banco de dados em memória (simulação)

## 📝 Recursos do Sistema

### Autenticação e Sessões
- Login com email e senha
- Cadastro de novos usuários
- Sessões persistentes
- Proteção de rotas administrativas

### Interface do Usuário
- Design responsivo
- Navegação intuitiva
- Modais para formulários
- Alertas e notificações
- Filtros e busca

### Gestão de Dados
- CRUD completo para todas as entidades
- Validações de formulário
- Cálculo automático de valores
- Atualização de status em tempo real

## 🎨 Características do Design

- Interface limpa e moderna
- Paleta de cores profissional
- Componentes reutilizáveis
- Feedback visual para ações do usuário
- Responsivo para mobile e desktop

## 📊 Status do Projeto

✅ Sistema funcional completo
✅ Todas as 4 entidades implementadas
✅ Painel administrativo completo
✅ Sistema de autenticação
✅ Interface responsiva
✅ Operações CRUD funcionando

## 🔄 Próximas Melhorias Sugeridas

- [ ] Integração com banco de dados real (MySQL, PostgreSQL, MongoDB)
- [ ] Upload de imagens de quartos
- [ ] Relatórios em PDF
- [ ] Sistema de e-mail para confirmação
- [ ] Calendário de disponibilidade
- [ ] Avaliações e comentários
- [ ] Integração com gateway de pagamento

## 📄 Licença

Este projeto é livre para uso educacional e comercial.

---

Desenvolvido com ❤️ usando Node.js, Express e EJS
