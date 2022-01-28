import socket
import random
HOST = '127.0.0.1'  # The server's hostname or IP address
PORT = 6666        # The port used by the server

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((HOST, PORT))
    try:
        while True:
            number = random.random()
            number_str = "2-"+str(number)
            s.send(number_str.encode())
            data = s.recv(1024)
    except KeyboardInterrupt:
        print("Cerrando conexion")
        s.close()

