# E-Commerce Application - Angular + Flask

Sistema e-commerce completo desenvolvido com Angular 18 (frontend) e Flask (backend), incluindo autenticação JWT, painel de administração, gestão de produtos, carrinho de compras e sistema de encomendas.

## 📋 Funcionalidades

### Frontend (Angular 18)
- ✅ **Autenticação**: Login e registo com controlo de acesso baseado em roles
- ✅ **Catálogo**: Listagem e detalhes de produtos
- ✅ **Carrinho**: Sistema de carrinho de compras
- ✅ **Checkout**: Processo completo de compra
- ✅ **Perfil**: Gestão de dados pessoais e histórico de encomendas
- ✅ **Painel Admin**: Interface de administração para gestão de produtos e utilizadores
- ✅ **Responsivo**: Interface adaptativa para todos os dispositivos
- ✅ **SSR**: Server-Side Rendering para melhor performance
- ✅ **Páginas Institucionais**: Política de privacidade, termos, FAQ, etc.
- ✅ **Internacionalização**: Suporte para múltiplos idiomas (PT/EN)

### Backend (Flask)
- ✅ **API RESTful**: Endpoints para todas as funcionalidades
- ✅ **Autenticação JWT**: Sistema seguro de tokens com roles
- ✅ **Sistema de Roles**: Controlo de acesso (user/admin)
- ✅ **Endpoints Admin**: API completa para gestão de produtos e utilizadores
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
git clone <https://github.com/Pedrom2002/Ecommerce-web-app>
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

```

### 3. Configurar o Backend (Flask)

#### Instalar dependências:
```bash
pip install -r requirements.txt
```


## 🗃️ Configuração da Base de Dados

### Inicialização Automática
A base de dados SQLite é criada automaticamente na primeira execução do Flask:

```bash
py -3.11 app.py
```

### Estrutura da Base de Dados
O sistema cria automaticamente as seguintes tabelas:
- **users**: Utilizadores do sistema (com field 'role' para controlo de acesso)
- **articles**: Produtos/artigos (com preços sincronizados)
- **orders**: Encomendas
- **order_items**: Itens das encomendas


## 🏃‍♂️ Execução do Projeto

### 1. Iniciar o Backend (Flask)
```bash
py -3.11 app.py
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
- `GET /api/profile` - Dados do perfil (inclui role)

### Produtos
- `GET /api/articles` - Listar todos os produtos
- `GET /api/articles/search?name=<termo>` - Pesquisar produtos por nome

### Encomendas (Autenticação necessária)
- `POST /api/orders` - Criar nova encomenda
- `GET /api/orders` - Listar encomendas do utilizador

### Utilizadores (Autenticação necessária)
- `PUT /api/users/profile` - Atualizar perfil
- `PUT /api/users/password` - Alterar password

### Administração (Role Admin necessário)
- `GET /api/admin/users` - Listar todos os utilizadores
- `PUT /api/admin/users/<id>` - Atualizar utilizador
- `DELETE /api/admin/users/<id>` - Eliminar utilizador
- `GET /api/admin/articles` - Listar produtos com estatísticas
- `POST /api/admin/articles` - Criar novo produto
- `PUT /api/admin/articles/<id>` - Atualizar produto
- `DELETE /api/admin/articles/<id>` - Eliminar produto
- `GET /api/admin/orders` - Listar todas as encomendas
- `PUT /api/admin/orders/<id>` - Atualizar estado da encomenda
- `GET /api/admin/stats` - Estatísticas do sistema

## 🛡️ Autenticação

### JWT Tokens
- Tokens gerados no login com expiração de 1 hora
- Armazenados no localStorage do browser
- Enviados automaticamente em requests autenticados via HTTP interceptor

### Proteção de Rotas
- Rotas protegidas: `/profile`, `/checkout`, `/admin`
- Controlo de acesso baseado em roles (admin/user)
- Redirecionamento automático para login se não autenticado
- Guards implementados no Angular Router (AuthGuard, AdminGuard)

