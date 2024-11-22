FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt
COPY . .
EXPOSE 5000
RUN chmod +x ./runserver.sh
ENTRYPOINT ["sh", "runserver.sh"]