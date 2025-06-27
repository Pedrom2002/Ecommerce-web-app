from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS    
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime
from flask_migrate import Migrate

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

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)          
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)          
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)


class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)  # Novo campo para imagem


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

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not all([name, username, email, phone, password]):
        return jsonify({'msg': 'All fields are required.'}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'msg': 'Username or email already exists.'}), 409

    new_user = User(name=name, username=username, email=email, phone=phone)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'msg': 'User registered successfully.'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'msg': 'Bad username or password.'}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token}), 200

@app.route('/articles', methods=['GET'])
def list_all_articles():
    articles = Article.query.all()
    result = [{'id': a.id, 'name': a.name, 'content': a.content, 'image_url': a.image_url} for a in articles]
    return jsonify(result), 200

@app.route('/articles/search', methods=['GET'])
def search_articles():
    name_query = request.args.get('name', '')
    articles = Article.query.filter(Article.name.ilike(f"%{name_query}%")).all()
    result = [{'id': a.id, 'name': a.name, 'content': a.content, 'image_url': a.image_url} for a in articles]
    return jsonify(result), 200

@app.route('/articles', methods=['POST'])
def add_article():
    data = request.get_json()
    name = data.get('name')
    content = data.get('content')
    
    if not name or not content:
        return jsonify({'msg': 'Name and content are required.'}), 400
    
    new_article = Article(name=name, content=content)
    db.session.add(new_article)
    db.session.commit()
    
    return jsonify({'msg': 'Article added.', 'id': new_article.id}), 201

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'msg': 'User not found.'}), 404
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'username': user.username,
        'email': user.email,
        'phone': user.phone
    }), 200

@app.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
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
        User.id != current_user_id
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

@app.route('/profile/password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
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

@app.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'msg': 'User not found.'}), 404
    
    data = request.get_json()
    
    # Validar dados obrigatórios
    required_fields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'country', 'cartItems', 'totals']
    if not all(field in data for field in required_fields):
        return jsonify({'msg': 'Missing required fields.'}), 400
    
    try:
        # Criar nova encomenda
        new_order = Order(
            user_id=current_user_id,
            first_name=data['firstName'],
            last_name=data['lastName'],
            email=data['email'],
            phone=data['phone'],
            address=data['address'],
            city=data['city'],
            postal_code=data['postalCode'],
            country=data['country'],
            subtotal=data['totals']['subtotal'],
            shipping=data['totals']['shipping'],
            tax=data['totals']['tax'],
            total=data['totals']['total']
        )
        
        db.session.add(new_order)
        db.session.flush()  # Para obter o ID da encomenda
        
        # Criar items da encomenda
        for item in data['cartItems']:
            order_item = OrderItem(
                order_id=new_order.id,
                article_id=item['id'],
                quantity=item['quantity'],
                price=item['price']
            )
            db.session.add(order_item)
        
        db.session.commit()
        
        return jsonify({
            'msg': 'Order created successfully.',
            'order_id': new_order.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao criar encomenda: {e}")
        return jsonify({'msg': 'Error creating order.'}), 500

@app.route('/orders', methods=['GET'])
@jwt_required()
def get_user_orders():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'msg': 'User not found.'}), 404
    
    # Buscar encomendas do utilizador ordenadas por data (mais recentes primeiro)
    orders = Order.query.filter_by(user_id=current_user_id).order_by(Order.order_date.desc()).all()
    
    result = []
    for order in orders:
        order_items = []
        for item in order.items:
            order_items.append({
                'name': item.article.name,
                'quantity': item.quantity,
                'price': item.price
            })
        
        result.append({
            'id': order.id,
            'date': order.order_date.isoformat(),
            'status': order.status,
            'total': order.total,
            'items': order_items,
            'shipping_info': {
                'first_name': order.first_name,
                'last_name': order.last_name,
                'address': order.address,
                'city': order.city,
                'postal_code': order.postal_code,
                'country': order.country
            }
        })
    
    return jsonify(result), 200

if __name__ == '__main__':
    # Cria tabelas se não existirem
    with app.app_context():
        db.create_all()
    app.run(debug=True)
