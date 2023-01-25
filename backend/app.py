from flask import Flask
from flask_cors import CORS
from flask import make_response

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return  make_response(open('data.json'), 200)