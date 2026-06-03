from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from chatbot_integration import get_chatbot_response, setup_chatbot

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the frontend

# Initialize rate limiter: 30 requests per minute per IP
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["30 per minute"],
    storage_uri="memory://"
)

@app.route('/chat', methods=['POST'])
@limiter.limit("30 per minute")
def chat():
    """
    Chat endpoint for the frontend to communicate with the NLP model.
    Protected by Flask-Limiter to prevent DoS attacks.
    """
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400
        
    user_message = data['message']
    
    try:
        # Get response from the local Keras/NLTK model
        response = get_chatbot_response(user_message)
        return jsonify({"response": response})
    except Exception as e:
        app.logger.error(f"Chatbot error: {str(e)}")
        return jsonify({"error": "An error occurred generating the response"}), 500

if __name__ == '__main__':
    # Initialize the model globally before starting the server
    print("Initializing Chatbot Model...")
    success = setup_chatbot()
    if not success:
        print("Failed to initialize chatbot model. Exiting.")
        exit(1)
        
    print("Starting Flask server on port 5000...")
    app.run(host='127.0.0.1', port=5000)
