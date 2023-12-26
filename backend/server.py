from flask import Flask, json, request, jsonify, make_response
# from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS
#from langchain.llms import OpenAI
#from openai_edge import Configuration, OpenAIApi
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from dotenv import load_dotenv
load_dotenv()
import os
from openai import OpenAI

# if you saved the key under a different environment variable name, you can do something like:
client = OpenAI(
  api_key=os.environ.get("OPENAI_API_KEY'"),
)
client = OpenAI()

app = Flask(__name__) # where we initialzed our app
# by default the flask run in production
# python-dotenv allow to create a flask dotenv file to have default info
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:123@localhost/slack'
# db = SQLAlchemy(app)
CORS(app)


@app.route("/members", methods=['GET'])
def members():
    return {"members": ["Member1", "Member2", "Member3"]}

@app.route("/chat", methods=['POST'])
async def handler(): 
  try:
    # query = req.body["query"]
    #data_json = request.data
    value = json.loads(request.data)
    question = value.get('question')
    # behavior = req.body["behavior"]
    # context = req.body["context"]
    # print("puzzle", query)
    print('')
    print("cold", value)

    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a redash visualization assistant, skilled in sql queries and data visualization, you only are required to give answer for query and data visualization question, if asked a topic out side these two make sure to response you have no information regarding your question, i am only here to help you with your query and data visualization question. when asked to write queries only answer the code, no description"},
            {"role": "user", "content": question}
        ]
    )
    # print(completion)
    # print('')
    # print(completion.choices[0].message)
    answer = completion.choices[0].message.content
    response_data = {"answer": answer}
    return jsonify(response_data), 200
  except Exception as error:
    print(error)
    return jsonify({"error": "An error occurred"}), 500
  
if __name__ == '__main__':
    app.run(debug=True)