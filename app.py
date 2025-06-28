from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS    
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime
from flask_migrate import Migrate
from flasgger import Swagger

app = Flask(__name__)

# CORS: autoriza seu frontend a enviar o header Authorization
CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:4200"}},  # ajuste a origem do seu Angular
    expose_headers=["Authorization"],
    allow_headers=["Authorization", "Content-Type"]
)

# Configurações
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_secret_key_here'  # Mude para um valor seguro
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Extensões
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)  # <-- Corrigido: migrate fica aqui, não dentro da função

# Swagger configuration
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/api/docs/"
}

template = {
    "swagger": "2.0",
    "info": {
        "title": "E-Commerce API",
        "description": "API para sistema e-commerce com Angular + Flask",
        "contact": {
            "responsibleOrganization": "PW-2-PL Team",
            "responsibleDeveloper": "PW-2-PL Team",
            "email": "dev@pw2pl.com",
        },
        "version": "1.0.0"
    },
    "host": "localhost:5000",
    "basePath": "/api",
    "schemes": [
        "http",
        "https"
    ],
    "operationId": "getmyData",
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
        }
    },
}

swagger = Swagger(app, config=swagger_config, template=template)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)          
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)          
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')  # user, admin
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)


class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)  # Novo campo para imagem
    price = db.Column(db.Float, nullable=False, default=0.0)  # Novo campo para preço


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    order_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False, default='processando')
    
    # Shipping Information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(10), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    
    # Totals
    subtotal = db.Column(db.Float, nullable=False)
    shipping = db.Column(db.Float, nullable=False)
    tax = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)
    
    # Relationship
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    user = db.relationship('User', backref='orders')


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    article_id = db.Column(db.Integer, db.ForeignKey('article.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)  # Preço no momento da compra
    
    # Relationship
    article = db.relationship('Article', backref='order_items')


# Rotas
@app.route('/')
def home():
    return jsonify({"msg": "API is running"}), 200

@app.route('/api/register', methods=['POST'])
def register():
    """
    Registar novo utilizador
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - name
            - username
            - email
            - phone
            - password
          properties:
            name:
              type: string
              description: Nome completo do utilizador
              example: "João Silva"
            username:
              type: string
              description: Nome de utilizador único
              example: "joaosilva"
            email:
              type: string
              format: email
              description: Endereço de email único
              example: "joao@email.com"
            phone:
              type: string
              description: Número de telefone
              example: "123456789"
            password:
              type: string
              description: Password (mínimo 6 caracteres)
              example: "password123"
    responses:
      201:
        description: Utilizador registado com sucesso
        schema:
          type: object
          properties:
            message:
              type: string
              example: "User registered successfully"
            access_token:
              type: string
              example: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
      400:
        description: Dados em falta ou inválidos
        schema:
          type: object
          properties:
            error:
              type: string
              example: "All fields are required"
      409:
        description: Username ou email já existe
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Username already exists"
    """
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not all([name, username, email, phone, password]):
        return jsonify({'error': 'All fields are required.'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists.'}), 409
        
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists.'}), 409

    new_user = User(name=name, username=username, email=email, phone=phone)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(new_user.id))
    return jsonify({
        'message': 'User registered successfully.',
        'access_token': access_token
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    """
    Autenticar utilizador
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: Nome de utilizador ou email
              example: "joaosilva"
            password:
              type: string
              description: Password do utilizador
              example: "password123"
    responses:
      200:
        description: Login bem-sucedido
        schema:
          type: object
          properties:
            access_token:
              type: string
              example: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
            user:
              type: object
              properties:
                id:
                  type: integer
                  example: 1
                username:
                  type: string
                  example: "joaosilva"
                name:
                  type: string
                  example: "João Silva"
                email:
                  type: string
                  example: "joao@email.com"
      400:
        description: Dados em falta
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Username and password are required"
      401:
        description: Credenciais inválidas
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Invalid username or password"
    """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Verificar se é hash simples (para utilizadores criados pelo script de teste)
    import hashlib
    simple_hash = hashlib.sha256(password.encode()).hexdigest()
    
    if user.password_hash == simple_hash:
        # Hash simples - converter para bcrypt
        user.set_password(password)
        db.session.commit()
        password_valid = True
    else:
        # Hash bcrypt normal
        password_valid = user.check_password(password)
    
    if not password_valid:
        return jsonify({'error': 'Invalid username or password'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'email': user.email
        }
    }), 200

@app.route('/articles', methods=['GET'])
def list_all_articles():
    articles = Article.query.all()
    result = [{'id': a.id, 'name': a.name, 'content': a.content, 'image_url': a.image_url, 'price': a.price} for a in articles]
    return jsonify(result), 200

@app.route('/articles/search', methods=['GET'])
def search_articles():
    name_query = request.args.get('name', '')
    articles = Article.query.filter(Article.name.ilike(f"%{name_query}%")).all()
    result = [{'id': a.id, 'name': a.name, 'content': a.content, 'image_url': a.image_url, 'price': a.price} for a in articles]
    return jsonify(result), 200

@app.route('/articles', methods=['POST'])
def add_article():
    data = request.get_json()
    name = data.get('name')
    content = data.get('content')
    image_url = data.get('image_url', '')
    price = data.get('price', 0.0)
    
    if not name or not content:
        return jsonify({'msg': 'Name and content are required.'}), 400
    
    new_article = Article(name=name, content=content, image_url=image_url, price=float(price))
    db.session.add(new_article)
    db.session.commit()
    
    return jsonify({'msg': 'Article added.', 'id': new_article.id}), 201

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'msg': 'User not found.'}), 404
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'username': user.username,
        'email': user.email,
        'phone': user.phone,
        'role': user.role
    }), 200

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'msg': 'User not found.'}), 404
    
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    email = data.get('email')
    phone = data.get('phone')
    
    if not all([name, username, email, phone]):
        return jsonify({'msg': 'All fields are required.'}), 400
    
    # Verificar se username ou email já existem (exceto para o utilizador atual)
    existing_user = User.query.filter(
        (User.username == username) | (User.email == email),
        User.id != int(current_user_id)
    ).first()
    
    if existing_user:
        return jsonify({'msg': 'Username or email already exists.'}), 409
    
    # Atualizar dados do utilizador
    user.name = name
    user.username = username
    user.email = email
    user.phone = phone
    
    db.session.commit()
    
    return jsonify({'msg': 'Profile updated successfully.'}), 200