## 🎨 Estrutura do Projeto

```
pw-2-pl/
├── src/app/                    # Código Angular
│   ├── auth/                   # Componentes de autenticação
│   ├── core/                   # Layout (header/footer)
│   ├── ecommerce/             # Produtos e checkout
│   ├── profile/               # Gestão de perfil
│   ├── admin/                 # Painel de administração
│   ├── pages/                 # Páginas institucionais
│   ├── services/              # Serviços HTTP (inclui AdminService)
│   ├── interceptors/          # JWT interceptor
│   ├── guards/                # Guards de autenticação (AuthGuard, AdminGuard)
│   └── models/                # Interfaces TypeScript
├── src/locale/                # Ficheiros de internacionalização
├── app.py                     # API Flask com endpoints admin
├── instance/app.db           # Base de dados SQLite
├── requirements.txt          # Dependências Python
├── package.json             # Dependências Node.js
├── artigos.json            # Produtos importados para a BD
├── update_with_shopping_prices.py  # Script de sincronização de preços
└── server.ts                  # Servidor SSR
```



## 📱 Funcionalidades do Sistema

### Para Utilizadores
1. **Registo/Login**: Criar conta e autenticar
2. **Navegar Produtos**: Ver catálogo completo
3. **Carrinho**: Adicionar/remover produtos
4. **Checkout**: Finalizar compras
5. **Perfil**: Gerir dados pessoais
6. **Histórico**: Ver encomendas anteriores
7. **Multi-idioma**: Alternar entre Português e Inglês

### Para Administradores
1. **Painel Admin**: Acesso completo à gestão do sistema
2. **Gestão de Produtos**: Criar, editar e eliminar produtos
3. **Gestão de Utilizadores**: Ver e gerir contas de utilizadores
4. **Gestão de Encomendas**: Acompanhar e atualizar estados
5. **Estatísticas**: Dashboards com métricas do sistema
6. **Sincronização de Dados**: Scripts para manter dados atualizados

### Funcionalidades Técnicas
- **Responsivo**: Funciona em desktop, tablet e mobile
- **PWA Ready**: Preparado para Progressive Web App
- **SEO Friendly**: SSR para melhor indexação
- **Acessibilidade**: Interfaces acessíveis
- **Performance**: Loading states e lazy loading
- **Internacionalização**: Suporte multi-idioma (Português/Inglês)

## 🌐 Internacionalização (i18n)

O projeto suporta múltiplos idiomas usando o sistema de internacionalização do Angular.

### Idiomas Suportados
- 🇵🇹 **Português** (padrão)
- 🇬🇧 **Inglês**

### Troca de Idioma
- **Interface**: Seletor de idioma no header da aplicação
- **Persistência**: Idioma selecionado guardado no localStorage
- **Automática**: Deteção automática do idioma do browser


## 🛠️ Scripts de Manutenção

### Sincronização de Preços
```bash
# Sincronizar preços dos produtos com o sistema de compras
python update_with_shopping_prices.py
```

### Importação de Dados
```bash
# Importar produtos do artigos.json para a base de dados
# (executado automaticamente na inicialização do Flask)
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
- **Internacionalização**: Angular i18n com suporte PT/EN
- **SSR**: Angular Universal para Server-Side Rendering
- **Backend**: Flask, SQLAlchemy, JWT-Extended, Flask-CORS
- **Base de Dados**: SQLite com models relacionais
- **Autenticação**: JWT (JSON Web Tokens) com sistema de roles
- **Build**: Angular CLI, Webpack
- **Segurança**: Bcrypt para hash de passwords, CORS configurado

### Arquitetura
- **Padrão**: Single Page Application (SPA) com API REST
- **Comunicação**: HTTP/HTTPS com JSON
- **Estado**: Services com RxJS Observables
- **Roteamento**: Angular Router com guards (Auth + Admin)
- **Controlo de Acesso**: Role-based access control (RBAC)
- **Interceptors**: JWT automático e tratamento de erros
- **Responsividade**: Mobile-first design com Bootstrap




