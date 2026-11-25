import os
import sys
import time
import json
import threading
import socket
import urllib.parse
import ssl
from pathlib import Path
import requests

# ── FORCE IPV4 RESOLUTION (Fixes 1-2 minute Windows IPv6 timeout hang) ─
_orig_getaddrinfo = socket.getaddrinfo
def _getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = _getaddrinfo_ipv4

tg_session = requests.Session()
adapter = requests.adapters.HTTPAdapter(pool_connections=20, pool_maxsize=20, max_retries=1)
tg_session.mount('https://', adapter)

# ── BOT TOKENS ─────────────────────────────────────────────────────
MAIN_BOT_TOKEN = '9221705971:AAHXFhHlvTQySUcg60ljHJ3G8cEayCpZXWY'   # @NeonMetropolish_bot (Player Bot)
ADMIN_BOT_TOKEN = '9285831784:AAFpEUR1Bktgzw2TEnFq5oyIhSLIiI2RHuA'  # @Logtst_bot (Admin Terminal)

BOT_USERNAME = 'NeonMetropolish_bot'
GATEWAY_URL = 'https://pocomon9.github.io/green-status/'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SUBSCRIBERS_FILE = os.path.join(BASE_DIR, 'subscribers.json')
CONFIG_FILE = os.path.join(BASE_DIR, 'bot_config.json')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# ── CONFIGURATION MANAGER ──────────────────────────────────────────
DEFAULT_CONFIG = {
    "community": {
        "channel_url": "",
        "chat_url": "",
        "is_active": False
    },
    "leaderboard": {
        "is_active": False
    },
    "messages": {
        "welcome": (
            "🌿 *Welcome to Neon Metropolis*\n\n"
            "A new digital world is growing.\n\n"
            "Explore the ecosystem, tap to mint GREEN coins, solve daily combos, and build your digital empire.\n\n"
            "🌱 *Your city. Your community. Your future.*"
        ),
        "airdrop": (
            "🎁 *Neon Metropolis Airdrop & Participation Points*\n\n"
            "The Neon Metropolis ecosystem rewards early community members and active citizens through "
            "*Metro Points*.\n\n"
            "⚡ *How to Maximize Your Share:*\n"
            "• Tap the central botanical plant daily to harvest Sparks\n"
            "• Solve the Daily 3-Card Combo for an instant +5,000,000 Sparks boost\n"
            "• Upgrade District Cards to maximize your Sparks/Hour passive yield\n"
            "• Invite friends and build your operative squad for 10% lifetime commissions\n\n"
            "💎 All accumulated in-game Sparks and GREEN coins convert towards future token distribution."
        ),
        "criteria": (
            "📋 *Airdrop Eligibility Tiers & Security Rules*\n\n"
            "Participation is evaluated through 4 verified citizen tiers:\n\n"
            "1️⃣ *Explorer:* Basic registration & wallet identity\n"
            "2️⃣ *Citizen:* Completed introductory tasks & daily check-in\n"
            "3️⃣ *Contributor:* Active card upgrading & market trade\n"
            "4️⃣ *Ambassador:* Verified organic referrals & community builders\n\n"
            "🛡️ *Anti-Bot Controls:* Duplicate accounts, emulator scripts, and fake referral networks will be permanently disqualified."
        ),
        "token": (
            "🪙 *Neon Metropolis Token Information*\n\n"
            "• *Name:* Neon Metropolis\n"
            "• *Short Name:* NEO METROPOLIS\n"
            "• *Symbol:* 🌿 City Leaf & Core\n"
            "• *Slogan:* The Future Is Growing\n\n"
            "📊 *Token Strategy:* We prioritize community building, organic gameplay, and real user retention before finalizing on-chain tokenomics.\n\n"
            "Official contract addresses, total supply, and verified audit reports will be published exclusively through official channels."
        ),
        "leaderboard_soon": (
            "🏆 *Metropolis Leaderboard — Season 1 Coming Soon*\n\n"
            "Citizen rankings and competitive dividend tiers are currently being calibrated for the upcoming *Season 1 Mainnet Launch*.\n\n"
            "⚡ *How to Prepare Your Starting Rank:*\n"
            "• Tap the Core Plant to stockpile millions of Sparks\n"
            "• Level up your 7 District Botanical Cards for higher passive yield\n"
            "• Solve the Daily 3-Card Combo (+5,000,000 Sparks daily)\n"
            "• Build your squad to earn recruiter bonuses\n\n"
            "Your total accumulated gameplay stats will lock in your starting rank the second the leaderboard goes live!"
        ),
        "community_soon": (
            "👥 *Official Community Channels — In Formation*\n\n"
            "The official Neon Metropolis community guild, discussion chat, and announcement networks are currently being organized.\n\n"
            "🌱 *What to Expect:*\n"
            "• Official verified announcement channel\n"
            "• Operative squad trading & discussion group\n"
            "• Exclusive community airdrop events & raid bounties\n\n"
            "Official links will be announced right here as soon as the channels go live! Stay tuned."
        ),
        "roadmap": (
            "🗺️ *Neon Metropolis Development Roadmap*\n\n"
            "📍 *Phase 1 — Foundation & Identity* [COMPLETED]\n"
            "• Telegram Bot & 24/7 High-Availability Cluster\n"
            "• Bioluminescent Brand & Responsive Mini App\n\n"
            "📍 *Phase 2 — Economy & Core Features* [LIVE]\n"
            "• 7-District Botanical Cards & Hourly Yield\n"
            "• Daily 3-Card Combo (+5,000,000 Sparks)\n"
            "• Underworld Bazaar & P2P Gossip Mesh\n\n"
            "📍 *Phase 3 — Ecosystem Expansion* [IN PROGRESS]\n"
            "• Community Hub & Verification Campaigns\n"
            "• Season 1 Leaderboard Activation\n\n"
            "📍 *Phase 4 — Token Generation Event (TGE)* [UPCOMING]\n"
            "• Token smart contract audit & deployment\n"
            "• Liquidity pool provisioning & community airdrop"
        ),
        "news": (
            "📢 *Neon Metropolis News & Announcements*\n\n"
            "🟢 *Latest Patch 2.2 Live:*\n"
            "• Instant Telegram SSO Auto-Login deployed\n"
            "• Session persistence: zero login screens across all restarts\n"
            "• Sub-second Mini App loading via High-Speed Gateway\n"
            "• Daily 3-Card Combo jackpot increased to 5,000,000 Sparks\n\n"
            "Keep harvesting Sparks and checking in daily!"
        ),
        "howtoplay": (
            "📖 *Neon Metropolis — Citizen Field Guide*\n\n"
            "1️⃣ *Tap to Harvest:* Tap the glowing Core Plant on your dashboard to generate Sparks.\n\n"
            "2️⃣ *Purchase Botanical Cards:* Use Sparks in the 7 District categories to build passive hourly income.\n\n"
            "3️⃣ *Daily Combo:* Select 3 matching secret cards daily to earn a huge +5M Sparks bounty.\n\n"
            "4️⃣ *Mint GREEN Tokens:* Convert excess sparks into liquid crypto coins in the Mint.\n\n"
            "5️⃣ *Bazaar & Gear:* Buy and sell weapons, armor, and rations in the decentralized underworld marketplace."
        )
    }
}

