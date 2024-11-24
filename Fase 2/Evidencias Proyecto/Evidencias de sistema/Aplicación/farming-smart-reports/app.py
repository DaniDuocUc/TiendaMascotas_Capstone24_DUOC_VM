import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.ticker as ticker
import os
import requests
import re
from flask import Flask, request, jsonify
from datetime import datetime

from flask_cors import CORS
from fpdf import FPDF
from dotenv import load_dotenv
from emailSend import enviar_correo

# Cargar la APi Key o el Jose me wa molestar
load_dotenv()


def obtener_api_key():
    api_key = os.getenv('API_KEY')  # Carga la API Key desde las variables de entorno
    if not api_key:
        raise ValueError("API_KEY no definida en las variables de entorno")
    return api_key


# URL de la API de humedad y clave de API
API_URL = "https://dev-iot-backend.farmingsmart.cl/api/device/daily-humidity-averages"
API_KEY = obtener_api_key()


# Función para obtener los datos de humedad
def obtener_humedad(start_date, end_date):
    headers = {"api-Key": API_KEY}
    params = {"start_date": start_date, "end_date": end_date}
    try:
        response = requests.get(API_URL, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        # Reemplazar None y NONtype por 0 en todos los valores de la API, si no webea la wea
        def replace_none(value):
            return 0 if value is None or value == "NONtype" else value

        # Aplicar el reemplazo a los datos
        for zone in data.get('data', {}).get('zones', []):
            for device in zone.get("devices", []):
                device["humidity_readings"] = {key: replace_none(val) for key, val in
                                               device["humidity_readings"].items()}

        print(f"Datos de humedad obtenidos: {data}")  # chekear data porsi
        return data
    except requests.exceptions.RequestException as e:
        return {"error": f"Error al obtener los datos de humedad: {str(e)}"}


# function Validacion Regex
def validar_correo(correo):
    regex = r'^[a-zA-Z0-9_.+-]+@[a-zAZ0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(regex, correo) is not None


# Función para generar el reporte PDF
def generar_reporte(start_date, end_date, correo_destinatario, humedad_data):

    start_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    pdf = PDF(format='A4')
    pdf.add_page()

    # Título del PDF
    pdf.set_font('Arial', 'B', 20)
    pdf.set_text_color(240, 240, 240)
    pdf.cell(200, 10, txt="Reporte de Humedad de Terreno", ln=True, align='C')
    pdf.ln(10)

    # tamaño y fuente del título
    pdf.set_font("Arial", size=12)
    pdf.set_text_color(0, 0, 0)
    
    # Texto intro parte 1
    intro_text = "Este reporte proporciona un análisis de las lecturas de humedad del suelo entre las fechas: "
    pdf.multi_cell(0, 10, intro_text, align='J')
    
    # Fechas en negrita
    pdf.set_font("Arial", 'B', 12)  
    pdf.cell(0, 10, start_date.strftime("%Y-%m-%d") + " y " + end_date.strftime("%Y-%m-%d") + " inclusive.", ln=True, align='J')
    
    # Texto de introducción adicional
    pdf.set_font("Arial", size=12)
    rest_text = (" A continuación, se presentan gráficos que muestran los promedios diarios de humedad de suelo de "
                 "los dispositivos IoT instalados en cada zona. Esta información es útil para tomar decisiones "
                 "informadas sobre el riego y el manejo del suelo.")
    pdf.multi_cell(0, 10, rest_text, align='J')

    pdf.ln(10)  # Espacio de separación

    # Configurar color de relleno para el cuadro (un celeste rico y suave)
    #pdf.set_fill_color(173, 216, 230)  # RGB para color celeste 
    pdf.set_fill_color(255, 255, 153)  # RGB amarillo warning???
    #pdf.set_fill_color(255, 204, 153)  # RGB naranjo? warning mas brigido?
    
    # Posición del cuadro
    x = pdf.get_x()  # posición actual en x
    y = pdf.get_y()  # posición actual en y
    #pdf.set_font("Arial", 'B', 12)  
    # Calcular la altura del cuadro según el texto
    cuadro_texto = ("Las celdas de Humedad min. y Humedad max. se mostrarán de color rojo cuando estén bajo o sobre los "
                    "niveles de humedad configurados como óptimos, entre 50% y 80%, de lo contrario, se mostrarán de color verde.")
    
    # Determina el ancho y alto del cuadro
    line_height = 10
    num_lines = len(pdf.multi_cell(0, line_height, cuadro_texto, split_only=True))  # calcula el número de líneas
    rect_height = line_height * num_lines

    # Dibuja el cuadro con la altura calculada
    pdf.rect(x, y, 190, rect_height, 'F')

    # borde
    pdf.set_draw_color(0, 0, 0)  # Color negro para el borde
    pdf.rect(x, y, 190, rect_height, 'D')  # 'D' solo dibuja el borde del cuadrao

    #Texto que quedará sobre el cuadro
    pdf.multi_cell(0, line_height, cuadro_texto, align='J')

    pdf.ln(10)  # Espacio adicional

    # Crear la tabla y gráficos y si n hay datos, mostrar su mensajito en rojo asi de sangre error
    if not humedad_data['data']['zones']:
        # Si no hay datos, agregar mensaje de "No hay datos suficientes"
        pdf.set_font("Arial", 'B', 12)
        pdf.set_text_color(255, 0, 0)  # Rojo para el mensaje
        pdf.multi_cell(0, 10,
                       "No hay datos suficientes para generar el reporte en el rango de fechas seleccionado.",
                       align='C')
    else:
        # Crear la tabla y gráficos si habemus datum
        crear_tabla(humedad_data['data']['zones'], pdf)
        crear_graficos(humedad_data['data']['zones'], pdf, start_date, end_date)

    # Asegurarse de que el directorio exista
    directorio = './Reportes_folder'
    if not os.path.exists(directorio):
        os.makedirs(directorio)

    # Si start_date y end_date son objetos datetime, pasar a string
    start_date_str = start_date.strftime("%Y-%m-%d")
    end_date_str = end_date.strftime("%Y-%m-%d")

    # Crear el nombre del  PDF con las fechas en el nombre
    archivo_pdf = os.path.join(directorio, f'Reporte_Humedad-{start_date_str}-{end_date_str}.pdf')

    # Guardar sosi
    print(f"Guardando reporte en: {archivo_pdf}")  # Para verificar que el archivo se guarda correctamente
    pdf.output(archivo_pdf)

    # Enviar el correo con el reporte generado
    enviar_correo(correo_destinatario, archivo_pdf, API_KEY)


# Función para crear la tabla con las medidas críticas de humedad
def crear_tabla(zonas, pdf):
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, "Medidas Generales de Humedad de Suelo por Dispositivo", ln=True, align='C')
    pdf.ln(5)

    # Definir el ancho de las celdas (en mm como sap)
    ancho_col1 = 30  # Zona
    ancho_col2 = 40  # Dispositivo
    ancho_col3 = 40  # Humedad mínima (%)
    ancho_col4 = 40  # Humedad máxima (%)
    ancho_col5 = 40  # Fecha reg. Crítico

    # settear  fuente y crear el encabezado
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(ancho_col1, 10, "Zona", 1, 0, 'C')
    pdf.cell(ancho_col2, 10, "Dispositivo", 1, 0, 'C')
    pdf.cell(ancho_col3, 10, "Humedad min. %", 1, 0, 'C')
    pdf.cell(ancho_col4, 10, "Humedad máx. %", 1, 0, 'C')
    pdf.cell(ancho_col5, 10, "Fecha reg. Crítico", 1, 1, 'C')  # Salto de línea después del jeder

    pdf.set_font('Arial', '', 10)

    for zona in zonas:
        for device in zona["devices"]:
            device_id = device["device_id"]
            # % de humedad flotante o webea postman (?)
            readings = [float(value) if value is not None else 0.0 for value in
                        device["humidity_readings"].values()]
            min_humidity = min(readings)
            max_humidity = max(readings)

            # Get critital values sosi (por debajo de 50% o por encima de 80%)
            critical_dates = [date for date, value in device["humidity_readings"].items() if
                              float(value) < 50 or float(value) > 80]

            # Verificar si hay suficiente espacio en la página para la próxima fila
            if pdf.get_y() > 260:  # Si la posición y está cerca del final de la página
                pdf.add_page()  # Crear una nueva página
                pdf.set_y(30)  # 5 linitas mas porque igual queda encima del fooooter

            # Si hay registros críticos, registrar una línea por cada fecha crítica
            if critical_dates:
                for critical_date in critical_dates:

                    # acá revisamos si necesitamos darle un espacio para evitar quedar encima del jeder
                    if pdf.get_y() > 260:
                        pdf.add_page()
                        pdf.set_y(30)  # Mover a una posición adecuada en la nueva página

                    pdf.cell(ancho_col1, 10, f"Zona {zona['zona']}", 1, 0, 'C')
                    pdf.cell(ancho_col2, 10, device_id, 1, 0, 'C')

                    # tengo claro que son repetitivos los if, pero me cagaban las celdas si lo hacía función
                    if min_humidity < 50 or min_humidity > 80:
                        pdf.set_fill_color(255, 200, 200)  # Color rojo si es critivco
                        pdf.cell(ancho_col3, 10, f"{min_humidity:.1f}", 1, 0, 'C', fill=True)
                    else:
                        pdf.set_fill_color(200, 255, 200)  # Color verde no critito
                        pdf.cell(ancho_col3, 10, f"{min_humidity:.1f}", 1, 0, 'C', fill=True)

                    # lo mismo e arriba pero para la celda max
                    if max_humidity < 50 or max_humidity > 80:
                        pdf.set_fill_color(255, 200, 200)  # Color rojo critiko
                        pdf.cell(ancho_col4, 10, f"{max_humidity:.1f}", 1, 0, 'C', fill=True)
                    else:
                        pdf.set_fill_color(200, 255, 200)  # Color verde paco agua hahah
                        pdf.cell(ancho_col4, 10, f"{max_humidity:.1f}", 1, 0, 'C', fill=True)

                    # Mostrar la fecha crítica
                    pdf.cell(ancho_col5, 10, critical_date, 1, 1, 'C')
                    pdf.set_fill_color(255, 255, 255)  # poner fondo blanco

            # Si no hay registros críticos, mostrar "sin registro crítico"
            if not critical_dates:
                pdf.cell(ancho_col1, 10, f"Zona {zona['zona']}", 1, 0, 'C')
                pdf.cell(ancho_col2, 10, device_id, 1, 0, 'C')

                # si se está de nuevo, reitero, me jodió mucho las celdas
                if min_humidity < 50 or min_humidity > 80:
                    pdf.set_fill_color(255, 200, 200)
                    pdf.cell(ancho_col3, 10, f"{min_humidity:.1f}", 1, 0, 'C', fill=True)
                else:
                    pdf.set_fill_color(200, 255, 200)
                    pdf.cell(ancho_col3, 10, f"{min_humidity:.1f}", 1, 0, 'C', fill=True)

                if max_humidity < 50 or max_humidity > 80:
                    pdf.set_fill_color(255, 200, 200)
                    pdf.cell(ancho_col4, 10, f"{max_humidity:.1f}", 1, 0, 'C', fill=True)
                else:
                    pdf.set_fill_color(200, 255, 200)
                    pdf.cell(ancho_col4, 10, f"{max_humidity:.1f}", 1, 0, 'C', fill=True)

                # Mostrar "sin registro crítico" en la fecha
                pdf.cell(ancho_col5, 10, "sin registro crítico", 1, 1, 'C')

    pdf.ln(10)


