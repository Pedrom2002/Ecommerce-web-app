#!/usr/bin/env python3
"""
Script para configuração inicial da base de dados
E-Commerce Application - pw-2-pl
"""

import json
import os
from app import app, db, User, Article

def create_database():
    """Cria todas as tabelas da base de dados"""
    with app.app_context():
        # Criar diretório instance se não existir
        if not os.path.exists('instance'):
            os.makedirs('instance')
            print("✅ Diretório 'instance' criado")
        
        # Criar todas as tabelas
        db.create_all()
        print("✅ Tabelas da base de dados criadas com sucesso")
        
        # Verificar se existem utilizadores
        user_count = User.query.count()
        article_count = Article.query.count()
        
        print(f"📊 Utilizadores na base de dados: {user_count}")
        print(f"📊 Artigos na base de dados: {article_count}")

def load_sample_articles():
    """Carrega artigos de exemplo do ficheiro artigos.json"""
    try:
        # Verificar se o ficheiro existe
        if not os.path.exists('artigos.json'):
            print("⚠️  Ficheiro 'artigos.json' não encontrado")
            return
        
        with app.app_context():
            # Verificar se já existem artigos
            if Article.query.count() > 0:
                response = input("❓ Já existem artigos na base de dados. Substituir? (s/N): ")
                if response.lower() != 's':
                    print("❌ Operação cancelada")
                    return
                
                # Remover artigos existentes
                Article.query.delete()
                db.session.commit()
                print("🗑️  Artigos existentes removidos")
            
            # Carregar dados do JSON
            with open('artigos.json', 'r', encoding='utf-8') as f:
                artigos_data = json.load(f)
            
            # Adicionar artigos à base de dados
            artigos_adicionados = 0
            for artigo_data in artigos_data:
                try:
                    artigo = Article(
                        name=artigo_data.get('name', 'Produto sem nome'),
                        content=artigo_data.get('content', 'Descrição não disponível'),
                        image_url=artigo_data.get('image_url', '/assets/images/shop/small/1.jpg')
                    )
                    db.session.add(artigo)
                    artigos_adicionados += 1
                except Exception as e:
                    print(f"⚠️  Erro ao adicionar artigo: {e}")
                    continue
            
            # Confirmar alterações
            db.session.commit()
            print(f"✅ {artigos_adicionados} artigos adicionados com sucesso")
            
    except Exception as e:
        print(f"❌ Erro ao carregar artigos: {e}")

def create_admin_user():
    """Cria um utilizador administrador de exemplo"""
    try:
        with app.app_context():
            # Verificar se já existe um utilizador admin
            admin_user = User.query.filter_by(username='admin').first()
            if admin_user:
                print("⚠️  Utilizador 'admin' já existe")
                return
            
            # Criar utilizador admin
            from werkzeug.security import generate_password_hash
            
            admin = User(
                name='Administrador',
                username='admin',
                email='admin@pw2pl.com',
                phone='123456789',
                password_hash=generate_password_hash('admin123')
            )
            
            db.session.add(admin)
            db.session.commit()
            
            print("✅ Utilizador administrador criado:")
            print("   Username: admin")
            print("   Password: admin123")
            print("   Email: admin@pw2pl.com")
            
    except Exception as e:
        print(f"❌ Erro ao criar utilizador admin: {e}")

def reset_database():
    """Remove todas as tabelas e recria-as (CUIDADO: apaga todos os dados)"""
    response = input("⚠️  ATENÇÃO: Esta operação apagará TODOS os dados. Continuar? (s/N): ")
    if response.lower() != 's':
        print("❌ Operação cancelada")
        return
    
    with app.app_context():
        db.drop_all()
        print("🗑️  Todas as tabelas removidas")
        
        db.create_all()
        print("✅ Tabelas recriadas")

def show_database_info():
    """Mostra informações sobre a base de dados"""
    try:
        with app.app_context():
            user_count = User.query.count()
            article_count = Article.query.count()
            
            print("\n" + "="*50)
            print("📊 INFORMAÇÕES DA BASE DE DADOS")
            print("="*50)
            print(f"Utilizadores: {user_count}")
            print(f"Artigos: {article_count}")
            
            if user_count > 0:
                print("\n👥 Utilizadores:")
                users = User.query.all()
                for user in users[:5]:  # Mostrar apenas os primeiros 5
                    print(f"  - {user.name} ({user.username}) - {user.email}")
                if user_count > 5:
                    print(f"  ... e mais {user_count - 5} utilizadores")
            
            if article_count > 0:
                print("\n🛍️  Artigos:")
                articles = Article.query.all()
                for article in articles[:5]:  # Mostrar apenas os primeiros 5
                    print(f"  - {article.name}")
                if article_count > 5:
                    print(f"  ... e mais {article_count - 5} artigos")
            
            print("="*50)
            
    except Exception as e:
        print(f"❌ Erro ao obter informações: {e}")

def main():
    """Menu principal do script"""
    print("\n" + "="*60)
    print("🗃️  CONFIGURAÇÃO DA BASE DE DADOS - E-COMMERCE PW-2-PL")
    print("="*60)
    
    while True:
        print("\nOpções disponíveis:")
        print("1. 🏗️  Criar/Inicializar base de dados")
        print("2. 📦 Carregar artigos de exemplo (artigos.json)")
        print("3. 👤 Criar utilizador administrador")
        print("4. 📊 Mostrar informações da base de dados")
        print("5. ⚠️  Repor base de dados (apaga tudo)")
        print("6. 🚪 Sair")
        
        try:
            choice = input("\nEscolha uma opção (1-6): ").strip()
            
            if choice == '1':
                create_database()
            elif choice == '2':
                load_sample_articles()
            elif choice == '3':
                create_admin_user()
            elif choice == '4':
                show_database_info()
            elif choice == '5':
                reset_database()
            elif choice == '6':
                print("👋 Até breve!")
                break
            else:
                print("❌ Opção inválida. Tente novamente.")
                
        except KeyboardInterrupt:
            print("\n\n👋 Operação cancelada pelo utilizador")
            break
        except Exception as e:
            print(f"❌ Erro inesperado: {e}")

if __name__ == '__main__':
    # Verificar se os módulos necessários estão disponíveis
    try:
        from app import app, db, User, Article
        main()
    except ImportError as e:
        print(f"❌ Erro ao importar módulos: {e}")
        print("📝 Certifique-se de que:")
        print("   - O ficheiro app.py existe")
        print("   - As dependências estão instaladas (pip install -r requirements.txt)")
        print("   - Está no diretório correto do projeto")