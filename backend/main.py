from fastapi import FastAPI
from transformers import pipeline

app = FastAPI()

print("Cargando modelo...")

clasificador = pipeline(
    "text-classification",
    model="tanaos/tanaos-spam-detection-spanish"
)

print("Modelo cargado.")

@app.get("/")
def inicio():
    return {"mensaje": "Servidor funcionando"}

@app.get("/analizar")
def analizar():

    texto = "Necesito que me envíe el código que acaba de llegar a su celular."

    resultado = clasificador(texto)

    return resultado