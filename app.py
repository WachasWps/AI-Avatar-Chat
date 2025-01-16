from flask import Flask, request, jsonify, redirect, url_for
import os
import uuid
from langchain_openai import AzureOpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from PyPDF2 import PdfReader
import docx2txt
from io import BytesIO
import traceback
from langchain_community.chat_models import AzureChatOpenAI
from langchain.chains import RetrievalQA
from flask_cors import CORS
import logging
import requests
import asyncio
import base64
import google.generativeai as genai

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "http://localhost:5173"},
                    r'/analyze-image': {"origins": "http://localhost:5173"},
                    r"/uploaded_docs": {"origins": "http://localhost:5173"},
                    r"/qna/*": {"origins": "http://localhost:5173"}})

# Flask app setup
UPLOAD_FOLDER = './uploads'
EMBEDDINGS_FOLDER = './embeddings'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EMBEDDINGS_FOLDER, exist_ok=True)
genai.configure(api_key="AIzaSyBtpKzAxx2pwMQ1eMO_jtRxk28rRaglVc0")

# Azure OpenAI Configuration
AZURE_API_KEY = 'DT7N5LlmoXALRGppU1Jgcyrm1tt69ZOhnduXguB7Xkhte4wOTy2lJQQJ99AKACYeBjFXJ3w3AAABACOGPMfj'
AZURE_API_VERSION = '2023-06-01-preview'
AZURE_ENDPOINT = 'https://botwot-opanai.openai.azure.com/'
AZURE_DEPLOYMENT = 'gpt-4o-mini'
EMBEDDING_DEPLOYMENT = 'text-embedding-3-small'

# Function to extract text from a PDF file
def get_raw_data_pdf(pdf_file):
    pdf_bytes = pdf_file.read()
    pdf_stream = BytesIO(pdf_bytes)
    text = ""
    pdf_reader = PdfReader(pdf_stream)
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

# Function to split text into chunks
def get_chunks_data(raw_text, chunk_size=2048):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=50, length_function=len)
    chunks = text_splitter.split_text(raw_text)
    return chunks

# New function to call the lip-sync API
async def generate_lip_sync_audio(text: str):
    url = "https://video-dubbing-mtepodzz4a-el.a.run.app/avatar/avatar"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": "1517a2f9-8c7f-410a-a2a5-c4116f41640c"
    }
    data = {
        "gender": "female",
        "language": "en",
        "lipSync_api": "lip_3",
        "preset": "ultra_fast",
        "text": text,
        "voice_api": "api_1",
        "voice_id": "EXAVITQu4vr4xnSDxMaL"
    }

    try:
        response = await asyncio.to_thread(requests.post, url, headers=headers, json=data)
        response_data = response.json()
        return response_data  # Contains both the mp3 and viseme data
    except Exception as e:
        logger.error("Error during lip-sync request", exc_info=True)
        raise e

# Helper function to process base64 images
def process_base64_image(base64_image):
    return {
        "mime_type": "image/jpeg",
        "data": base64_image
    }

# Home route
@app.route('/', methods=["GET"])
def home():
    logger.info("Redirecting to the upload page.")
    return redirect(url_for('upload_page'))

