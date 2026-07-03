import asyncio
from memory_api import query_memory


async def _test():
    test_questions = [
        "Which athletes have recurring injuries?",           # known good
        "What is the capital of France?",                    # no answer in data — should NOT crash
        "Compare all four athletes' injury risk levels.",    # multi-hop, harder
        "",                                                   # empty string edge case
    ]
    for q in test_questions:
        print(f"\n🔎 {q!r}")
        answer = await query_memory(q)
        print(f"✅ {answer}")


if __name__ == "__main__":
    asyncio.run(_test())