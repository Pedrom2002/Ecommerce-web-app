# E-Commerce Application - Angular + Flask

Sistema e-commerce completo desenvolvido com Angular 18 (frontend) e Flask (backend), incluindo autenticação JWT, gestão de produtos, carrinho de compras e sistema de encomendas.

## 📋 Funcionalidades

### Frontend (Angular 18)
- ✅ **Autenticação**: Login e registo de utilizadores
- ✅ **Catálogo**: Listagem e detalhes de produtos
- ✅ **Carrinho**: Sistema de carrinho de compras
- ✅ **Checkout**: Processo completo de compra
- ✅ **Perfil**: Gestão de dados pessoais e histórico de encomendas
- ✅ **Responsivo**: Interface adaptativa para todos os dispositivos
- ✅ **SSR**: Server-Side Rendering para melhor performance
- ✅ **Páginas Institucionais**: Política de privacidade, termos, FAQ, etc.

### Backend (Flask)
- ✅ **API RESTful**: Endpoints para todas as funcionalidades
- ✅ **Autenticação JWT**: Sistema seguro de tokens
- ✅ **Base de Dados**: SQLite com SQLAlchemy ORM
- ✅ **CORS**: Configurado para comunicação frontend-backend
- ✅ **Segurança**: Hash de passwords e validação de dados

## 🚀 Requisitos do Sistema

### Node.js e npm
- **Node.js**: versão 18.x ou superior
- **npm**: versão 9.x ou superior

### Python
- **Python**: versão 3.8 ou superior
- **pip**: gestor de pacotes Python

## 📦 Instalação

### 1. Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd pw-2-pl
```

### 2. Configurar o Frontend (Angular)

#### Instalar dependências:
```bash
npm install
```

#### Comandos disponíveis:
```bash
# Servidor de desenvolvimento (porta 4200)
npm start
# ou
ng serve

# Build de produção
npm run build

# Executar testes
npm test

# Servidor SSR de produção
npm run serve:ssr:pw-2-pl

# Build em modo watch (desenvolvimento)
npm run watch
```

### 3. Configurar o Backend (Flask)

#### Instalar dependências:
```bash
pip install -r requirements.txt
```

#### Ou instalar individualmente:
```bash
pip install Flask==2.3.3
pip install Flask-SQLAlchemy==3.0.5
pip install Flask-JWT-Extended==4.5.3
pip install Flask-CORS==4.0.0
pip install Werkzeug==2.3.7
```

## 🗃️ Configuração da Base de Dados

### Inicialização Automática
A base de dados SQLite é criada automaticamente na primeira execução do Flask:

```bash
python app.py
```

### Estrutura da Base de Dados
O sistema cria automaticamente as seguintes tabelas:
- **users**: Utilizadores do sistema
- **articles**: Produtos/artigos
- **orders**: Encomendas
- **order_items**: Itens das encomendas

### Dados de Exemplo
Para popular a base de dados com produtos de exemplo:
1. Os dados estão disponíveis em `artigos.json`
2. Podem ser importados manualmente ou através da interface

## 🏃‍♂️ Execução do Projeto

### 1. Iniciar o Backend (Flask)
```bash
python app.py
```
- Servidor Flask executa na porta **5000**
- URL: `http://localhost:5000`
- API endpoints disponíveis em `/api/`

### 2. Iniciar o Frontend (Angular)
```bash
npm start
```
- Servidor Angular executa na porta **4200**
- URL: `http://localhost:4200`
- Hot reload ativado para desenvolvimento

### 3. Aceder à Aplicação
- Abrir navegador em `http://localhost:4200`
- O frontend comunicará automaticamente com o backend

## 🔗 Endpoints da API

### Autenticação
- `POST /api/register` - Registo de utilizador
- `POST /api/login` - Login de utilizador

### Produtos
- `GET /api/articles` - Listar todos os produtos
- `GET /api/articles/search?name=<termo>` - Pesquisar produtos por nome

### Encomendas (Autenticação necessária)
- `POST /api/orders` - Criar nova encomenda
- `GET /api/orders` - Listar encomendas do utilizador

### Utilizadores (Autenticação necessária)
- `PUT /api/users/profile` - Atualizar perfil
- `PUT /api/users/password` - Alterar password