# Route to render upload page
@app.route('/upload', methods=["POST"])
def upload_page():
    try:
        logger.info("Received an upload request.")

        if 'file' not in request.files:
            return jsonify({"error": "No file provided."}), 400

        pdf_file = request.files['file']
        if not pdf_file.filename:
            return jsonify({"error": "No file selected."}), 400

        doc_uuid = str(uuid.uuid4())
        logger.debug(f"Generated document UUID: {doc_uuid}")

        # Extract text from the PDF
        raw_text = get_raw_data_pdf(pdf_file)
        text_chunks = get_chunks_data(raw_text)

        # Create embeddings
        embeddings = AzureOpenAIEmbeddings(
            azure_endpoint=AZURE_ENDPOINT,
            api_key=AZURE_API_KEY,
            azure_deployment=EMBEDDING_DEPLOYMENT,
            openai_api_version=AZURE_API_VERSION
        )

        # Save embeddings to disk
        save_path = os.path.join(EMBEDDINGS_FOLDER, doc_uuid)
        os.makedirs(save_path, exist_ok=True)

        vector_data = FAISS.from_texts(texts=text_chunks, embedding=embeddings)
        vector_data.save_local(save_path)

        logger.debug(f"FAISS index saved successfully at: {save_path}")

        return jsonify({"uuid": doc_uuid}), 200

    except Exception as e:
        logger.error("Error during file upload", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Route for QnA functionality
@app.route('/qna/<uuid>', methods=["POST"])
def qna_page(uuid):
    try:
        # Extract data from the request
        question = request.json.get('question')
        base64_image = request.json.get('image')  # Accept base64 image from the frontend
        emotion = request.json.get('emotion')  # Accept detected emotion from the frontend

        if not question:
            return jsonify({"error": "No question provided."}), 400

        # Load FAISS index
        embedding_path = os.path.join(EMBEDDINGS_FOLDER, uuid)
        index_file = os.path.join(embedding_path, "index.faiss")

        if not os.path.exists(index_file):
            return jsonify({"error": "FAISS index file not found."}), 404

        embeddings = AzureOpenAIEmbeddings(
            azure_endpoint=AZURE_ENDPOINT,
            api_key=AZURE_API_KEY,
            azure_deployment=EMBEDDING_DEPLOYMENT,
            openai_api_version=AZURE_API_VERSION
        )

        vector_store = FAISS.load_local(embedding_path, embeddings, allow_dangerous_deserialization=True)

        # Initialize Azure Chat OpenAI
        llm = AzureChatOpenAI(
            api_key=AZURE_API_KEY,
            api_version=AZURE_API_VERSION,
            azure_endpoint=AZURE_ENDPOINT,
            azure_deployment=AZURE_DEPLOYMENT,
            temperature=0.3
        )

        # Create RetrievalQA chain
        qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=vector_store.as_retriever())

        # Modify the question to include emotion context
        if emotion:
            question = f"The user is feeling {emotion}. {question} Please respond in a way that is appropriate for this emotion. dont say that i am happy to hear you feel this way or that way or anything, dont amke it look lik the feeling is being said to you but make it lool like you know the feeling, just cater to the emtoion in 2-3 words, and show some human like emotion and stuff"

        # Get the answer from the LLM
        answer = qa_chain.run(question)

        # Pass the base64 image to Gemini API if provided
        additional_info = ""
        if base64_image:
            gemini_model = genai.GenerativeModel(model_name="gemini-1.5-pro")
            gemini_response = gemini_model.generate_content([
                process_base64_image(base64_image),
                question
            ])
            additional_info = gemini_response.text

        # Combine the answer and additional info
        final_answer = f"{answer} {additional_info}".strip()

        # Generate lip-sync audio and viseme data
        lip_sync_response = asyncio.run(generate_lip_sync_audio(final_answer))
        viseme_data = lip_sync_response.get('json', {}).get('mouthCues', [])
        mp3_audio = lip_sync_response.get('mp3', '')

        # Return the response
        return jsonify({
            "answer": final_answer,
            "audio": mp3_audio,
            "visemeData": viseme_data
        }), 200

    except Exception as e:
        logger.error("Error during QnA processing", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/uploaded_docs', methods=["GET"])
def uploaded_docs():
    try:
        docs = [f for f in os.listdir(EMBEDDINGS_FOLDER) if os.path.isdir(os.path.join(EMBEDDINGS_FOLDER, f))]
        logger.debug(f"Found documents: {docs}")
        return jsonify({"docs": docs})
    except Exception as e:
        logger.error("Error fetching documents", exc_info=True)
        return jsonify({"error": "Error fetching documents", "message": str(e)}), 500

# Route to analyze an image
@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    try:
        # Check if a file is uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        image = request.files['file']

        # Validate the uploaded file
        if image.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not image.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif')):
            return jsonify({"error": "Unsupported file type"}), 400

        # Read image and encode it to Base64
        image_data = image.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')

        # Get the text prompt from the request
        text_prompt = request.form.get('prompt', "Describe the main elements, colors, and notable features in this image.")

        # Configure the Gemini API key
        gemini_api_key = os.getenv("GEMINI_API_KEY", "AIzaSyBtpKzAxx2pwMQ1eMO_jtRxk28rRaglVc0")
        if not gemini_api_key:
            logger.error("Gemini API key not found.")
            return jsonify({"error": "Gemini API key is missing"}), 500

        # Configure Gemini with the API key
        genai.configure(api_key=gemini_api_key)

        # Use Gemini API to process the image
        model = genai.GenerativeModel(model_name="gemini-1.5-pro")

        # Mood detection prompt
        mood_prompt = "Analyze the facial expression in this image and determine the mood. Possible moods are: happy, sad, angry, nervous, confused, or neutral."
        mood_response = model.generate_content([
            {"mime_type": "image/jpeg", "data": base64_image},
            mood_prompt
        ])
        mood = mood_response.text.strip().lower()

        # Image analysis prompt
        analysis_response = model.generate_content([
            {"mime_type": "image/jpeg", "data": base64_image},
            text_prompt
        ])
        result = analysis_response.text

        # Generate lip-sync audio for the result
        lip_sync_response = asyncio.run(generate_lip_sync_audio(result))
        viseme_data = lip_sync_response.get('json', {}).get('mouthCues', [])
        mp3_audio = lip_sync_response.get('mp3', '')

        # Return the result, audio, viseme data, and mood
        return jsonify({
            "data": result,
            "audio": mp3_audio,
            "visemeData": viseme_data,
            "mood": mood,  # Add mood to the response
            "image": base64_image  # Return the Base64 image for display
        })

    except Exception as e:
        # Handle exceptions gracefully
        logger.error(f"Error processing image with Gemini API: {e}", exc_info=True)
        return jsonify({"error": "An error occurred while processing the image.", "details": str(e)}), 500
if __name__ == '__main__':
    logger.info("Starting Flask app.")
    app.run(debug=True)
