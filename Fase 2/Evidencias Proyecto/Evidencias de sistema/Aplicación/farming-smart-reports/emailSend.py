import requests
import os
from dotenv import load_dotenv

#Cargar la APi Key o el Jose me wa molestar
load_dotenv()

def obtener_api_key():
    api_key = os.getenv('API_KEY')  
    if not api_key:
        raise ValueError("API_KEY no definida en las variables de entorno")
    return api_key

def enviar_correo(correo, archivo_pdf, api_key):
    # URL de la API de correo de FarmingSmart
    url = "https://dev-iot-backend.farmingsmart.cl/api/email/send" 
    
    headers = {
        "accept": "application/json",
        "api-key": obtener_api_key()
    }
    
    # Verifica que el correo_destinatario sea una cadena válida
    if isinstance(correo, str) and correo:
        to_field = correo
    else:
        return {"error": "El formato del correo destinatario no es válido."}
    
    # Verificar si el archivo PDF existe
    if not os.path.isfile(archivo_pdf):
        return {"error": f"El archivo {archivo_pdf} no existe."}

    # Preparar los datos del correo
    data = {
        "sender[email]": "no-reply@example.com",  #quien envía el correo - lo cambiamos???
        "to": to_field,  # Correo destinatario
        "subject": "Reporte de Humedad del Suelo",
                    
        "htmlContent": """<html><body>
                        <h3>Estimado/a,</h3>
                        <p>Le informamos que el reporte semanal de humedad del suelo solicitado ha sido generado y se adjunta a este correo en formato PDF.</p>
                        <p>Descargar para una mejor visualización de los datos. 
                        <p>Quedamos a su disposición para cualquier consulta adicional.</p>
                        <p>Saludos cordiales,</p>
                        <p><strong>FarmingSmart</strong></p>
                        </body></html>""",  # Cuerpo del mensaje en HTML
    }
    
    try:
        # Preparar el archivo adjunto
        with open(archivo_pdf, 'rb') as file:
            files = {'attachment': (os.path.basename(archivo_pdf), file, 'application/pdf')}
            # Hacer la solicitud POST a la API con form data
            response = requests.post(url, headers=headers, data=data, files=files)
            
            # Verificar la respuesta de la API
            if response.status_code == 200:
                print("Correo enviado exitosamente.")
                return {"status": "success", "message": "Correo enviado exitosamente."}
            else:
                # Si la API responde con un error, lanzar una excepción
                raise Exception(f"Error al enviar correo: {response.text}")
    
    except Exception as e:
        print(f"Error al enviar el correo: {str(e)}")
        return {"error": f"Error al enviar el correo: {str(e)}"}
