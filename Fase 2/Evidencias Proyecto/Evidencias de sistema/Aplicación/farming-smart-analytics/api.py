from flask import Flask
from flask_cors import CORS
from routes.model_01 import model_01
from routes.model_02 import model_02
from routes.model_04 import model_04
from security.decorator import require_api_key

app = Flask(__name__)
cors = CORS(app, origins="*")
cors.init_app(app)


@app.route('/')
@require_api_key
def index():
    # test
    return "¡Servidor en línea!"


app.register_blueprint(model_01)
app.register_blueprint(model_02)

app.register_blueprint(model_04)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
