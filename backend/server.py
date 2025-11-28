from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS
from dotenv import load_dotenv
import os, json, re

app = Flask(__name__)
load_dotenv()
CORS(app)

API_KEY = os.getenv("API_KEY")
genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    fields = data.get("fields", [])
    html_context = data.get("html", "")

    prompt = f"""
        Você é um gerador de dados de teste altamente contextual.
        
        Você recebe:
        1. CONTEXTO DO FORMULÁRIO (texto da página): 
        \"\"\"
        {html_context}
        \"\"\"
        
        2. CAMPOS DO FORMULÁRIO:
        {fields}
        
        REGRAS IMPORTANTES:
        - Gere dados coerentes com o contexto.
        - Se o formulário for sobre armas, gere dados relacionados a armas.
        - Se for escolar, gere dados de alunos.
        - Se for policial, gere dados plausíveis.
        - Se for médico, gere dados de pacientes.
        - Se não entender o contexto, gere dados genéricos profissionais.
        
        REGRAS DE FORMATAÇÃO:
        - Responda ESTRITAMENTE um JSON.
        - Sem explicação.
        - Sem markdown.
        - Sem texto fora do JSON.
        - Sem ```json.
        - Cada chave deve ser exatamente igual ao "name" do campo.
        """

    response = model.generate_content(prompt)
    raw_text = response.candidates[0].content.parts[0].text.strip()
    raw_text = re.sub(r"```json|```", "", raw_text).strip()

    try:
        fake_data = json.loads(raw_text)
    except:
        json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if json_match:
            try:
                fake_data = json.loads(json_match.group(0))
            except:
                fake_data = {"raw": raw_text}
        else:
            fake_data = {"raw": raw_text}

    return jsonify(fake_data)


@app.route("/")
def home():
    return {"status": "API Gemini Fake Data rodando"}

if __name__ == "__main__":
    app.run(port=5000, debug=True)
