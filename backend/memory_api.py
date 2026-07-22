import os
from dotenv import load_dotenv
load_dotenv()

os.environ["LLM_PROVIDER"] = "custom"
os.environ["LLM_MODEL"] = "groq/llama-3.3-70b-versatile"

os.environ["LLM_RATE_LIMIT_ENABLED"] = "true"
os.environ["LLM_RATE_LIMIT_REQUESTS"] = "10"
os.environ["LLM_RATE_LIMIT_INTERVAL"] = "60"
os.environ["LLM_MAX_COMPLETION_TOKENS"] = "4096"

os.environ["EMBEDDING_PROVIDER"] = "fastembed"
os.environ["EMBEDDING_MODEL"] = "sentence-transformers/all-MiniLM-L6-v2"

import cognee
import asyncio
from cognee import SearchType


async def safe_add(entry: str, retries: int = 3) -> bool:
    for attempt in range(retries):
        try:
            await cognee.add(entry)
            return True
        except Exception as e:
            print(f"    retry {attempt+1}/{retries} failed: {e}")
            await asyncio.sleep(5 * (attempt + 1))
    print(f"    FAILED after {retries} attempts, skipping this entry")
    return False


async def add_athlete_data(entry: str) -> bool:
    return await safe_add(entry)


async def add_athlete_data_batch(entries: list[str]) -> dict:
    succeeded = 0
    for i, entry in enumerate(entries, 1):
        ok = await add_athlete_data(entry)
        if ok:
            succeeded += 1
        print(f"  [{i}/{len(entries)}] {'added' if ok else 'SKIPPED'}")
    return {"total": len(entries), "succeeded": succeeded, "failed": len(entries) - succeeded}


async def build_graph():
    await cognee.cognify()


async def query_memory(question: str) -> str:
    try:
        result = await cognee.search(query_text=question, query_type=SearchType.GRAPH_COMPLETION)
        if result and len(result) > 0:
            return result[0]["search_result"]
        return "No answer found in the knowledge graph."
    except Exception as e:
        return f"Error retrieving answer: {e}"


async def chat_with_memory(question: str, session_id: str) -> str:
    try:
        result = await cognee.search(
            query_text=question,
            query_type=SearchType.GRAPH_COMPLETION,
            session_id=session_id,
        )
        if result and len(result) > 0:
            return result[0]["search_result"]
        return "No answer found in the knowledge graph."
    except Exception as e:
        return f"Error retrieving answer: {e}"


async def reset_memory():
    await cognee.prune.prune_data()
    await cognee.prune.prune_system(metadata=True)


if __name__ == "__main__":
    async def _test():
        print("Testing query_memory() against existing graph...")
        answer = await query_memory("Which athletes have recurring injuries?")
        print(f"Answer: {answer}")

    asyncio.run(_test())