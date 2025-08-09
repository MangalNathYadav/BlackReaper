from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import random
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In a production environment, you would initialize Firebase here
# import firebase_admin
# from firebase_admin import credentials, db
# cred = credentials.Certificate("firebase-key.json")
# firebase_admin.initialize_app(cred, {
#     'databaseURL': 'https://your-project-id.firebaseio.com'
# })

# Sample quotes for when Firebase is not available
KANEKI_QUOTES = [
    "The world is not wrong. I am.",
    "Never trust anyone too much, remember the devil was once an angel.",
    "I'm not the protagonist of a novel or anything... I'm a college student who likes to read.",
    "All of the liabilities in this world are due to the inadequacies of the person involved.",
    "If an angelic being fell from the sky and tried to live in this world of ours, they would be no different from a devil.",
    "Why should I apologize for being a monster? Has anyone ever apologized for turning me into one?",
    "Human relationships are chemical reactions. If you have a reaction then you can never return back to your previous state of being.",
    "The pain in my head is proof that I am alive.",
    "I'm not going to protect you by being your shield or armor, but I'll be the dagger hidden below your pillow."
]

# Serve static files (for development)
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_static(path):
    root_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(root_dir)
    
    # Check if the requested path is a directory or if it doesn't have an extension
    if os.path.isdir(os.path.join(parent_dir, path)) or '.' not in path:
        path = os.path.join(path, 'index.html')
    
    return send_from_directory(parent_dir, path)

# API Routes

@app.route('/api/quotes/random', methods=['GET'])
def get_random_quote():
    """Return a random Kaneki Ken quote"""
    try:
        # In production, fetch from Firebase
        quote = random.choice(KANEKI_QUOTES)
        return jsonify({
            'quote': quote,
            'success': True
        })
    except Exception as e:
        logger.error(f"Error fetching quote: {e}")
        return jsonify({
            'error': 'Failed to fetch quote',
            'success': False
        }), 500

@app.route('/api/journals', methods=['GET'])
def get_journals():
    """Get all journal entries for a user"""
    try:
        user_id = request.args.get('uid')
        if not user_id:
            return jsonify({'error': 'User ID required', 'success': False}), 400
        
        # In production, fetch from Firebase
        # For demo, return empty list
        return jsonify({
            'journals': [],
            'success': True
        })
    except Exception as e:
        logger.error(f"Error fetching journals: {e}")
        return jsonify({
            'error': 'Failed to fetch journals',
            'success': False
        }), 500

@app.route('/api/journals', methods=['POST'])
def add_journal():
    """Add a new journal entry"""
    try:
        data = request.json
        
        if not data or not data.get('uid') or not data.get('entry'):
            return jsonify({'error': 'Invalid data', 'success': False}), 400
        
        user_id = data.get('uid')
        entry = data.get('entry')
        mood = data.get('mood', 'neutral')
        
        # In production, save to Firebase
        # For demo, just return success
        return jsonify({
            'id': f"journal_{datetime.now().timestamp()}",
            'success': True
        })
    except Exception as e:
        logger.error(f"Error adding journal: {e}")
        return jsonify({
            'error': 'Failed to add journal',
            'success': False
        }), 500

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks for a user"""
    try:
        user_id = request.args.get('uid')
        if not user_id:
            return jsonify({'error': 'User ID required', 'success': False}), 400
        
        # In production, fetch from Firebase
        # For demo, return empty list
        return jsonify({
            'tasks': [],
            'success': True
        })
    except Exception as e:
        logger.error(f"Error fetching tasks: {e}")
        return jsonify({
            'error': 'Failed to fetch tasks',
            'success': False
        }), 500

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Add a new task"""
    try:
        data = request.json
        
        if not data or not data.get('uid') or not data.get('text'):
            return jsonify({'error': 'Invalid data', 'success': False}), 400
        
        user_id = data.get('uid')
        text = data.get('text')
        
        # In production, save to Firebase
        # For demo, just return success
        return jsonify({
            'id': f"task_{datetime.now().timestamp()}",
            'success': True
        })
    except Exception as e:
        logger.error(f"Error adding task: {e}")
        return jsonify({
            'error': 'Failed to add task',
            'success': False
        }), 500

@app.route('/api/tasks/<task_id>', methods=['PATCH'])
def update_task(task_id):
    """Update a task's completion status"""
    try:
        data = request.json
        
        if not data or 'completed' not in data:
            return jsonify({'error': 'Invalid data', 'success': False}), 400
        
        completed = data.get('completed')
        
        # In production, update in Firebase
        # For demo, just return success
        return jsonify({
            'success': True
        })
    except Exception as e:
        logger.error(f"Error updating task: {e}")
        return jsonify({
            'error': 'Failed to update task',
            'success': False
        }), 500

@app.route('/api/analyze-mood', methods=['POST'])
def analyze_mood():
    """Analyze journal text to detect mood (demo functionality)"""
    try:
        data = request.json
        
        if not data or not data.get('text'):
            return jsonify({'error': 'No text provided', 'success': False}), 400
        
        text = data.get('text')
        
        # Very simple demo sentiment analysis
        # In production, use a proper NLP service or library
        negative_words = ['sad', 'angry', 'depressed', 'tired', 'hurt', 'pain', 'hate']
        positive_words = ['happy', 'joy', 'good', 'great', 'love', 'like', 'peace']
        
        text = text.lower()
        negative_count = sum(1 for word in negative_words if word in text)
        positive_count = sum(1 for word in positive_words if word in text)
        
        if negative_count > positive_count:
            mood = 'negative'
        elif positive_count > negative_count:
            mood = 'positive'
        else:
            mood = 'neutral'
            
        # Add some Tokyo Ghoul-themed interpretation
        if 'hungry' in text.lower():
            mood = 'hungry'
        if any(word in text.lower() for word in ['rage', 'angry', 'furious']):
            mood = 'angry'
        
        return jsonify({
            'mood': mood,
            'success': True
        })
    except Exception as e:
        logger.error(f"Error analyzing mood: {e}")
        return jsonify({
            'error': 'Failed to analyze mood',
            'success': False
        }), 500

# Run the app
if __name__ == '__main__':
    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
