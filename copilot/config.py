import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file if it exists
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DEFAULT_MODEL = os.getenv("GROQ_MODEL", "llama3-70b-8192")

# Instantiate the Groq client if key is available
# Note: Groq SDK will automatically look for GROQ_API_KEY in the environment,
# but we explicitly initialize here or raise a descriptive error if missing.
def get_groq_client() -> Groq:
    """Returns an initialized Groq client. Raises ValueError if API key is missing."""
    if not GROQ_API_KEY:
        raise ValueError(
            "GROQ_API_KEY is not set. Please ensure you have configured it in your .env file "
            "or set the GROQ_API_KEY environment variable."
        )
    return Groq(api_key=GROQ_API_KEY)