## 🛡️ Autenticação

### JWT Tokens
- Tokens gerados no login com expiração de 1 hora
- Armazenados no localStorage do browser
- Enviados automaticamente em requests autenticados via HTTP interceptor

### Proteção de Rotas
- Rotas protegidas: `/profile`, `/checkout`
- Redirecionamento automático para login se não autenticado
- Guards implementados no Angular Router

## 🎨 Estrutura do Projeto

```
pw-2-pl/
├── src/app/                    # Código Angular
│   ├── auth/                   # Componentes de autenticação
│   ├── core/                   # Layout (header/footer)
│   ├── ecommerce/             # Produtos e checkout
│   ├── profile/               # Gestão de perfil
│   ├── pages/                 # Páginas institucionais
│   ├── services/              # Serviços HTTP
│   ├── interceptors/          # JWT interceptor
│   ├── guards/                # Guards de autenticação
│   └── models/                # Interfaces TypeScript
├── app.py                     # API Flask
├── instance/app.db           # Base de dados SQLite
├── requirements.txt          # Dependências Python
├── package.json             # Dependências Node.js
└── artigos.json            # Dados de exemplo
```

## 🔧 Configurações Avançadas

### Variáveis de Ambiente
Criar ficheiro `.env` na raiz do projeto (opcional):
```env
# Flask
FLASK_ENV=development
FLASK_DEBUG=True
JWT_SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=sqlite:///instance/app.db
```

### Configuração de Produção

#### Frontend:
```bash
# Build otimizado
npm run build

# Servidor SSR
npm run serve:ssr:pw-2-pl
```

#### Backend:
```bash
# Configurar variáveis de ambiente
export FLASK_ENV=production
export FLASK_DEBUG=False

# Executar Flask
python app.py
```

## 📱 Funcionalidades do Sistema

### Para Utilizadores
1. **Registo/Login**: Criar conta e autenticar
2. **Navegar Produtos**: Ver catálogo completo
3. **Carrinho**: Adicionar/remover produtos
4. **Checkout**: Finalizar compras
5. **Perfil**: Gerir dados pessoais
6. **Histórico**: Ver encomendas anteriores

### Funcionalidades Técnicas
- **Responsivo**: Funciona em desktop, tablet e mobile
- **PWA Ready**: Preparado para Progressive Web App
- **SEO Friendly**: SSR para melhor indexação
- **Acessibilidade**: Interfaces acessíveis
- **Performance**: Loading states e lazy loading

## 🧪 Testes

### Frontend (Angular)
```bash
# Executar testes unitários
npm test

# Testes com coverage
ng test --code-coverage
```

### Backend (Flask)
```bash
# Executar testes Python (se implementados)
python -m pytest tests/
```

## 🐛 Resolução de Problemas

### Problemas Comuns

#### 1. Erro "Servidor não disponível"
- **Causa**: Flask backend não está a executar
- **Solução**: Iniciar `python app.py` na porta 5000

#### 2. Erro CORS
- **Causa**: Backend não configurado para aceitar requests do frontend
- **Solução**: Verificar configuração CORS em `app.py`

#### 3. JWT Token Inválido
- **Causa**: Token expirado ou inválido
- **Solução**: Fazer logout e login novamente

#### 4. Problemas de Instalação npm
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 5. Problemas Python/pip
```bash
# Usar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

## 📚 Documentação Adicional

### Tecnologias Utilizadas
- **Frontend**: Angular 18, TypeScript, RxJS, Bootstrap
- **Backend**: Flask, SQLAlchemy, JWT-Extended
- **Base de Dados**: SQLite
- **Autenticação**: JWT (JSON Web Tokens)
- **Build**: Angular CLI, Webpack

### Arquitetura
- **Padrão**: Single Page Application (SPA) com API REST
- **Comunicação**: HTTP/HTTPS com JSON
- **Estado**: Services com RxJS Observables
- **Roteamento**: Angular Router com guards


## 📄 Licença

Este projeto foi desenvolvido para fins académicos no âmbito da disciplina de Programação Web II.

---

**Versão**: 1.0.0  
**Última Atualização**: Junho 2025  
**Compatibilidade**: Node.js 18+, Python 3.8+