config_lock = threading.Lock()

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Deep merge defaults
                for k, v in DEFAULT_CONFIG.items():
                    if k not in data:
                        data[k] = v
                    elif isinstance(v, dict):
                        for sub_k, sub_v in v.items():
                            if sub_k not in data[k]:
                                data[k][sub_k] = sub_v
                return data
        except Exception as e:
            print(f"Config load error: {e}", flush=True)
    return json.loads(json.dumps(DEFAULT_CONFIG))

def save_config(cfg):
    try:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(cfg, f, indent=2)
    except Exception as e:
        print(f"Config save error: {e}", flush=True)

bot_config = load_config()

# ── SUBSCRIBER MANAGEMENT ──────────────────────────────────────────
sub_lock = threading.Lock()

def load_subscribers():
    subs = set()
    subs.add(2111223577)  # Dhruv
    if os.path.exists(SUBSCRIBERS_FILE):
        try:
            with open(SUBSCRIBERS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    for s in data:
                        subs.add(int(s))
        except Exception as e:
            print(f"Subscriber load error: {e}", flush=True)
    return subs

def save_subscribers(subs):
    try:
        with open(SUBSCRIBERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(list(subs), f)
    except Exception as e:
        print(f"Subscriber save error: {e}", flush=True)

active_subscribers = load_subscribers()

def add_subscriber(chat_id):
    try:
        cid = int(chat_id)
        with sub_lock:
            if cid not in active_subscribers:
                active_subscribers.add(cid)
                save_subscribers(active_subscribers)
    except Exception:
        pass

# ── TELEGRAM API PROTOCOL (Sub-100ms Persistent HTTP Pool) ─────────
def call_tg(token, method, data=None, timeout=10):
    url = f'https://api.telegram.org/bot{token}/{method}'
    try:
        if data is not None:
            resp = tg_session.post(url, json=data, timeout=timeout)
        else:
            resp = tg_session.get(url, timeout=timeout)
        return resp.json()
    except Exception as e:
        return {"ok": False, "description": str(e)}

def escape_md(text):
    if not text:
        return ""
    return text.replace('@NeonMetropolish_bot', '@NeonMetropolish\\_bot').replace('@Logtst_bot', '@Logtst\\_bot')

def safe_send_message(token, chat_id, text, reply_markup=None):
    clean_txt = escape_md(text)
    res = call_tg(token, "sendMessage", {
        "chat_id": chat_id,
        "text": clean_txt,
        "parse_mode": "Markdown",
        "reply_markup": reply_markup
    })
    if not res.get("ok"):
        res = call_tg(token, "sendMessage", {
            "chat_id": chat_id,
            "text": text,
            "reply_markup": reply_markup
        })
    return res

def safe_edit_message(token, chat_id, message_id, text, reply_markup=None):
    clean_txt = escape_md(text)
    res = call_tg(token, "editMessageText", {
        "chat_id": chat_id,
        "message_id": message_id,
        "text": clean_txt,
        "parse_mode": "Markdown",
        "reply_markup": reply_markup
    })
    if not res.get("ok"):
        res = call_tg(token, "editMessageText", {
            "chat_id": chat_id,
            "message_id": message_id,
            "text": text,
            "reply_markup": reply_markup
        })
        if not res.get("ok"):
            safe_send_message(token, chat_id, text, reply_markup)
    return res

_fastest_live_url = "https://kenneth-consequence-artistic-moisture.trycloudflare.com"

def background_url_watcher():
    global _fastest_live_url
    while True:
        try:
            candidates = []
            for feed in [
                'https://raw.githubusercontent.com/pocomon9/green/main/status.json',
                'https://raw.githubusercontent.com/sifihub/green/main/status.json',
                'https://raw.githubusercontent.com/analyse99km/green/main/status.json'
            ]:
                try:
                    req = urllib.request.Request(f"{feed}?t={int(time.time())}", headers={"User-Agent": "BotWatcher"})
                    with urllib.request.urlopen(req, context=ctx, timeout=2.0) as resp:
                        if resp.status == 200:
                            data = json.loads(resp.read().decode('utf-8'))
                            u = data.get('url', '')
                            if u and u.startswith('https://') and u not in candidates:
                                candidates.append(u)
                except Exception:
                    pass

            for cand in candidates:
                try:
                    req = urllib.request.Request(cand + "/api/health", headers={"User-Agent": "BotWatcher"})
                    with urllib.request.urlopen(req, context=ctx, timeout=1.2) as r:
                        if r.status == 200:
                            if _fastest_live_url != cand:
                                _fastest_live_url = cand
                                print(f"⚡ Live Runner Updated: {_fastest_live_url}", flush=True)
                                call_tg(MAIN_BOT_TOKEN, 'setChatMenuButton', {
                                    'menu_button': {
                                        'type': 'web_app',
                                        'text': 'Play Neon 🌿',
                                        'web_app': {'url': GATEWAY_URL}
                                    }
                                })
                            break
                except Exception:
                    continue
        except Exception:
            pass
        time.sleep(25)

def get_live_game_url(ref_code=''):
    base = GATEWAY_URL
    if ref_code:
        sep = '&' if '?' in base else '?'
        return f"{base}{sep}ref={urllib.parse.quote(str(ref_code))}"
    return base

# ── PLAYER BOT (@NeonMetropolish_bot) UI & HANDLERS ────────────────
def get_main_keyboard(user_id=None, ref_code=''):
    game_url = get_live_game_url(ref_code if ref_code else '')
    return {
        "inline_keyboard": [
            [
                {
                    "text": "🚀 OPEN MINI APP 🌿",
                    "web_app": {"url": game_url}
                }
            ],
            [
                {"text": "🎁 Airdrop", "callback_data": "menu_airdrop"},
                {"text": "📋 Criteria", "callback_data": "menu_criteria"}
            ],
            [
                {"text": "🪙 Token Info", "callback_data": "menu_token"},
                {"text": "🏆 Leaderboard", "callback_data": "menu_leaderboard"}
            ],
            [
                {"text": "👥 Community", "callback_data": "menu_community"},
                {"text": "🔗 Invite Friends", "callback_data": "menu_invite"}
            ],
            [
                {"text": "🗺️ Roadmap", "callback_data": "menu_roadmap"},
                {"text": "📢 News", "callback_data": "menu_news"}
            ]
        ]
    }

def get_player_content(action, user_first="Operative", user_id=None, ref_code=""):
    msgs = bot_config.get("messages", {})
    
    if action == "welcome":
        if ref_code:
            text = (
                f"🎉 *WELCOME TO NEON METROPOLIS, OPERATIVE!*\n\n"
                f"🤝 *You have been recruited via VIP Invite:* `{ref_code}`\n\n"
                f"🎁 *Your Recruit Welcome Benefits:*\n"
                f"• 🌿 *+100 Instant GREEN Tokens Starter Bounty*\n"
                f"• 🍞 *Syndicate Welcome Baguette (+30 Food, +10 Energy)*\n"
                f"• ⚡ *+50 GREEN Daily Allowance Active*\n"
                f"• 🪙 *Real GREEN Coin Mainnet Launching Soon!*\n\n"
                f"Tap below to enter the city and claim your starter kit:"
            )
        else:
            raw = msgs.get("welcome") or DEFAULT_CONFIG["messages"]["welcome"]
            text = raw.replace("{name}", user_first)
        return text, get_main_keyboard(user_id, ref_code), None

    elif action == "airdrop":
        text = msgs.get("airdrop") or DEFAULT_CONFIG["messages"]["airdrop"]
        kb = {
            "inline_keyboard": [
                [{"text": "🚀 Launch Game & Farm Sparks", "web_app": {"url": get_live_game_url(user_id)}}],
                [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
            ]
        }
        return text, kb, None

    elif action == "criteria":
        text = msgs.get("criteria") or DEFAULT_CONFIG["messages"]["criteria"]
        kb = {
            "inline_keyboard": [
                [{"text": "🚀 Launch Game", "web_app": {"url": get_live_game_url(user_id)}}],
                [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
            ]
        }
        return text, kb, None

    elif action == "token":
        text = msgs.get("token") or DEFAULT_CONFIG["messages"]["token"]
        kb = {
            "inline_keyboard": [
                [{"text": "🗺️ View Development Roadmap", "callback_data": "menu_roadmap"}],
                [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
            ]
        }
        return text, kb, None

    elif action == "leaderboard":
        lb_active = bot_config["leaderboard"].get("is_active", False)
        if lb_active:
            text = (
                "🏆 *Metropolis Leaderboard — Season 1 Live*\n\n"
                "Top citizen rankings are live and calculating dividends in real-time!\n"
                "Tap below to view the full leaderboard inside the Mini App."
            )
            kb = {
                "inline_keyboard": [
                    [{"text": "🚀 Open In-App Leaderboard", "web_app": {"url": get_live_game_url(user_id)}}],
                    [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
                ]
            }
            return text, kb, None
        else:
            text = msgs.get("leaderboard_soon") or DEFAULT_CONFIG["messages"]["leaderboard_soon"]
            kb = {
                "inline_keyboard": [
                    [{"text": "🚀 Play Mini App & Build Stats", "web_app": {"url": get_live_game_url(user_id)}}],
                    [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
                ]
            }
            return text, kb, "🏆 Season 1 Leaderboard unlocks at public launch!"

    elif action == "community":
        comm = bot_config["community"]
        ch_url = comm.get("channel_url", "")
        chat_url = comm.get("chat_url", "")
        if comm.get("is_active") and (ch_url or chat_url):
            text = (
                "👥 *Neon Metropolis Official Community Hub*\n\n"
                "Connect with verified operatives, stay informed on breaking announcements, and trade strategies in official guilds:"
            )
            comm_btns = []
            if ch_url:
                comm_btns.append({"text": "📢 Join Channel", "url": ch_url})
            if chat_url:
                comm_btns.append({"text": "💬 Discussion Chat", "url": chat_url})
            
            kb_rows = []
            if comm_btns:
                kb_rows.append(comm_btns)
            kb_rows.append([{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}])
            return text, {"inline_keyboard": kb_rows}, None
        else:
            text = msgs.get("community_soon") or DEFAULT_CONFIG["messages"]["community_soon"]
            kb = {
                "inline_keyboard": [
                    [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
                ]
            }
            return text, kb, "👥 Official Community channels are in formation!"

    elif action == "invite":
        ref_id = str(user_id or "operative")
        ref_link = f"https://t.me/{BOT_USERNAME}?start=NEON-TG-{ref_id}"
        viral_share_text = (
            "🌿 Join the Neon Metropolis Revolution! 🚀\n\n"
            "💰 PLAY & EARN: Real GREEN Token Currency Launching Soon!\n"
            "⚡ Tap the Core Plant, level up 7 District Botanical Cards, and build your digital empire.\n"
            "🎁 Use my VIP link for an INSTANT +100 GREEN Starter Bonus + 50 GREEN/Day Allowance:\n"
        )
        share_url = f"https://t.me/share/url?url={urllib.parse.quote(ref_link)}&text={urllib.parse.quote(viral_share_text)}"
        text = (
            "🚀 *Recruit Operatives & Earn Lifetime Dividends!*\n\n"
            "💰 *PLAY & EARN — Real GREEN Token Currency Launching Soon!*\n\n"
            f"🔗 *Your VIP Recruit Link:*\n`{ref_link}`\n\n"
            "🎁 *Recruiter Bounty & Squad Benefits:*\n"
            "• 🤝 Your recruit gets an *instant +100 GREEN bonus* + *50 GREEN/day allowance*\n"
            "• 🪙 You get *+100 GREEN instantly* for every recruit + *10% lifetime commissions* on their harvest\n"
            "• 🏆 Level up your Syndicate Network rank on the city leaderboard!\n\n"
            "Tap below to send this viral invite directly to your Telegram contacts:"
        )
        kb = {
            "inline_keyboard": [
                [{"text": "🚀 Share to Telegram Friends 📲", "url": share_url}],
                [{"text": "🏙️ Launch Mini App & View Squad", "web_app": {"url": get_live_game_url(f"NEON-TG-{ref_id}")}}],
                [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
            ]
        }
        return text, kb, None

    elif action == "roadmap":
        text = msgs.get("roadmap") or DEFAULT_CONFIG["messages"]["roadmap"]
        kb = {"inline_keyboard": [[{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]]}
        return text, kb, None

    elif action == "news":
        text = msgs.get("news") or DEFAULT_CONFIG["messages"]["news"]
        kb = {
            "inline_keyboard": [
                [{"text": "🚀 Open Mini App", "web_app": {"url": get_live_game_url(user_id)}}],
                [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
            ]
        }
        return text, kb, None

    elif action == "howtoplay":
        text = msgs.get("howtoplay") or DEFAULT_CONFIG["messages"]["howtoplay"]
        kb = {
            "inline_keyboard": [
                [{"text": "🚀 Launch Mini App & Start Playing", "web_app": {"url": get_live_game_url(user_id)}}],
                [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
            ]
        }
        return text, kb, None

    return get_player_content("welcome", user_first, user_id, ref_code)

def run_main_bot():
    print(f"🤖 Main Player Bot starting (@{BOT_USERNAME})...", flush=True)
    offset = 0
    while True:
        try:
            updates_res = call_tg(MAIN_BOT_TOKEN, "getUpdates", {"offset": offset, "timeout": 2}, timeout=10)
            if not updates_res.get("ok"):
                time.sleep(1)
                continue

            for upd in updates_res.get("result", []):
                offset = upd["update_id"] + 1

                # Callback Queries
                if "callback_query" in upd:
                    cb = upd["callback_query"]
                    cb_id = cb["id"]
                    cb_data = cb.get("data", "")
                    msg = cb.get("message", {})
                    chat_id = msg.get("chat", {}).get("id")
                    msg_id = msg.get("message_id")
                    from_user = cb.get("from", {})
                    user_id = from_user.get("id")
                    user_first = from_user.get("first_name", "Operative")

                    if chat_id:
                        add_subscriber(chat_id)

                    action = cb_data.replace("menu_", "")
                    text, kb, alert_toast = get_player_content(action, user_first, user_id)

                    ans_data = {"callback_query_id": cb_id}
                    if alert_toast:
                        ans_data["text"] = alert_toast
                        ans_data["show_alert"] = True
                    call_tg(MAIN_BOT_TOKEN, "answerCallbackQuery", ans_data)

                    if chat_id and msg_id:
                        safe_edit_message(MAIN_BOT_TOKEN, chat_id, msg_id, text, kb)
                    continue

                # Text Messages
                if "message" in upd:
                    msg = upd["message"]
                    chat_id = msg["chat"]["id"]
                    from_user = msg.get("from", {})
                    user_id = from_user.get("id")
                    user_first = from_user.get("first_name", "Operative")
                    text = (msg.get("text") or "").strip()

                    add_subscriber(chat_id)
                    cmd = text.split()[0].lower() if text else ""

                    if cmd == "/start":
                        parts = text.split(maxsplit=1)
                        ref_code = parts[1] if len(parts) > 1 else ""
                        msg_text, kb, _ = get_player_content("welcome", user_first, user_id, ref_code)
                    elif cmd in ("/app", "/play"):
                        msg_text, kb, _ = get_player_content("welcome", user_first, user_id)
                    elif cmd in ("/airdrop", "/points"):
                        msg_text, kb, _ = get_player_content("airdrop", user_first, user_id)
                    elif cmd == "/criteria":
                        msg_text, kb, _ = get_player_content("criteria", user_first, user_id)
                    elif cmd == "/token":
                        msg_text, kb, _ = get_player_content("token", user_first, user_id)
                    elif cmd == "/leaderboard":
                        msg_text, kb, _ = get_player_content("leaderboard", user_first, user_id)
                    elif cmd == "/community":
                        msg_text, kb, _ = get_player_content("community", user_first, user_id)
                    elif cmd in ("/referral", "/invite"):
                        msg_text, kb, _ = get_player_content("invite", user_first, user_id)
                    elif cmd == "/roadmap":
                        msg_text, kb, _ = get_player_content("roadmap", user_first, user_id)
                    elif cmd == "/news":
                        msg_text, kb, _ = get_player_content("news", user_first, user_id)
                    elif cmd in ("/help", "/guide"):
                        msg_text, kb, _ = get_player_content("howtoplay", user_first, user_id)
                    else:
                        msg_text, kb, _ = get_player_content("welcome", user_first, user_id)

                    safe_send_message(MAIN_BOT_TOKEN, chat_id, msg_text, kb)

        except Exception as e:
            time.sleep(1)

# ── ADMIN CONTROL TERMINAL (@Logtst_bot) ───────────────────────────
admin_sessions = {}

def get_admin_dashboard_content():
    comm = bot_config["community"]
    comm_status = "🟢 Active" if (comm.get("is_active") and (comm.get("channel_url") or comm.get("chat_url"))) else "🟡 In Formation (Coming Soon)"
    lb_status = "🟢 Live Rankings" if bot_config["leaderboard"].get("is_active") else "🟡 Coming Soon Notice"
    subs_count = len(active_subscribers)

    text = (
        "👑 *NEON METROPOLIS ADMIN CONTROL PANEL*\n\n"
        f"• 👥 *Registered Player Audience:* {subs_count} operative(s)\n"
        f"• 🌐 *Community Status:* {comm_status}\n"
        f"• 🏆 *Leaderboard Status:* {lb_status}\n\n"
        "Select an administrative management tool below:"
    )

    kb = {
        "inline_keyboard": [
            [{"text": "📢 New Announcement (Send to All)", "callback_data": "adm_broadcast_start"}],
            [{"text": "🎁 Referral Rewards & Royalties", "callback_data": "adm_referrals_menu"}],
            [
                {"text": "🔗 Community Links", "callback_data": "adm_community_menu"},
                {"text": "🏆 Toggle Leaderboard", "callback_data": "adm_leaderboard_toggle"}
            ],
            [{"text": "✏️ Edit Button Messages", "callback_data": "adm_messages_menu"}],
            [{"text": "📊 Audience & System Stats", "callback_data": "adm_stats"}]
        ]
    }
    return text, kb

def get_admin_referrals_menu():
    catalog_path = Path(BASE_DIR) / "data" / "catalog.json"
    if not catalog_path.exists():
        catalog_path = Path("C:/Users/HP/Documents/green/data/catalog.json")
    rewards = {}
    if catalog_path.exists():
        try:
            with open(catalog_path, "r", encoding="utf-8") as f:
                cat = json.load(f)
                rewards = cat.get("referralRewards") or {}
        except Exception:
            pass

    bounty = rewards.get("recruiterInstantBounty", 100)
    bonus = rewards.get("recruitWelcomeBonus", 100)
    stipend = rewards.get("dailyRecruitStipend", 50)
    tiers = rewards.get("tiers") or [
        {"tier": 1, "percent": 10},
        {"tier": 2, "percent": 4},
        {"tier": 3, "percent": 2},
        {"tier": 4, "percent": 1},
        {"tier": 5, "percent": 0.5},
    ]

    text = (
        "🎁 *SYNDICATE REFERRAL REWARDS & ROYALTIES*\n\n"
        f"• 💰 *Recruiter Instant Bounty:* `+{bounty} GREEN`\n"
        f"• 🎁 *Recruit Welcome Bonus:* `+{bonus} GREEN`\n"
        f"• 📅 *Daily Recruit Stipend:* `+{stipend} GREEN/day`\n\n"
        "👑 *5-Tier Generational Royalties:*\n"
    )
    for t in tiers:
        text += f"  • Tier {t.get('tier')}: *{t.get('percent')}%* royalty\n"

    text += (
        "\n🏆 *Milestone Ladders:*\n"
        "  • 3 Recruits: +500 GREEN\n"
        "  • 5 Recruits: +1,200 GREEN\n"
        "  • 10 Recruits: +3,000 GREEN\n"
        "  • 25 Recruits: +10,000 GREEN\n"
        "  • 50 Recruits: +25,000 GREEN\n"
        "  • 100 Recruits: +60,000 GREEN\n\n"
        "💡 _To adjust bounties or view the full recruit tree, open the Web Admin Console at http://localhost:3333._"
    )

    kb = {
        "inline_keyboard": [
            [{"text": "🔄 Refresh Rewards Status", "callback_data": "adm_referrals_menu"}],
            [{"text": "⬅️ Back to Admin Menu", "callback_data": "adm_main_menu"}]
        ]
    }
    return text, kb

def get_admin_community_menu():
    comm = bot_config["community"]
    ch = comm.get("channel_url") or "Not configured"
    chat = comm.get("chat_url") or "Not configured"
    active_str = "🟢 Active (Buttons Visible to Players)" if comm.get("is_active") else "🟡 Disabled (Shows 'In Formation')"

    text = (
        "🔗 *Community Links Configuration*\n\n"
        f"• *Status:* {active_str}\n"
        f"• *Announcement Channel:* `{ch}`\n"
        f"• *Discussion Group:* `{chat}`\n\n"
        "Configure links below. When active, players tapping Community on @NeonMetropolish_bot will see one-click join buttons."
    )
    kb = {
        "inline_keyboard": [
            [{"text": "📢 Set Channel Link", "callback_data": "adm_set_channel"}, {"text": "💬 Set Group Chat Link", "callback_data": "adm_set_chat"}],
            [{"text": "🔄 Toggle Active / In Formation", "callback_data": "adm_comm_toggle_active"}],
            [{"text": "🗑️ Clear Community Links", "callback_data": "adm_comm_clear"}],
            [{"text": "⬅️ Back to Main Panel", "callback_data": "adm_main_menu"}]
        ]
    }
    return text, kb

def get_admin_messages_menu():
    text = (
        "✏️ *Button Message Editor*\n\n"
        "Choose a section below to view and edit its live text on @NeonMetropolish_bot:"
    )
    kb = {
        "inline_keyboard": [
            [{"text": "🌿 Welcome (/start)", "callback_data": "adm_edit_msg_welcome"}, {"text": "🎁 Airdrop", "callback_data": "adm_edit_msg_airdrop"}],
            [{"text": "📋 Criteria", "callback_data": "adm_edit_msg_criteria"}, {"text": "🪙 Token Info", "callback_data": "adm_edit_msg_token"}],
            [{"text": "🗺️ Roadmap", "callback_data": "adm_edit_msg_roadmap"}, {"text": "📢 News", "callback_data": "adm_edit_msg_news"}],
            [{"text": "📖 Field Guide (How to Play)", "callback_data": "adm_edit_msg_howtoplay"}],
            [{"text": "⬅️ Back to Main Panel", "callback_data": "adm_main_menu"}]
        ]
    }
    return text, kb

def run_admin_relay_bot():
    print("📢 Admin Control Terminal starting (@Logtst_bot)...", flush=True)
    offset = 0

    while True:
        try:
            updates_res = call_tg(ADMIN_BOT_TOKEN, "getUpdates", {"offset": offset, "timeout": 2}, timeout=10)
            if not updates_res.get("ok"):
                time.sleep(1)
                continue

            for upd in updates_res.get("result", []):
                offset = upd["update_id"] + 1

                # ── HANDLE ADMIN CALLBACKS ──
                if "callback_query" in upd:
                    cb = upd["callback_query"]
                    cb_id = cb["id"]
                    cb_data = cb.get("data", "")
                    msg = cb.get("message", {})
                    chat_id = msg.get("chat", {}).get("id")
                    msg_id = msg.get("message_id")

                    call_tg(ADMIN_BOT_TOKEN, "answerCallbackQuery", {"callback_query_id": cb_id})

                    if cb_data == "adm_main_menu":
                        admin_sessions[chat_id] = {"state": "IDLE"}
                        text, kb = get_admin_dashboard_content()
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    elif cb_data == "adm_broadcast_start":
                        admin_sessions[chat_id] = {"state": "AWAITING_ANNOUNCEMENT_CONTENT"}
                        text = (
                            "📢 *Create Announcement for All Operatives*\n\n"
                            "Please type or forward your announcement message now.\n"
                            "• Supports formatting (*bold*, _italic_, links)\n"
                            "• Supports photos with captions\n\n"
                            "⚠️ *Notice:* You will see a full confirmation preview before anything is sent. "
                            "Type `/cancel` anytime to return to the menu."
                        )
                        kb = {"inline_keyboard": [[{"text": "❌ Cancel", "callback_data": "adm_main_menu"}]]}
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    elif cb_data == "adm_broadcast_confirm":
                        session = admin_sessions.get(chat_id, {})
                        draft = session.get("draft")
                        if not draft:
                            safe_send_message(ADMIN_BOT_TOKEN, chat_id, "⚠️ No draft found. Please create a new announcement.")
                            text, kb = get_admin_dashboard_content()
                            safe_send_message(ADMIN_BOT_TOKEN, chat_id, text, kb)
                            continue

                        # Frozen snapshot of CURRENT active subscribers at this exact moment
                        targets = list(active_subscribers)
                        safe_send_message(
                            ADMIN_BOT_TOKEN,
                            chat_id,
                            f"📡 *Broadcasting to {len(targets)} current players via @NeonMetropolish_bot...*"
                        )

                        launch_btn = {
                            "inline_keyboard": [
                                [{"text": "🚀 OPEN MINI APP 🌿", "web_app": {"url": GATEWAY_URL}}]
                            ]
                        }

                        success_count = 0
                        fail_count = 0
                        start_time = time.time()

                        for target_id in targets:
                            try:
                                if draft.get("photo_id"):
                                    res = call_tg(MAIN_BOT_TOKEN, "sendPhoto", {
                                        "chat_id": target_id,
                                        "photo": draft["photo_id"],
                                        "caption": escape_md(draft.get("caption", "")),
                                        "parse_mode": "Markdown" if draft.get("caption") else None,
                                        "reply_markup": launch_btn
                                    })
                                    if not res.get("ok"):
                                        res = call_tg(MAIN_BOT_TOKEN, "sendPhoto", {
                                            "chat_id": target_id,
                                            "photo": draft["photo_id"],
                                            "caption": draft.get("caption", ""),
                                            "reply_markup": launch_btn
                                        })
                                else:
                                    res = safe_send_message(MAIN_BOT_TOKEN, target_id, draft["text"], launch_btn)

                                if res.get("ok"):
                                    success_count += 1
                                else:
                                    fail_count += 1
                            except Exception:
                                fail_count += 1
                            time.sleep(0.04)

                        elapsed = round(time.time() - start_time, 2)
                        report = (
                            "✅ *Announcement Dispatched Successfully!*\n\n"
                            f"• *Recipients Reached:* {success_count} operative(s)\n"
                            f"• *Failed/Blocked:* {fail_count}\n"
                            f"• *Time Elapsed:* {elapsed}s\n\n"
                            "🔒 *Point-in-Time Delivery:* Only users active up to this moment received this message. "
                            "Players joining after this moment will not see it."
                        )
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, report)
                        admin_sessions[chat_id] = {"state": "IDLE"}
                        text, kb = get_admin_dashboard_content()
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, text, kb)

                    elif cb_data == "adm_community_menu":
                        text, kb = get_admin_community_menu()
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    elif cb_data == "adm_set_channel":
                        admin_sessions[chat_id] = {"state": "AWAITING_COMMUNITY_CHANNEL"}
                        text = (
                            "📢 *Set Announcement Channel Link*\n\n"
                            "Please enter the link or username for your official Telegram channel.\n"
                            "Example: `https://t.me/NeonMetropolisNews` or `@NeonMetropolisNews`\n\n"
                            "Type `/cancel` to abort."
                        )
                        kb = {"inline_keyboard": [[{"text": "❌ Cancel", "callback_data": "adm_community_menu"}]]}
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    elif cb_data == "adm_set_chat":
                        admin_sessions[chat_id] = {"state": "AWAITING_COMMUNITY_CHAT"}
                        text = (
                            "💬 *Set Discussion Group Chat Link*\n\n"
                            "Please enter the link or username for your official Telegram chat group.\n"
                            "Example: `https://t.me/NeonMetropolisChat` or `@NeonMetropolisChat`\n\n"
                            "Type `/cancel` to abort."
                        )
                        kb = {"inline_keyboard": [[{"text": "❌ Cancel", "callback_data": "adm_community_menu"}]]}
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    elif cb_data == "adm_comm_toggle_active":
                        with config_lock:
                            bot_config["community"]["is_active"] = not bot_config["community"].get("is_active", False)
                            save_config(bot_config)
                        text, kb = get_admin_community_menu()
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    elif cb_data == "adm_comm_clear":
                        with config_lock:
                            bot_config["community"]["channel_url"] = ""
                            bot_config["community"]["chat_url"] = ""
                            bot_config["community"]["is_active"] = False
                            save_config(bot_config)
                        text, kb = get_admin_community_menu()
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    elif cb_data == "adm_leaderboard_toggle":
                        with config_lock:
                            bot_config["leaderboard"]["is_active"] = not bot_config["leaderboard"].get("is_active", False)
                            save_config(bot_config)
                        text, kb = get_admin_dashboard_content()
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    elif cb_data == "adm_messages_menu":
                        text, kb = get_admin_messages_menu()
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    elif cb_data.startswith("adm_edit_msg_"):
                        key = cb_data.replace("adm_edit_msg_", "")
                        admin_sessions[chat_id] = {"state": f"AWAITING_MSG_TEXT:{key}"}
                        current_txt = bot_config.get("messages", {}).get(key) or DEFAULT_CONFIG["messages"].get(key, "")
                        text = (
                            f"✏️ *Editing Button Message: {key.upper()}*\n\n"
                            f"📄 *Current Text:*\n```\n{current_txt}\n```\n\n"
                            "📝 *Send your new replacement message below.*\n"
                            "Type `/cancel` to keep current text."
                        )
                        kb = {
                            "inline_keyboard": [
                                [{"text": "🔄 Reset to Factory Default", "callback_data": f"adm_reset_msg_{key}"}],
                                [{"text": "❌ Cancel", "callback_data": "adm_messages_menu"}]
                            ]
                        }
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    elif cb_data.startswith("adm_reset_msg_"):
                        key = cb_data.replace("adm_reset_msg_", "")
                        with config_lock:
                            bot_config["messages"][key] = DEFAULT_CONFIG["messages"].get(key, "")
                            save_config(bot_config)
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, f"✅ Reset `{key}` to original factory default!")
                        text, kb = get_admin_messages_menu()
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, text, kb)

                    elif cb_data == "adm_referrals_menu":
                        text, kb = get_admin_referrals_menu()
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    elif cb_data == "adm_stats":
                        subs = list(active_subscribers)
                        comm = bot_config["community"]
                        text = (
                            "📊 *Neon Metropolis Live System & Audience Stats*\n\n"
                            f"• *Registered Subscribers:* {len(subs)} players\n"
                            f"• *High-Speed Gateway:* {GATEWAY_URL}\n"
                            f"• *Main Bot:* @{BOT_USERNAME}\n"
                            f"• *Community Channel:* {comm.get('channel_url') or 'Not Set'}\n"
                            f"• *Community Chat:* {comm.get('chat_url') or 'Not Set'}\n"
                            f"• *Leaderboard Status:* {'🟢 Active' if bot_config['leaderboard'].get('is_active') else '🟡 Coming Soon'}"
                        )
                        kb = {"inline_keyboard": [[{"text": "⬅️ Back", "callback_data": "adm_main_menu"}]]}
                        safe_edit_message(ADMIN_BOT_TOKEN, chat_id, msg_id, text, kb)

                    continue

                # ── HANDLE ADMIN TEXT / MEDIA MESSAGES ──
                if "message" in upd:
                    msg = upd["message"]
                    chat_id = msg["chat"]["id"]
                    msg_text = (msg.get("text") or "").strip()
                    caption = msg.get("caption") or ""
                    photo = msg.get("photo")

                    session = admin_sessions.get(chat_id, {"state": "IDLE"})
                    state = session.get("state", "IDLE")

                    # Cancel command
                    if msg_text == "/cancel":
                        admin_sessions[chat_id] = {"state": "IDLE"}
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, "❌ Action aborted. Returning to Admin Control Panel.")
                        text, kb = get_admin_dashboard_content()
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, text, kb)
                        continue

                    # /start or /help on admin bot
                    if msg_text in ("/start", "/help", "/panel", "/admin"):
                        admin_sessions[chat_id] = {"state": "IDLE"}
                        text, kb = get_admin_dashboard_content()
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, text, kb)
                        continue

                    # 1. Handling Announcement Draft
                    if state == "AWAITING_ANNOUNCEMENT_CONTENT":
                        if photo:
                            file_id = photo[-1]["file_id"]
                            session["draft"] = {
                                "photo_id": file_id,
                                "caption": caption
                            }
                        else:
                            if not msg_text:
                                safe_send_message(ADMIN_BOT_TOKEN, chat_id, "⚠️ Please send non-empty text or an image.")
                                continue
                            session["draft"] = {
                                "photo_id": None,
                                "text": msg_text
                            }

                        session["state"] = "AWAITING_ANNOUNCEMENT_CONFIRM"
                        admin_sessions[chat_id] = session

                        targets_count = len(active_subscribers)
                        preview_txt = (
                            "🔍 *BROADCAST PREVIEW*\n"
                            "━━━━━━━━━━━━━━━━━━━━━\n"
                            f"{caption if photo else msg_text}\n"
                            "━━━━━━━━━━━━━━━━━━━━━\n\n"
                            f"👥 *Target Audience:* {targets_count} operative(s)\n"
                            "⚠️ *Point-in-Time Policy:* This announcement will ONLY be delivered to the current players above. "
                            "Any user who joins or taps /start after this announcement will NOT receive it.\n\n"
                            "Ready to broadcast?"
                        )
                        kb = {
                            "inline_keyboard": [
                                [{"text": "🚀 Confirm & Send to All", "callback_data": "adm_broadcast_confirm"}],
                                [{"text": "✏️ Re-draft", "callback_data": "adm_broadcast_start"}, {"text": "❌ Cancel", "callback_data": "adm_main_menu"}]
                            ]
                        }

                        if photo:
                            call_tg(ADMIN_BOT_TOKEN, "sendPhoto", {
                                "chat_id": chat_id,
                                "photo": session["draft"]["photo_id"],
                                "caption": escape_md(preview_txt),
                                "parse_mode": "Markdown",
                                "reply_markup": kb
                            })
                        else:
                            safe_send_message(ADMIN_BOT_TOKEN, chat_id, preview_txt, kb)
                        continue

                    # 2. Handling Community Channel Input
                    elif state == "AWAITING_COMMUNITY_CHANNEL":
                        val = msg_text.strip()
                        if val.startswith("@"):
                            val = f"https://t.me/{val[1:]}"
                        elif not val.startswith("http"):
                            val = f"https://t.me/{val}"

                        with config_lock:
                            bot_config["community"]["channel_url"] = val
                            bot_config["community"]["is_active"] = True
                            save_config(bot_config)

                        admin_sessions[chat_id] = {"state": "IDLE"}
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, f"✅ Channel Link saved: `{val}`\nCommunity buttons are now active!")
                        text, kb = get_admin_community_menu()
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, text, kb)
                        continue

                    # 3. Handling Community Chat Input
                    elif state == "AWAITING_COMMUNITY_CHAT":
                        val = msg_text.strip()
                        if val.startswith("@"):
                            val = f"https://t.me/{val[1:]}"
                        elif not val.startswith("http"):
                            val = f"https://t.me/{val}"

                        with config_lock:
                            bot_config["community"]["chat_url"] = val
                            bot_config["community"]["is_active"] = True
                            save_config(bot_config)

                        admin_sessions[chat_id] = {"state": "IDLE"}
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, f"✅ Discussion Group Link saved: `{val}`\nCommunity buttons are now active!")
                        text, kb = get_admin_community_menu()
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, text, kb)
                        continue

                    # 4. Handling Message Text Editing
                    elif state.startswith("AWAITING_MSG_TEXT:"):
                        key = state.split(":", 1)[1]
                        if not msg_text:
                            safe_send_message(ADMIN_BOT_TOKEN, chat_id, "⚠️ Text cannot be empty. Type `/cancel` to abort.")
                            continue

                        with config_lock:
                            bot_config["messages"][key] = msg_text
                            save_config(bot_config)

                        admin_sessions[chat_id] = {"state": "IDLE"}
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, f"✅ Successfully updated *{key.upper()}* message!\nPlayers on @NeonMetropolish_bot will now see your new content immediately.")
                        text, kb = get_admin_messages_menu()
                        safe_send_message(ADMIN_BOT_TOKEN, chat_id, text, kb)
                        continue

                    # Default fallback on admin bot: show dashboard
                    text, kb = get_admin_dashboard_content()
                    safe_send_message(ADMIN_BOT_TOKEN, chat_id, text, kb)

        except Exception as e:
            time.sleep(1)

# ── MAIN ENTRY POINT ───────────────────────────────────────────────
if __name__ == '__main__':
    print("=" * 60)
    print("🌿 NEON METROPOLIS DUAL-BOT CONTROLLER STARTING...")
    print(f"• Main Player Bot: @{BOT_USERNAME}")
    print(f"• Admin Terminal: @Logtst_bot")
    print(f"• Fast Gateway: {GATEWAY_URL}")
    print(f"• Registered Subscribers: {len(active_subscribers)}")
    print("=" * 60, flush=True)

    # Start URL Watcher in background
    watcher_thread = threading.Thread(target=background_url_watcher, daemon=True)
    watcher_thread.start()

    # Start Main Bot in separate daemon thread
    main_thread = threading.Thread(target=run_main_bot, daemon=True)
    main_thread.start()

    # Start Admin Control Bot in separate daemon thread
    admin_thread = threading.Thread(target=run_admin_relay_bot, daemon=True)
    admin_thread.start()

    while True:
        time.sleep(1)
