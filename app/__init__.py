# app/__init__.py
from flask import Flask
from config import Config
import os

def create_app(config_class=Config):
    app = Flask(__name__, 
                template_folder=os.path.join('..', 'templates'),
                static_folder=os.path.join('..', 'static'))
    app.config.from_object(config_class)
    
    # Register blueprints
    from app.routes import main
    app.register_blueprint(main)
    
    return app

