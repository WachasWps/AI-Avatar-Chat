from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from gtts import gTTS
import os

app = Flask(__name__)
CORS(app)

@app.route('/generate-audio', methods=['POST'])
def generate_audio():
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' in request"}), 400

        text = data['text']
        language = data.get('language', 'en')

        # Generate audio using gTTS
        tts = gTTS(text=text, lang=language)
        audio_file = 'output.mp3'
        tts.save(audio_file)

        # Send the audio file as a response
        return send_file(audio_file, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)