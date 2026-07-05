import os
from dotenv import load_dotenv
load_dotenv()

# --- LLM: Groq ---
# NOTE: this line overrides .env — change the model HERE, not in .env
os.environ["LLM_PROVIDER"] = "custom"
os.environ["LLM_MODEL"] = "groq/llama-3.3-70b-versatile"  # higher TPM limit than 8b-instant

# --- Rate limiting (Phase 1a) ---
os.environ["LLM_RATE_LIMIT_ENABLED"] = "true"
os.environ["LLM_RATE_LIMIT_REQUESTS"] = "10"
os.environ["LLM_RATE_LIMIT_INTERVAL"] = "60"
os.environ["LLM_MAX_COMPLETION_TOKENS"] = "4096"

# --- Embeddings: Fastembed (100% local, no API key, no limits) ---
os.environ["EMBEDDING_PROVIDER"] = "fastembed"
os.environ["EMBEDDING_MODEL"] = "sentence-transformers/all-MiniLM-L6-v2"

import cognee
import asyncio
from cognee import SearchType

# --- Phase 1b: control resets with a flag, not automatic every run ---
RESET_GRAPH = False # set to False once your graph is built and you just want to test queries

athlete_entries = [
    # ---------- RAHUL (sprinter) ----------
    "Athlete Rahul strained his hamstring on March 3, 2026 during a sprint session. His coach recommended rest and light stretching for 2 weeks.",
    "Athlete Rahul's hamstring injury in March 2026 was his second leg injury this year — his first was a calf strain in January 2026.",
    "Athlete Rahul's coach is Anjali Verma, who specializes in sprint recovery programs.",
    "On March 20, 2026, Athlete Rahul resumed training but reported mild tightness in his left leg.",

    # ---------- PRIYA (distance runner) ----------
    "Athlete Priya reported soreness level 4 out of 5 in her right knee after a 10km training run on June 20, 2026.",
    "On June 22, 2026, Athlete Priya's readiness score was 3 out of 10, indicating high fatigue.",
    "Athlete Priya has a prior ACL injury from 2024 in her right knee.",
    "Because of Athlete Priya's current knee soreness and her prior right knee ACL injury from 2024, her coach Anjali Verma recommended 3 days of rest and no high-impact running.",

    # ---------- ARJUN (swimmer) ----------
    "Athlete Arjun set a personal best in the 200m freestyle on June 15, 2026, finishing in 1 minute 58 seconds.",
    "Athlete Arjun reported shoulder stiffness after his June 15, 2026 swim session, rated 3 out of 5 in severity.",
    "Athlete Arjun has a history of rotator cuff strain from a swimming injury in late 2025.",
    "Athlete Arjun's coach, Rakesh Iyer, recommended shoulder mobility exercises and reduced training volume for one week due to the stiffness and his prior rotator cuff history.",

    # ---------- KABIR (footballer) ----------
    "Athlete Kabir suffered a mild ankle sprain during a football match on June 28, 2026.",
    "Athlete Kabir's readiness score on June 29, 2026 dropped to 4 out of 10 due to the ankle sprain and poor sleep quality.",
    "Athlete Kabir has a history of two prior ankle sprains, in 2023 and 2024, both on the same right ankle.",
    "Athlete Kabir's coach, Anjali Verma, recommended a full week of rest and physiotherapy given his recurring right ankle injuries.",
]

# --- Phase 1c: retry-safe add, so one flaky entry doesn't kill the whole run ---
async def safe_add(entry, retries=3):
    for attempt in range(retries):
        try:
            await cognee.add(entry)
            return True
        except Exception as e:
            print(f"    retry {attempt+1}/{retries} failed: {e}")
            await asyncio.sleep(5 * (attempt + 1))
    print(f"    FAILED after {retries} attempts, skipping this entry")
    return False

async def main():
    if RESET_GRAPH:
        print("Clearing old graph (safe fresh start)...")
        await cognee.prune.prune_data()
        await cognee.prune.prune_system(metadata=True)

        print(f"\nAdding {len(athlete_entries)} entries to memory...")
        success_count = 0
        for i, entry in enumerate(athlete_entries, 1):
            ok = await safe_add(entry)
            if ok:
                success_count += 1
            print(f"  [{i}/{len(athlete_entries)}] {'added' if ok else 'SKIPPED'}")
        print(f"\n{success_count}/{len(athlete_entries)} entries added successfully.")

        print("\nBuilding knowledge graph... this may take 1-3 minutes on free tier")
        await cognee.cognify()
        print("Graph built.\n")
    else:
        print("Skipping ingestion + rebuild — querying existing graph...\n")

    questions = [
        "Which athletes currently have a recurring or repeat injury, and what body part is affected?",
        "Compare Rahul and Kabir's injury histories. What do they have in common?",
        "Which athletes are coached by Anjali Verma, and what does she recommend for each of them?",
        "List every reason Priya should avoid high-impact running right now.",
        "Which athlete has the most concerning injury pattern and why?",
    ]

    for q in questions:
        print(f"\n🔎 Question: {q}")
        result = await cognee.search(query_text=q, query_type=SearchType.GRAPH_COMPLETION)
        print(f"✅ Answer: {result[0]['search_result']}")

if __name__ == "__main__":
    asyncio.run(main())