from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from time import sleep
from enviroment_config import EnvironmentConfig

environment = EnvironmentConfig()

engine = create_engine(
    environment.get_database_url(),
    echo=True,
    pool_size=10,  # Número máximo de conexiones en el pool
    max_overflow=10,  # Conexiones adicionales en caso de overflow
    pool_timeout=30,  # Tiempo de espera antes de lanzar un error por timeout
    pool_recycle=1800  # Reciclar conexiones inactivas para evitar desconexiones
)


def connect_to_database(engine, max_attempts=5, delay=5):
    for attempt in range(1, max_attempts + 1):
        try:
            # Intentar conectarse
            print(f"Intentando conectarse (Intento {attempt}/{max_attempts})...")
            with engine.connect() as connection:
                print("Conexión exitosa.")
                return connection  # Conexión exitosa, se retorna el objeto
        except OperationalError as e:
            print(f"Error al conectarse: {e}")
            if attempt < max_attempts:
                print(f"Reintentando en {delay} segundos...")
                sleep(delay)  # Esperar antes de reintentar
            else:
                print("Se alcanzó el número máximo de intentos. Conexión fallida.")
                raise  # Re-lanzar la excepción después del último intento


# Uso de la función
try:
    connection = connect_to_database(engine)
    # Realiza operaciones con la base de datos...
    print("Base de datos lista para consultas.")
except Exception as e:
    print(f"No fue posible conectarse a la base de datos: {e}")