# Función para crear gráficos matplot
def crear_graficos(zonas, pdf, start_date, end_date):
    # Convertir las fechas de inicio y fin a objetos datetime
    if isinstance(start_date, datetime):
        start_date_dt = start_date
    else:
        start_date_dt = datetime.strptime(start_date, "%Y-%m-%d")

    if isinstance(end_date, datetime):
        end_date_dt = end_date
    else:
        end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")

    rango_fechas = f"{start_date_dt.strftime('%Y-%m-%d')} - {end_date_dt.strftime('%Y-%m-%d')}"

    for zona in zonas:
        # Crear un nuevo gráfico x cada zona
        plt.figure(figsize=(10, 5))

        for device in zona["devices"]:
            # Extraer fechas y valores de humedad de cada IOT
            fechas_validas = []
            humedad_values = []
            for fecha, humedad in device["humidity_readings"].items():
                try:
                    fechas_validas.append(datetime.strptime(fecha, "%Y-%m-%d"))
                    humedad_values.append(float(humedad))  # Convertir a float para graficar
                except ValueError:
                    continue  # Ignorar entradas no convertibles

            # Graficar solo si hay datos válidos
            if humedad_values:
                plt.plot(fechas_validas, humedad_values, marker='o', label=f"Dispositivo {device['device_id']}")

        # Configuración del gráfico
        plt.title(f'Humedad Promedio Diaria - Zona {zona["zona"]}')
        plt.xlabel(f'Fechas ({rango_fechas})')
        plt.ylabel('Humedad (%)')

        # Ajustar eje Y para mostrar porcentajes en rangos cercanos a los datos
        plt.ylim(0, 100)
        plt.gca().yaxis.set_major_locator(ticker.MultipleLocator(10))
        plt.gca().yaxis.set_major_formatter(ticker.FuncFormatter(lambda y, _: f'{int(y)}%'))

        # Configurar el formato de fecha en el eje X
        plt.xticks(rotation=45)
        plt.gca().xaxis.set_major_locator(mdates.DayLocator())
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))

        # Ajustar el límite del eje X entre start_date y end_date, su cacho
        if fechas_validas:
            plt.xlim(min(start_date, fechas_validas[0]), max(end_date, fechas_validas[-1]))

        # Colocar leyenda en una posición adecuada
        plt.legend(title="Dispositivos", loc='upper left', bbox_to_anchor=(1, 1))
        plt.grid()
        plt.tight_layout()

        # Guardar gráfico como imagen
        graph_filename = f'grafico_zona_{zona["zona"]}.png'
        plt.savefig(graph_filename)
        plt.close()

        # Agregar el gráfico al PDF
        if zona["zona"] % 2 == 1:  # Si es impar, se añade en la primera mitad de la página
            pdf.add_page()
            pdf.image(graph_filename, x=10, y=35, w=190)
        else:  # Si es par, se añade en la segunda mitad
            pdf.image(graph_filename, x=10, y=150, w=190)


