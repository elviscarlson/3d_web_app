import os
import pathlib

def create_project_structure():
    # Get the current directory where the script is running
    base_dir = pathlib.Path('3d_showcase_website')
    
    # Create directory structure
    directories = [
        'static/js/lib',
        'static/js/components',
        'static/js/animations/three',
        'static/js/animations/gsap',
        'static/js/animations/custom',
        'static/css',
        'static/assets/models',
        'static/assets/textures',
        'static/assets/images',
        'templates',
        'app'
    ]
    
    # Create all directories
    for dir_path in directories:
        full_path = base_dir / dir_path
        full_path.mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {full_path}")
    
    # Define files to create
    files = {
        'requirements.txt': '''flask==3.0.0
python-dotenv==1.0.0
flask-assets==2.1.0''',
        
        'config.py': '''class Config:
    SECRET_KEY = 'your-secret-key-here'
    STATIC_FOLDER = 'static'
    TEMPLATES_FOLDER = 'templates\'''',
        
        'run.py': '''from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)''',
        
        'app/__init__.py': '''from flask import Flask
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize Flask extensions here
    
    from app import routes
    
    return app''',
        
        'app/routes.py': '''from flask import render_template
from app import create_app

app = create_app()

@app.route('/')
def index():
    return render_template('index.html')''',
        
        'templates/base.html': '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Showcase</title>
    
    <!-- CSS -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/main.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/animations.css') }}">
    
    <!-- Third-party libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
</head>
<body>
    <!-- Loading screen -->
    <div id="loader" class="loader">
        <!-- We'll add a custom loading animation here -->
    </div>

    <!-- Main content -->
    <main id="content">
        {% block content %}{% endblock %}
    </main>

    <!-- JavaScript -->
    <script src="{{ url_for('static', filename='js/components/Loader.js') }}"></script>
    <script src="{{ url_for('static', filename='js/animations/three/scene.js') }}"></script>
    <script src="{{ url_for('static', filename='js/animations/gsap/scrollAnimations.js') }}"></script>
    <script src="{{ url_for('static', filename='js/main.js') }}"></script>
</body>
</html>''',
        
        'templates/index.html': '''{% extends "base.html" %}

{% block content %}
    <!-- Content will go here -->
{% endblock %}''',
        
        'static/css/main.css': '''/* Main stylesheet */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    overflow-x: hidden;
}

.loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    z-index: 1000;
}''',
        
        'static/css/animations.css': '''/* Animations stylesheet */''',
        
        'static/js/main.js': '''// Main JavaScript file''',
        
        'static/js/animations/three/scene.js': '''// Three.js scene setup and animations''',
        
        'static/js/animations/gsap/scrollAnimations.js': '''// GSAP scroll animations''',
        
        'static/js/components/Loader.js': '''// Loading screen component'''
    }
    
    # Create all files with their content
    for file_path, content in files.items():
        full_path = base_dir / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content)
        print(f"Created file: {full_path}")

if __name__ == '__main__':
    create_project_structure()