# 🚀 Guia de Instalação - E-Commerce PW-2-PL

Este guia fornece instruções passo-a-passo para configurar e executar o projeto em qualquer computador.

## 📋 Pré-requisitos

### 🟢 Node.js e npm
Instale a versão LTS do Node.js (18.x ou superior):
- **Windows/macOS**: Descarregar de [nodejs.org](https://nodejs.org/)
- **Ubuntu/Debian**: `sudo apt install nodejs npm`
- **CentOS/RHEL**: `sudo yum install nodejs npm`

Verificar instalação:
```bash
node --version  # deve mostrar v18.x.x ou superior
npm --version   # deve mostrar 9.x.x ou superior
```

### 🐍 Python 3
Instale Python 3.8 ou superior:
- **Windows**: Descarregar de [python.org](https://www.python.org/)
- **macOS**: `brew install python3` (com Homebrew)
- **Ubuntu/Debian**: `sudo apt install python3 python3-pip`
- **CentOS/RHEL**: `sudo yum install python3 python3-pip`

Verificar instalação:
```bash
python3 --version  # deve mostrar 3.8.x ou superior
pip3 --version     # deve estar disponível
```

### 🛠️ Git (opcional)
Para clonar o repositório:
- **Windows**: Descarregar de [git-scm.com](https://git-scm.com/)
- **macOS**: `brew install git`
- **Ubuntu/Debian**: `sudo apt install git`

## 📦 Instalação

### 1️⃣ Obter o Projeto

#### Opção A: Clonar com Git
```bash
git clone <url-do-repositorio>
cd pw-2-pl
```

#### Opção B: Descarregar ZIP
1. Descarregar o ficheiro ZIP do projeto
2. Extrair para um diretório de sua escolha
3. Abrir terminal nesse diretório

### 2️⃣ Configurar Backend (Flask)

#### Criar ambiente virtual Python (recomendado):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Instalar dependências Python:
```bash
pip install -r requirements.txt
```

Se houver problemas, instalar individualmente:
```bash
pip install Flask==2.3.3
pip install Flask-SQLAlchemy==3.0.5
pip install Flask-JWT-Extended==4.5.3
pip install Flask-CORS==4.0.0
pip install Flask-Bcrypt==1.0.1
pip install Werkzeug==2.3.7
```

### 3️⃣ Configurar Frontend (Angular)

#### Instalar dependências Node.js:
```bash
npm install
```

Se houver problemas de cache:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 4️⃣ Configurar Base de Dados


#### Configuração Manual
```bash
python app.py
```
A base de dados será criada automaticamente na primeira execução.

### 5️⃣ Configurar Variáveis de Ambiente (opcional)

#### Copiar ficheiro de exemplo:
```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

#### Editar o ficheiro .env conforme necessário:
```env
FLASK_ENV=development
FLASK_DEBUG=True
JWT_SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///instance/app.db
```

## 🏃‍♂️ Execução

### 🔥 Início Rápido (2 terminais)

#### Terminal 1 - Backend (Flask):
```bash
# Ativar ambiente virtual (se criado)
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

python app.py
```
✅ Flask executa em: `http://localhost:5000`

#### Terminal 2 - Frontend (Angular):
```bash
npm start
```
✅ Angular executa em: `http://localhost:4200`

### 🌐 Aceder à Aplicação
Abrir navegador em: **http://localhost:4200**

## 🔧 Comandos Úteis

### Frontend (Angular)
```bash
npm start           # Servidor desenvolvimento
npm run build       # Build produção
npm test            # Executar testes
npm run lint        # Verificar código
```

### Backend (Flask)
```bash
python app.py                    # Executar servidor
python setup_database.py        # Configurar BD
```

### Base de Dados
```bash
# Script interativo para gestão da BD
python setup_database.py

# Opções disponíveis:
# 1. Criar/Inicializar base de dados
# 2. Carregar artigos de exemplo
# 3. Criar utilizador administrador
# 4. Mostrar informações da BD
# 5. Repor base de dados
```

## 🐛 Resolução de Problemas

### ❌ Erro: "Servidor não disponível"
**Problema**: Frontend não consegue comunicar com backend

**Soluções**:
1. Verificar se Flask está a executar na porta 5000
2. Verificar se não há firewall a bloquear
3. Tentar executar `python app.py` novamente

### ❌ Erro: "Module not found"
**Problema**: Dependências Python em falta

**Soluções**:
```bash
# Reinstalar dependências
pip install -r requirements.txt

# Verificar ambiente virtual
pip list
```

### ❌ Erro: "npm ERR!"
**Problema**: Problemas com dependências Node.js

**Soluções**:
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Verificar versão do Node.js
node --version  # deve ser 18.x+
```

### ❌ Erro: "Port already in use"
**Problema**: Portas 4200 ou 5000 já estão em uso

**Soluções**:
```bash
# Verificar processos nas portas
# Windows
netstat -ano | findstr :4200
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :4200
lsof -i :5000

# Matar processo (substituir PID)
# Windows: taskkill /PID <PID> /F
# macOS/Linux: kill -9 <PID>
```

### ❌ Erro: "Database locked"
**Problema**: Base de dados SQLite bloqueada

**Soluções**:
1. Fechar todas as instâncias do Flask
2. Apagar ficheiro `instance/app.db.lock` (se existir)
3. Reiniciar Flask

### ❌ Erro: CORS
**Problema**: Problemas de CORS entre frontend e backend

**Verificações**:
1. Frontend executa em `localhost:4200`
2. Backend executa em `localhost:5000`
3. Verificar configuração CORS em `app.py`

## 📱 Funcionalidades Disponíveis

### 🔐 Autenticação
- **Registo**: Criar nova conta
- **Login**: Acesso com credenciais
- **Logout**: Terminar sessão

### 🛍️ E-commerce
- **Catálogo**: Ver todos os produtos
- **Detalhes**: Informações detalhadas do produto
- **Carrinho**: Adicionar/remover produtos
- **Checkout**: Finalizar compras

### 👤 Perfil
- **Dados Pessoais**: Editar informações
- **Password**: Alterar password
- **Histórico**: Ver encomendas anteriores

### 📄 Páginas Institucionais
- Política de Privacidade
- Termos de Uso
- Envios e Devoluções
- Suporte ao Cliente
- Perguntas Frequentes

## 🔒 Utilizador de Teste

### Administrador Padrão
```
Username: admin
Password: admin123
Email: admin@pw2pl.com
```

Criado automaticamente pelo script `setup_database.py`.

## 📊 Estrutura de Ficheiros

```
pw-2-pl/
├── src/app/                # Código Angular
├── app.py                  # API Flask
├── requirements.txt        # Dependências Python
├── package.json           # Dependências Node.js
├── setup_database.py      # Script configuração BD
├── .env.example           # Exemplo variáveis ambiente
├── artigos.json          # Dados exemplo
└── instance/app.db       # Base dados (criada automaticamente)
```

## 🎯 Próximos Passos

1. ✅ Instalar e executar o projeto
2. 🔐 Fazer registo ou login
3. 🛍️ Explorar catálogo de produtos
4. 🛒 Adicionar produtos ao carrinho
5. 💳 Finalizar uma compra
6. 👤 Gerir perfil e ver histórico

## 📞 Suporte

### Em caso de problemas:
1. 📖 Consultar este guia
2. 🔍 Verificar logs do terminal
3. 🌐 Verificar consola do browser (F12)
4. 📧 Contactar equipa de desenvolvimento

---

**✨ Boa sorte com o projeto!** 🚀