@app.route('/api/profile/password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'msg': 'User not found.'}), 404
    
    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    
    if not all([current_password, new_password]):
        return jsonify({'msg': 'Current password and new password are required.'}), 400
    
    # Verificar password atual
    if not user.check_password(current_password):
        return jsonify({'msg': 'Current password is incorrect.'}), 401
    
    # Definir nova password
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({'msg': 'Password changed successfully.'}), 200

# === ADMIN ENDPOINTS ===

def admin_required(f):
    """Decorator para verificar se utilizador é admin"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/admin/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_stats():
    """Obter estatísticas do sistema para dashboard admin"""
    try:
        total_users = User.query.count()
        total_articles = Article.query.count()
        total_orders = Order.query.count()
        
        # Estatísticas de encomendas por status
        order_stats = db.session.query(
            Order.status,
            db.func.count(Order.id).label('count')
        ).group_by(Order.status).all()
        
        order_status_counts = {status: count for status, count in order_stats}
        
        # Receita total
        total_revenue = db.session.query(db.func.sum(Order.total)).scalar() or 0
        
        # Utilizadores ativos
        active_users = User.query.filter_by(is_active=True).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'active_users': active_users,
                'total_articles': total_articles,
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'order_status_counts': order_status_counts
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Listar todos os utilizadores"""
    try:
        users = User.query.all()
        users_data = []
        
        for user in users:
            user_orders = Order.query.filter_by(user_id=user.id).count()
            
            users_data.append({
                'id': user.id,
                'name': user.name,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'role': user.role,
                'is_active': user.is_active,
                'total_orders': user_orders
            })
        
        return jsonify({
            'success': True,
            'users': users_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user_admin(user_id):
    """Atualizar utilizador (admin)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Atualizar campos permitidos
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'role' in data:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user_admin(user_id):
    """Eliminar utilizador (admin)"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Não permitir eliminar próprio utilizador
        if user_id == current_user_id:
            return jsonify({
                'success': False, 
                'error': 'Cannot delete your own account'
            }), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Eliminar encomendas associadas
        orders = Order.query.filter_by(user_id=user_id).all()
        for order in orders:
            OrderItem.query.filter_by(order_id=order.id).delete()
            db.session.delete(order)
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/articles', methods=['GET'])
@jwt_required()
@admin_required
def get_all_articles_admin():
    """Listar todos os artigos (admin)"""
    try:
        articles = Article.query.all()
        articles_data = []
        
        for article in articles:
            # Contar quantas vezes foi vendido
            total_sold = db.session.query(
                db.func.sum(OrderItem.quantity)
            ).filter_by(article_id=article.id).scalar() or 0
            
            articles_data.append({
                'id': article.id,
                'name': article.name,
                'content': article.content,
                'image_url': article.image_url,
                'price': article.price,
                'total_sold': int(total_sold)
            })
        
        return jsonify({
            'success': True,
            'articles': articles_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/articles', methods=['POST'])
@jwt_required()
@admin_required
def create_article_admin():
    """Criar novo artigo (admin)"""
    try:
        data = request.get_json()
        
        name = data.get('name')
        content = data.get('content')
        image_url = data.get('image_url', '')
        price = data.get('price', 0.0)
        
        if not name or not content:
            return jsonify({
                'success': False,
                'error': 'Name and content are required'
            }), 400
        
        new_article = Article(
            name=name,
            content=content,
            image_url=image_url,
            price=float(price)
        )
        
        db.session.add(new_article)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Article created successfully',
            'article_id': new_article.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/articles/<int:article_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_article_admin(article_id):
    """Atualizar artigo (admin)"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'success': False, 'error': 'Article not found'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            article.name = data['name']
        if 'content' in data:
            article.content = data['content']
        if 'image_url' in data:
            article.image_url = data['image_url']
        if 'price' in data:
            article.price = float(data['price'])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Article updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/articles/<int:article_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_article_admin(article_id):
    """Eliminar artigo (admin)"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'success': False, 'error': 'Article not found'}), 404
        
        # Verificar se artigo tem encomendas associadas
        order_items = OrderItem.query.filter_by(article_id=article_id).count()
        if order_items > 0:
            return jsonify({
                'success': False,
                'error': 'Cannot delete article with existing orders'
            }), 400
        
        db.session.delete(article)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Article deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/orders', methods=['GET'])
@jwt_required()
@admin_required
def get_all_orders_admin():
    """Listar todas as encomendas (admin)"""
    try:
        orders = Order.query.order_by(Order.order_date.desc()).all()
        orders_data = []
        
        for order in orders:
            user = User.query.get(order.user_id)
            order_items = []
            
            for item in order.items:
                order_items.append({
                    'id': item.id,
                    'article_name': item.article.name,
                    'quantity': item.quantity,
                    'price': item.price
                })
            
            orders_data.append({
                'id': order.id,
                'user_id': order.user_id,
                'user_name': user.name if user else 'Unknown',
                'user_email': user.email if user else 'Unknown',
                'order_date': order.order_date.isoformat(),
                'status': order.status,
                'total': order.total,
                'items_count': len(order.items),
                'items': order_items,
                'shipping_info': {
                    'name': f"{order.first_name} {order.last_name}",
                    'email': order.email,
                    'phone': order.phone,
                    'address': order.address,
                    'city': order.city,
                    'postal_code': order.postal_code,
                    'country': order.country
                }
            })
        
        return jsonify({
            'success': True,
            'orders': orders_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_order_status(order_id):
    """Atualizar status da encomenda (admin)"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        
        data = request.get_json()
        new_status = data.get('status')
        
        valid_statuses = ['processando', 'em trânsito', 'entregue', 'cancelado']
        if new_status not in valid_statuses:
            return jsonify({
                'success': False,
                'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }), 400
        
        order.status = new_status
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order status updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404
    
    data = request.get_json()
    
    # Validar estrutura dos dados
    if not data or 'shipping_info' not in data or 'items' not in data or 'totals' not in data:
        return jsonify({'success': False, 'message': 'Invalid data structure. Required: shipping_info, items, totals'}), 400
    
    shipping_info = data.get('shipping_info', {})
    items = data.get('items', [])
    totals = data.get('totals', {})
    
    # Validar campos obrigatórios
    required_shipping_fields = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'postal_code', 'country']
    missing_fields = [field for field in required_shipping_fields if not shipping_info.get(field)]
    
    if missing_fields:
        return jsonify({'success': False, 'message': f'Missing shipping fields: {", ".join(missing_fields)}'}), 400
    
    if not items:
        return jsonify({'success': False, 'message': 'Order must contain at least one item'}), 400
    
    required_total_fields = ['subtotal', 'shipping', 'tax', 'total']
    missing_total_fields = [field for field in required_total_fields if field not in totals]
    
    if missing_total_fields:
        return jsonify({'success': False, 'message': f'Missing total fields: {", ".join(missing_total_fields)}'}), 400
    
    try:
        # Criar nova encomenda
        new_order = Order(
            user_id=int(current_user_id),
            first_name=shipping_info['first_name'],
            last_name=shipping_info['last_name'],
            email=shipping_info['email'],
            phone=shipping_info['phone'],
            address=shipping_info['address'],
            city=shipping_info['city'],
            postal_code=shipping_info['postal_code'],
            country=shipping_info['country'],
            subtotal=float(totals['subtotal']),
            shipping=float(totals['shipping']),
            tax=float(totals['tax']),
            total=float(totals['total'])
        )
        
        db.session.add(new_order)
        db.session.flush()  # Para obter o ID da encomenda
        
        # Criar items da encomenda
        for item in items:
            if not all(field in item for field in ['product_id', 'name', 'price', 'quantity']):
                db.session.rollback()
                return jsonify({'success': False, 'message': 'Invalid item structure'}), 400
            
            order_item = OrderItem(
                order_id=new_order.id,
                article_id=item['product_id'],
                quantity=int(item['quantity']),
                price=float(item['price'])
            )
            db.session.add(order_item)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order created successfully.',
            'order_id': new_order.id
        }), 201
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Invalid number format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao criar encomenda: {e}")
        return jsonify({'success': False, 'message': 'Error creating order.'}), 500

@app.route('/api/orders', methods=['GET'])
@jwt_required()
def get_user_orders():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'success': False, 'orders': [], 'message': 'User not found.'}), 404
    
    try:
        # Buscar encomendas do utilizador ordenadas por data (mais recentes primeiro)
        orders = Order.query.filter_by(user_id=int(current_user_id)).order_by(Order.order_date.desc()).all()
        
        result = []
        for order in orders:
            order_items = []
            for item in order.items:
                order_items.append({
                    'product_id': item.article_id,
                    'name': item.article.name,
                    'quantity': item.quantity,
                    'price': item.price
                })
            
            result.append({
                'id': order.id,
                'user_id': order.user_id,
                'order_date': order.order_date.isoformat(),
                'status': order.status,
                'shipping_info': {
                    'first_name': order.first_name,
                    'last_name': order.last_name,
                    'email': order.email,
                    'phone': order.phone,
                    'address': order.address,
                    'city': order.city,
                    'postal_code': order.postal_code,
                    'country': order.country
                },
                'items': order_items,
                'totals': {
                    'subtotal': order.subtotal,
                    'shipping': order.shipping,
                    'tax': order.tax,
                    'total': order.total
                }
            })
        
        return jsonify({'success': True, 'orders': result}), 200
        
    except Exception as e:
        print(f"Erro ao buscar encomendas: {e}")
        return jsonify({'success': False, 'orders': [], 'message': 'Error fetching orders.'}), 500

if __name__ == '__main__':
    # Cria tabelas se não existirem
    with app.app_context():
        db.create_all()
    app.run(debug=True)
