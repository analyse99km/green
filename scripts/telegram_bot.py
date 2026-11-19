import os
import sys
import time
import json
import urllib.request
import urllib.parse
import ssl

TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '9221705971:AAHXFhHlvTQySUcg60ljHJ3G8cEayCpZXWY')
GATEWAY_URL = 'https://pocomon9.github.io/green-status/'
BOT_USERNAME = 'NeonMetropolish_bot'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

_cached_live_url = None
_cached_url_time = 0

def get_live_game_url(ref_code=''):
    global _cached_live_url, _cached_url_time
    now = time.time()
    
    if not _cached_live_url or (now - _cached_url_time) > 60:
        candidates = [
            "https://meaning-gallery-establishment-volunteer.trycloudflare.com",
            "https://printable-therapy-servers-nerve.trycloudflare.com",
            GATEWAY_URL
        ]
        
        found = None
        for cand in candidates:
            if cand == GATEWAY_URL:
                found = GATEWAY_URL
                break
            try:
                req = urllib.request.Request(cand + "/api/health", headers={"User-Agent": "NeonBot/2.0"})
                with urllib.request.urlopen(req, context=ctx, timeout=1.5) as r:
                    if r.status == 200:
                        found = cand
                        break
            except Exception:
                continue
        
        _cached_live_url = found or GATEWAY_URL
        _cached_url_time = now

    base = _cached_live_url
    if ref_code:
        sep = '&' if '?' in base else '?'
        return f"{base}{sep}ref={urllib.parse.quote(str(ref_code))}"
    return base

def call_tg(method, data=None, timeout=30):
    url = f'https://api.telegram.org/bot{TOKEN}/{method}'
    headers = {'Content-Type': 'application/json'} if data else {}
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8') if data else None,
        headers=headers
    )
    with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get_main_keyboard(user_id=None, ref_code=''):
    game_url = get_live_game_url(ref_code or user_id)
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
            ],
            [
                {"text": "📖 How to Play", "callback_data": "menu_howtoplay"}
            ]
        ]
    }

def send_welcome(chat_id, user_first_name, user_id=None, ref_code=''):
    welcome_text = (
        "🌿 *Welcome to Neon Metropolis*\n\n"
        "A new digital world is growing.\n\n"
        "Explore the ecosystem, join the community, discover campaigns, and be part of our journey.\n\n"
        "🌱 _Your city. Your community. Your future._"
    )
    call_tg("sendMessage", {
        "chat_id": chat_id,
        "text": welcome_text,
        "parse_mode": "Markdown",
        "reply_markup": get_main_keyboard(user_id, ref_code)
    })

