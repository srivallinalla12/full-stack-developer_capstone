import requests
import os
from dotenv import load_dotenv
from urllib.parse import quote

load_dotenv()

# Base URLs for backend and sentiment microservice
backend_url = os.getenv(
    'backend_url',
    default="http://localhost:3030",
).rstrip('/')

sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050",
).rstrip('/')


# -----------------------------
# Helper: GET requests to backend
# -----------------------------
def get_request(endpoint, **kwargs):
    params = ""
    if kwargs:
        for key, value in kwargs.items():
            params = params + key + "=" + value + "&"

    request_url = backend_url + endpoint + "?" + params
    print("GET from {} ".format(request_url))
    try:
        response = requests.get(request_url)
        return response.json()
    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        print("Network exception occurred")


# -----------------------------
# Sentiment analysis
# -----------------------------
def analyze_review_sentiments(text):
    """
    Call the sentiment analyzer microservice and return a
    normalized sentiment label: 'positive', 'negative' or 'neutral'.
    """

    if not text:
        return "neutral"

    # URL-encode the text so spaces & punctuation don't break the URL
    encoded_text = quote(text)
    request_url = f"{sentiment_analyzer_url}/analyze/{encoded_text}"
    print("Calling sentiment analyzer:", request_url)

    try:
        response = requests.get(request_url)
        raw_text = response.text
        print("Sentiment raw response (text):", raw_text)

        # Try to decode JSON if possible, otherwise fall back to raw string
        try:
            data = response.json()
        except ValueError:
            data = raw_text

        label = "neutral"

        # Case 1: microservice returns JSON like {"sentiment": "positive"}
        if isinstance(data, dict):
            if "sentiment" in data:
                if isinstance(data["sentiment"], str):
                    label = data["sentiment"]
                elif isinstance(data["sentiment"], dict):
                    label = (
                        data["sentiment"].get("label")
                        or data["sentiment"].get("sentiment")
                        or "neutral"
                    )
            elif "label" in data:
                label = data["label"]

        # Case 2: microservice returns a plain string, e.g. "positive"
        elif isinstance(data, str):
            # Strip quotes if JSON serialized as a bare string
            label = data.strip().strip('"').strip("'")

        return (label or "neutral").lower()

    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        print("Network exception occurred")
        return "neutral"


# -----------------------------
# POST review to backend
# -----------------------------
def post_review(data_dict):
    request_url = backend_url + "/insert_review"
    try:
        response = requests.post(request_url, json=data_dict)
        print(response.json())
        return response.json()
    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        print("Network exception occurred")
