#LIBRERIAS
import socket
import os
import sys
from datetime import date, datetime
from threading import Lock
from flask import Flask, render_template, session, jsonify
from flask_socketio import SocketIO, emit
import requests


# CONSTANTES
HOST = '127.0.0.1'  # Direccion IP indicador de peso
PORT = 65432  # Puerto de la maquina host para la conexion
DIRLOG = os.getcwd
# FUNCIONES MAIN


def printLog(_string):
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    print("[LOG - {}] {}".format(current_time, _string))

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = None

app = Flask(__name__, static_url_path='/static',static_folder='static')
socketio = SocketIO(app, async_mode=async_mode)
thread = None
thread_lock = Lock()

url = 'https://api.coinbase.com/v2/prices/btc-usd/spot'

def background_thread():
    """Example of how to send server generated events to clients."""
    count = 0
    while True:
        socketio.sleep(1)
        count += 1
        price = ((requests.get(url)).json())['data']['amount']
        socketio.emit('my_response',
                      {'data': 'Bitcoin current price (USD): ' + price, 'count': count})

@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)

@socketio.event
def my_event(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']})
    return jsonify(data=message['data'])

@socketio.event
def connect():
    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(background_thread)
    emit('my_response', {'data': 'Connected', 'count': 0})
    

if __name__ == '__main__':
    socketio.run(app)