def send_airdrop_info(chat_id, user_id=None):
    text = (
        "🎁 *Neon Metropolis Airdrop & Participation Campaign*\n\n"
        "Earn *Metro Points (MP)* by participating in early ecosystem activities:\n\n"
        "• *Daily Check-in:* +10 MP every 24 hours\n"
        "• *Join Telegram Community:* +100 MP\n"
        "• *Announcement Channel:* +50 MP\n"
        "• *Verified Active Referral:* +50 MP per recruit\n"
        "• *Daily 3-Card Combo:* +5,000,000 In-Game Sparks\n\n"
        "⚠️ _Notice: Metro Points (MP) are internal participation points. Detailed terms for any future token distribution will be published prior to launch._"
    )
    keyboard = {
        "inline_keyboard": [
            [{"text": "🚀 Open Mini App & Check MP", "web_app": {"url": get_live_game_url(user_id)}}],
            [{"text": "📋 View Eligibility Criteria", "callback_data": "menu_criteria"}],
            [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
        ]
    }
    call_tg("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "Markdown", "reply_markup": keyboard})

def send_criteria_info(chat_id, user_id=None):
    text = (
        "📋 *Airdrop Eligibility Tiers & Security Rules*\n\n"
        "Participation is evaluated through 4 verified citizen tiers:\n\n"
        "1️⃣ *Explorer:* Basic registration & wallet identity\n"
        "2️⃣ *Citizen:* Completed introductory tasks & daily check-in\n"
        "3️⃣ *Contributor:* Active card upgrading & market trade\n"
        "4️⃣ *Ambassador:* Verified organic referrals & community builders\n\n"
        "🛡️ *Anti-Bot Controls:* Duplicate accounts, emulator scripts, and fake referral networks will be permanently disqualified."
    )
    keyboard = {
        "inline_keyboard": [
            [{"text": "🚀 Launch Game", "web_app": {"url": get_live_game_url(user_id)}}],
            [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
        ]
    }
    call_tg("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "Markdown", "reply_markup": keyboard})

def send_token_info(chat_id):
    text = (
        "🪙 *Neon Metropolis Token Information*\n\n"
        "• *Name:* Neon Metropolis\n"
        "• *Short Name:* NEO METROPOLIS\n"
        "• *Symbol:* 🌿 City Leaf & Core\n"
        "• *Slogan:* _The Future Is Growing_\n\n"
        "📊 *Token Strategy:* We prioritize community building, organic gameplay, and real user retention before finalizing on-chain tokenomics.\n\n"
        "Official contract addresses, total supply, and verified audit reports will be published exclusively through official channels."
    )
    keyboard = {
        "inline_keyboard": [
            [{"text": "🗺️ View Development Roadmap", "callback_data": "menu_roadmap"}],
            [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
        ]
    }
    call_tg("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "Markdown", "reply_markup": keyboard})

def send_leaderboard_info(chat_id, user_id=None):
    text = (
        "🏆 *Metropolis Citizen Leaderboard*\n\n"
        "Rankings are calculated dynamically based on:\n"
        "• ⚡ Total Sparks Minted\n"
        "• 🌱 Botanical Card Levels & Hourly Yield\n"
        "• 🪙 Underworld GREEN Coin Net Worth\n"
        "• 👥 Verified Squad Recruits\n\n"
        "Top citizens on the leaderboard qualify for exclusive ambassador tier benefits!"
    )
    keyboard = {
        "inline_keyboard": [
            [{"text": "🚀 View Full Rankings in App", "web_app": {"url": get_live_game_url(user_id)}}],
            [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
        ]
    }
    call_tg("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "Markdown", "reply_markup": keyboard})

def send_community_info(chat_id):
    text = (
        "👥 *Official Neon Metropolis Channels*\n\n"
        "Stay updated with announcements, patch notes, and community events:\n\n"
        "• *Announcement Channel:* @NeonMetropolisNews\n"
        "• *Official Discussion Group:* @NeonMetropolisChat\n"
        "• *Official Game Bot:* @NeonMetropolish_bot\n\n"
        "Never trust unofficial links or unverified administrators."
    )
    keyboard = {
        "inline_keyboard": [
            [{"text": "📢 Channel", "url": "https://t.me/NeonMetropolish_bot"}, {"text": "💬 Chat", "url": "https://t.me/NeonMetropolish_bot"}],
            [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
        ]
    }
    call_tg("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "Markdown", "reply_markup": keyboard})

def send_invite_info(chat_id, user_id):
    ref_id = str(user_id or "operative")
    ref_link = f"https://t.me/{BOT_USERNAME}?start=ref_{ref_id}"
    share_url = f"https://t.me/share/url?url={urllib.parse.quote(ref_link)}&text={urllib.parse.quote('Join me in Neon Metropolis! 🌿 Tap to mint GREEN coins, solve daily combos, and build your digital city.')}"
    
    text = (
        "🔗 *Your Personal Referral Link*\n\n"
        f"`{ref_link}`\n\n"
        "Share this link with your squad. When they join and play, both you and your friend earn bonus Metro Points and commission rewards!"
    )
    keyboard = {
        "inline_keyboard": [
            [{"text": "📲 Share to Telegram Friends", "url": share_url}],
            [{"text": "🚀 Launch App & View Squad", "web_app": {"url": get_live_game_url(ref_id)}}],
            [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
        ]
    }
    call_tg("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "Markdown", "reply_markup": keyboard})

def send_roadmap_info(chat_id):
    text = (
        "🗺️ *Neon Metropolis Development Roadmap*\n\n"
        "📍 *Phase 1 — Foundation & Identity* [COMPLETED]\n"
        "• Telegram Bot & 24/7 High-Availability Cluster\n"
        "• Bioluminescent Brand & Responsive Mini App\n\n"
        "📍 *Phase 2 — Economy & Core Features* [LIVE]\n"
        "• 7-District Botanical Cards & Hourly Yield\n"
        "• Daily 3-Card Combo (+5,000,000 Sparks)\n"
        "• Underworld Crime/Good Bazaar & Dream Market\n\n"
        "📍 *Phase 3 — Ecosystem Expansion* [IN PROGRESS]\n"
        "• Metro Points (MP) task verification\n"
        "• Guilds, syndicates, and team competitions\n\n"
        "📍 *Phase 4 — Tokenomics & Audits*\n"
        "• Smart contract security audits & disclosures\n"
        "• Token generation & fair distribution model"
    )
    keyboard = {
        "inline_keyboard": [
            [{"text": "🚀 Launch Game", "web_app": {"url": get_live_game_url()}}],
            [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
        ]
    }
    call_tg("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "Markdown", "reply_markup": keyboard})

def send_news_info(chat_id):
    text = (
        "📢 *Neon Metropolis — Latest Dispatches*\n\n"
        "⚡ *Update v0.2.2 Released:*\n"
        "• Instant Telegram Mini App fast-launch enabled\n"
        "• Crime & Good tactical weapons added to Bazaar\n"
        "• Editable Dream Market with direct vital restorations\n"
        "• 7 District botanical card categories now active\n\n"
        "Check back daily for new community events!"
    )
    keyboard = {
        "inline_keyboard": [
            [{"text": "🚀 Play Now", "web_app": {"url": get_live_game_url()}}],
            [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
        ]
    }
    call_tg("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "Markdown", "reply_markup": keyboard})

def send_how_to_play(chat_id, user_id=None):
    text = (
        "📖 *How to Play Neon Metropolis*\n\n"
        "1️⃣ *Tap for Sparks:* Tap the glowing chlorophyll core to harvest raw Dream Sparks (⚡).\n"
        "2️⃣ *Botanical Cards:* Buy and upgrade cards across 7 Sections to generate passive auto-income.\n"
        "3️⃣ *Daily 3-Card Combo:* Guess today's 3 secret cards to claim an instant *+5,000,000 Sparks* reward!\n"
        "4️⃣ *Underworld Bazaar:* Spend 🪙 GREEN Coins on weapons, vests, food, and medicine to power up your stats.\n"
        "5️⃣ *Dream Market:* Trade Sparks for Energy, Food Satiety, Nerve, and Happiness in the Dream Tap menu."
    )
    keyboard = {
        "inline_keyboard": [
            [{"text": "🚀 Launch Game Now", "web_app": {"url": get_live_game_url(user_id)}}],
            [{"text": "⬅️ Back to Menu", "callback_data": "menu_back"}]
        ]
    }
    call_tg("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "Markdown", "reply_markup": keyboard})

def configure_bot_profile():
    commands = [
        {'command': 'start', 'description': '🌿 Welcome & Launch Mini App'},
        {'command': 'app', 'description': '🚀 Open Neon Metropolis'},
        {'command': 'airdrop', 'description': '🎁 Airdrop & Metro Points'},
        {'command': 'criteria', 'description': '📋 Eligibility Rules & Anti-Bot'},
        {'command': 'points', 'description': '⚡ User Points & Balance'},
        {'command': 'referral', 'description': '🔗 Personal Referral Link'},
        {'command': 'leaderboard', 'description': '🏆 Top Citizen Rankings'},
        {'command': 'token', 'description': '🪙 Future Token Information'},
        {'command': 'roadmap', 'description': '🗺️ Development Timeline'},
        {'command': 'community', 'description': '👥 Official Social Channels'},
        {'command': 'help', 'description': '📖 Gameplay Field Guide'}
    ]
    try:
        call_tg('setMyCommands', {'commands': commands})
        call_tg('setMyShortDescription', {
            'short_description': '🌿 The Future Is Growing. Tap to earn Sparks, build botanical empires & mint GREEN tokens.'
        })
        call_tg('setMyDescription', {
            'description': (
                '🌿 Welcome to Neon Metropolis\n\n'
                'A new digital world is growing.\n'
                'Explore the ecosystem, join the community, discover campaigns, and be part of our journey.\n\n'
                '🌱 Your city. Your community. Your future.\n\n'
                'Tap the button below to launch the Mini App instantly!'
            )
        })
        call_tg('setChatMenuButton', {
            'menu_button': {
                'type': 'web_app',
                'text': 'Play Neon 🌿',
                'web_app': {'url': get_live_game_url()}
            }
        })
        print("✅ Telegram Bot profile and commands updated successfully.", flush=True)
    except Exception as e:
        print(f"⚠️ Profile config warning: {e}", flush=True)

def run_bot():
    print(f"🤖 Starting Neon Metropolis Telegram Bot (@{BOT_USERNAME})...", flush=True)
    configure_bot_profile()
    offset = 0

    while True:
        try:
            updates_res = call_tg("getUpdates", {"offset": offset, "timeout": 20}, timeout=30)
            if not updates_res.get("ok"):
                time.sleep(2)
                continue

            updates = updates_res.get("result", [])
            for upd in updates:
                offset = upd["update_id"] + 1

                if "callback_query" in upd:
                    cb = upd["callback_query"]
                    cb_data = cb.get("data", "")
                    chat_id = cb["message"]["chat"]["id"]
                    user_id = cb.get("from", {}).get("id")
                    call_tg("answerCallbackQuery", {"callback_query_id": cb["id"]})

                    if cb_data == "menu_airdrop":
                        send_airdrop_info(chat_id, user_id)
                    elif cb_data == "menu_criteria":
                        send_criteria_info(chat_id, user_id)
                    elif cb_data == "menu_token":
                        send_token_info(chat_id)
                    elif cb_data == "menu_leaderboard":
                        send_leaderboard_info(chat_id, user_id)
                    elif cb_data == "menu_community":
                        send_community_info(chat_id)
                    elif cb_data == "menu_invite":
                        send_invite_info(chat_id, user_id)
                    elif cb_data == "menu_roadmap":
                        send_roadmap_info(chat_id)
                    elif cb_data == "menu_news":
                        send_news_info(chat_id)
                    elif cb_data == "menu_howtoplay":
                        send_how_to_play(chat_id, user_id)
                    elif cb_data == "menu_back":
                        send_welcome(chat_id, cb.get("from", {}).get("first_name", ""), user_id)
                    continue

                if "message" not in upd:
                    continue

                msg = upd["message"]
                text = (msg.get("text") or "").strip()
                chat_id = msg["chat"]["id"]
                user_id = msg.get("from", {}).get("id")
                user_first = msg.get("from", {}).get("first_name", "")

                cmd = text.split()[0].lower() if text else ""

                if cmd == "/start":
                    parts = text.split(maxsplit=1)
                    ref_code = parts[1] if len(parts) > 1 else ""
                    send_welcome(chat_id, user_first, user_id, ref_code)
                elif cmd in ("/app", "/play"):
                    send_welcome(chat_id, user_first, user_id)
                elif cmd in ("/airdrop", "/points"):
                    send_airdrop_info(chat_id, user_id)
                elif cmd == "/criteria":
                    send_criteria_info(chat_id, user_id)
                elif cmd == "/token":
                    send_token_info(chat_id)
                elif cmd == "/leaderboard":
                    send_leaderboard_info(chat_id, user_id)
                elif cmd in ("/referral", "/invite"):
                    send_invite_info(chat_id, user_id)
                elif cmd == "/roadmap":
                    send_roadmap_info(chat_id)
                elif cmd == "/community":
                    send_community_info(chat_id)
                elif cmd in ("/help", "/guide"):
                    send_how_to_play(chat_id, user_id)
                elif text:
                    send_welcome(chat_id, user_first, user_id)

        except Exception as e:
            time.sleep(3)

if __name__ == '__main__':
    run_bot()