# Clase para el footer y el header del PDF
class PDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        fecha_generacion = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.cell(0, 10, f'Generado en: {fecha_generacion} - Página {self.page_no()}', 0, 0, 'C')

    def header(self):
        self.set_fill_color(0, 102, 204)
        self.rect(0, 0, 210, 20, 'F')
        self.image('./images/farmer.png', x=6, y=2, w=9, h=9)
        self.image('./images/growth.png', x=6, y=11, w=9, h=9)
        self.image('./images/field.png', x=16, y=2, w=9, h=9)
        self.image('./images/land.png', x=16, y=11, w=9, h=9)


def create_app():
    app = Flask(__name__)
    cors = CORS(app, origins="*")
    cors.init_app(app)
    print("Servidor iniciado")

    @app.route('/')
    def index():
        return "¡Servidor en línea!"

    @app.route('/api/v1/generate-report', methods=['POST'])
    def generate_report():
        try:
            # recibir Yeison
            data = request.get_json()
            if not data:
                return jsonify({"error": "El cuerpo de la solicitud debe ser JSON"}), 400

            # Obtener fechas y correo del yeison
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            correo_destinatario = data.get('correo')

            # checkiar que las fechas y el correo estén definidos
            if not start_date or not end_date or not correo_destinatario:
                return jsonify({"error": "Debe proporcionar 'start_date', 'end_date' y 'correo'"}), 400

            # Validación del correo electrónico
            if not validar_correo(correo_destinatario):
                return jsonify({"error": "Correo electrónico inválido"}), 400

            # Obtener los datos de humedad %
            humedad_data = obtener_humedad(start_date, end_date)

            # Si hay un error en los datos, retornar el error
            if "error" in humedad_data:
                return jsonify({"status": "error", "message": humedad_data["error"]}), 502  # -> Bad Gateway

            # Generar el reporte y enviarlo por correo
            generar_reporte(start_date, end_date, correo_destinatario, humedad_data)

            # Retornar confirmación de éxito
            return jsonify({"status": "success", "message": "Reporte generado y enviado correctamente"}), 200
        except Exception as e:
            return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
