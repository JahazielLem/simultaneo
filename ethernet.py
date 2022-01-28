"""
Desarrollado por CRESOF MX en colaboracion con Peso Global
Autor: Kevin Leon
Fecha: 2021-01-24
Descripcion:
Modulo API de comunicacion por conexion Ethernet para recoleccion de datos
"""
# LIBRERIAS
import socket
import os
import sys
from datetime import date, datetime
# CONSTANTES
HOST = '127.0.0.1'  # Direccion IP indicador de peso
PORT = 65432  # Puerto de la maquina host para la conexion
DIRLOG = os.getcwd
# FUNCIONES MAIN


def printLog(_string):
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    print("[LOG - {}] {}".format(current_time, _string))

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sWeight:
    sWeight.bind((HOST, PORT))
    sWeight.listen()
    conn, addr = sWeight.accept()
    with conn:
        printLog(("Conexion entrante de: {}".format(addr)))
        while True:
            data = conn.recv(1024)
            printLog(("[{}] {}".format(addr, data)))
            if not data:
                printLog(("Se cerro la conexion con: {}".format(addr)))
                break
