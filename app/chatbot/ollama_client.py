import json
import requests
from app.config import settings

# phi3:mini on modest hardware can take 20-40s for a full answer, so allow
# generous headroom while capping output length to keep responses snappy.
TIMEOUT = 120

_OPTIONS = {
    "temperature": 0.7,
    "num_predict": 400,  # bound the answer length for faster turnaround
    "top_p": 0.9,
}


def stream_ollama(prompt: str, system: str = None):
    """Yield response tokens from Ollama as they are generated.

    Falls back to yielding nothing (caller handles the fallback) on any error.
    """
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True,
        "keep_alive": "15m",
        "options": _OPTIONS,
    }
    if system:
        payload["system"] = system

    try:
        with requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=TIMEOUT,
            stream=True,
        ) as response:
            if response.status_code != 200:
                return
            for line in response.iter_lines():
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except (ValueError, TypeError):
                    continue
                token = obj.get("response", "")
                if token:
                    yield token
                if obj.get("done"):
                    break
    except Exception:
        return


def call_ollama(prompt: str, system: str = None) -> str:
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "keep_alive": "15m",  # keep the model resident to avoid reload latency
        "options": {
            "temperature": 0.7,
            "num_predict": 400,  # bound the answer length for faster turnaround
            "top_p": 0.9,
        },
    }
    if system:
        payload["system"] = system

    try:
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=TIMEOUT,
        )
        if response.status_code == 200:
            return (response.json().get("response") or "").strip()
        return ""
    except requests.exceptions.ConnectionError:
        return ""
    except requests.exceptions.Timeout:
        return ""
    except Exception:
        return ""


def check_ollama_health() -> bool:
    try:
        r = requests.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=5)
        return r.status_code == 200
    except Exception:
        return False
