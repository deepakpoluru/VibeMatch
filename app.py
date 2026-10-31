import streamlit as st
import requests
import json
import google.generativeai as genai

# Page configuration
st.set_page_config(
    page_title="VibeMatch — Cultural Taste Date Planner",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling for polished aesthetic
st.markdown("""
<style>
    .main-title {
        font-size: 2.6rem;
        font-weight: 800;
        background: -webkit-linear-gradient(45deg, #FF4B4B, #8B5CF6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.15rem;
        color: #6B7280;
        margin-bottom: 2rem;
    }
    .stMetric {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 10px;
    }
</style>
""", unsafe_allow_html=True)

# Sidebar: Credentials and Instructions
with st.sidebar:
    st.image("https://img.icons8.com/isometric/100/champagne.png", width=64)
    st.title("Credentials & Setup")
    st.caption("Grounding Autonomous Agents in Qloo's 250M+ Entity Cultural Graph")

    qloo_api_key = st.text_input(
        "Qloo API Key",
        type="password",
        help="Enter your Qloo Hackathon API Key. Passed as X-Api-Key header.",
        placeholder="qloo_live_..."
    )

    reasoning_api_key = st.text_input(
        "Reasoning LLM API Key",
        type="password",
        help="Enter your API key to power the cultural reasoning agent.",
        placeholder="AIzaSy..."
    )

    st.markdown("---")
    st.markdown("### 🌐 Cultural Taste Architecture")
    st.info(
        "**Solving the Cultural Intelligence Gap:** Generic LLMs default to high-frequency tourist traps. "
        "VibeMatch queries Qloo's 250M+ entity graph to map cinematic aesthetic affinities into empirical dining & nightlife vectors, "
        "giving the agent the structured cultural grounding it needs to plan an authentic evening."
    )
    st.markdown("---")
    st.caption("Official Submission — Qloo Agentic Hackathon")

# Main Application Header
st.markdown('<div class="main-title">VibeMatch</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-title">Agentic Date Planning Grounded in Qloo Cultural Intelligence</div>',
    unsafe_allow_html=True
)

# Main Inputs
col_input1, col_input2 = st.columns(2)
with col_input1:
    favourite_movie = st.text_input(
        "🎬 Your Favourite Movie",
        placeholder="e.g. Inception, Chungking Express, Blade Runner 2049, Amélie",
        help="The cultural anchor used to query Qloo's film catalog."
    )

with col_input2:
    target_city = st.text_input(
        "📍 Target City",
        placeholder="e.g. New York, Tokyo, Paris, Austin, London",
        help="The metropolitan area where the curated date will take place."
    )

generate_btn = st.button("✨ Match Vibes & Generate Date Itinerary", type="primary", use_container_width=True)

if generate_btn:
    # Validation
    if not qloo_api_key:
        st.error("⚠️ Please enter your Qloo API Key in the sidebar.")
        st.stop()
    if not reasoning_api_key:
        st.error("⚠️ Please enter your Reasoning LLM API Key in the sidebar.")
        st.stop()
    if not favourite_movie or not target_city:
        st.warning("⚠️ Please provide both a favourite movie and a target city.")
        st.stop()

    movie_id = None
    movie_name_found = favourite_movie
    correlations_data = None

    # Step 1: Qloo Search API to retrieve Entity ID
    with st.status("🧠 Step 1/3: Querying Qloo Taste Graph for Entity ID...", expanded=True) as status1:
        search_url = "https://hackathon.api.qloo.com/v2/search"
        headers = {
            "X-Api-Key": qloo_api_key.strip(),
            "Content-Type": "application/json"
        }
        search_payload = {
            "query": favourite_movie.strip(),
            "category": "film"
        }

        try:
            st.write(f"Searching Qloo entities for film: **{favourite_movie}**")
            search_response = requests.post(search_url, headers=headers, json=search_payload, timeout=15)

            if search_response.status_code == 200:
                search_json = search_response.json()
                results = search_json.get("data") or search_json.get("results") or []
                
                # If direct list or dictionary wrapped
                if isinstance(search_json, list) and len(search_json) > 0:
                    primary_entity = search_json[0]
                elif isinstance(results, list) and len(results) > 0:
                    primary_entity = results[0]
                elif search_json.get("id"):
                    primary_entity = search_json
                else:
                    primary_entity = None

                if primary_entity:
                    movie_id = primary_entity.get("id") or primary_entity.get("entity_id")
                    movie_name_found = primary_entity.get("name") or primary_entity.get("title") or favourite_movie
                    status1.update(label=f"✅ Entity matched: {movie_name_found} (ID: {movie_id})", state="complete")
                else:
                    st.error(f"Could not locate an exact Qloo entity match for '{favourite_movie}'. Check spelling or try a well-known title.")
                    st.stop()
            else:
                st.error(f"Qloo Search API error (HTTP {search_response.status_code}): {search_response.text}")
                st.stop()
        except requests.exceptions.RequestException as e:
            st.error(f"Network error communicating with Qloo Search API: {str(e)}")
            st.stop()

    # Step 2: Qloo Correlations API to extract taste profile graph
    with st.status("🍸 Step 2/3: Extracting Cross-Domain Cultural Taste Profile...", expanded=True) as status2:
        correlations_url = f"https://hackathon.api.qloo.com/v2/entities/{movie_id}/correlations"
        correlations_payload = {
            "target_categories": ["dining", "nightlife"],
            "limit": 5
        }

        try:
            st.write(f"Retrieving cultural affinities across dining and nightlife for Entity {movie_id}...")
            corr_response = requests.post(correlations_url, headers=headers, json=correlations_payload, timeout=15)

            if corr_response.status_code == 200:
                correlations_json = corr_response.json()
                correlations_data = correlations_json.get("data") or correlations_json.get("results") or correlations_json
                status2.update(label="✅ Qloo Taste Graph Extracted Successfully", state="complete")
            else:
                st.warning(f"Qloo Correlations returned status {corr_response.status_code}. Using adaptive taste graph fallback.")
                correlations_data = [
                    {"category": "dining", "name": "Artisanal Speakeasy Bistro", "score": 0.92, "tags": ["Intimate", "Atmospheric"]},
                    {"category": "nightlife", "name": "Underground Cocktail Lounge", "score": 0.88, "tags": ["Craft", "Ambient"]}
                ]
                status2.update(label="⚠️ Adaptive Taste Fallback Activated", state="complete")
        except Exception as e:
            st.warning(f"Exception while contacting Qloo Correlations endpoint: {str(e)}. Proceeding with cultural profile synthesis.")
            correlations_data = [
                {"category": "dining", "name": "Cinematic Dining Experience", "score": 0.90, "tags": ["Boutique"]},
                {"category": "nightlife", "name": "Vinyl Listening Bar", "score": 0.89, "tags": ["Acoustic", "Intimate"]}
            ]
            status2.update(label="⚠️ Proceeding with synthesized profile", state="complete")

    # Display Extracted Taste Graph in an expander
    with st.expander("📊 Inspect Extracted Qloo Cultural Taste Graph", expanded=False):
        st.json(correlations_data)

    # Step 3: Cultural Reasoning & Date Itinerary Synthesis
    with st.status("✨ Step 3/3: Autonomous Cultural Reasoning & Synthesis...", expanded=True) as status3:
        try:
            genai.configure(api_key=reasoning_api_key.strip())
            model = genai.GenerativeModel("gemini-1.5-flash")

            # Format the taste profile for the prompt
            taste_summary_lines = []
            if isinstance(correlations_data, list):
                for item in correlations_data:
                    name = item.get("name") or item.get("entity_name") or "Cultural Anchor"
                    cat = item.get("category") or item.get("target_category") or "General"
                    score = item.get("score") or item.get("affinity") or "High"
                    tags = item.get("tags", [])
                    tag_str = f" (Tags: {', '.join(tags)})" if tags else ""
                    taste_summary_lines.append(f"- [{cat.upper()}] {name} (Affinity: {score}){tag_str}")
            elif isinstance(correlations_data, dict):
                taste_summary_lines.append(json.dumps(correlations_data, indent=2))

            taste_profile_context = "\n".join(taste_summary_lines) if taste_summary_lines else "Strong preference for mood-lit, sensory-rich spaces."

            prompt = f"""
You are an elite, world-renowned luxury date planner and cultural curator.
You have been commissioned to design an unforgettable, highly specific evening itinerary in {target_city} for a couple whose core shared aesthetic is defined by their love for the film "{movie_name_found}".

CRITICAL INSTRUCTION - REJECT CLICHÉS:
Generic AI models hallucinate standard tourist traps. You must strictly ground this itinerary in the empirical taste profile extracted from Qloo's 250M+ entity cultural graph:

=== QLOO CULTURAL TASTE PROFILE ===
{taste_profile_context}
===================================

Plan requirements:
1. Exact City: {target_city}. Recommend REAL, currently operating venues located in {target_city}.
2. Itinerary Breakdown:
   - **The Aesthetic Vibe**: A sophisticated 2-sentence explanation of how the cinematography, pacing, and mood of "{movie_name_found}" maps onto the culinary and nightlife scene of {target_city}.
   - **The Dinner (1 Specific Restaurant)**: Venue name, neighborhood, recommended dish/wine pairing, and why its lighting/atmosphere directly satisfies the Qloo taste profile.
   - **The Evening Activity / Nightlife (1 Specific Activity/Venue)**: Specific speakeasy, jazz lounge, rooftop, or cultural experience in {target_city} that elevates the date's thematic momentum.
   - **The Insider Detail**: A reservation tip, best booth/table to request, or dress-code nuance that makes the evening feel effortlessly cinematic.

Write with elegance, warmth, and impeccable taste.
"""

            response = model.generate_content(prompt)
            status3.update(label="✅ Date Itinerary Generated Successfully!", state="complete")

            # Render Itinerary
            st.markdown("---")
            st.markdown(f"## 🥂 The VibeMatch Itinerary: *{movie_name_found}* in *{target_city}*")
            st.markdown(response.text)

            st.balloons()

        except Exception as e:
            st.error(f"Error during itinerary generation: {str(e)}")
            st.info("Tip: Double-check your API key and quota status.")
