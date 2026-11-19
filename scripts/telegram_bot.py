import os
import sys
import time
import json
import urllib.request
import urllib.parse
import ssl

TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '9221705971:AAHXFhHlvTQySUcg60ljHJ3G8cEayCpZXWY')
EVERGREEN_URL = 'https://pocomon9.github.io/green-status/'
BOT_USERNAME = 'NeonMetropolish_bot'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

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

def send_welcome(chat_id, user_first_name, ref_code=''):
    game_url = f'{EVERGREEN_URL}?ref={urllib.parse.quote(ref_code)}' if ref_code else EVERGREEN_URL
    share_url = f'https://t.me/share/url?url=https://t.me/{BOT_USERNAME}?start={urllib.parse.quote(ref_code or "agent")}&text=Join%20me%20in%20Neon%20Metropolis!%20Tap%20to%20mint%20GREEN%20coins%20and%20win%20daily%20combos%20🌿'

    msg_text = (
        f"🌿 *Welcome to Neon Metropolis, {user_first_name or 'Operative'}!*\n\n"
        "Enter a persistent bioluminescent green empire where you tap for dream energy, build botanical networks, and dominate the underworld economy.\n\n"
        "⚡ *Sparks Engine:* Tap the core plant & unlock passive hourly growth\n"
        "🌱 *Botanical Cards:* 7 District sectors of cards & synergies\n"
        "🃏 *Daily 3-Card Combo:* Crack the daily code for *+5,000,000 Sparks*\n"
        "🛒 *Underworld Bazaar:* Equip weapons, armor & consumable rations\n"
        "🪙 *Mint GREEN Coins:* Crystallize sparks into liquid cryptocurrency\n\n"
        "👇 *Tap below to launch the Telegram Mini App immediately:*"
    )

    keyboard = {
        "inline_keyboard": [
            [
                {
                    "text": "🚀 Launch Neon Metropolis 🌿",
                    "web_app": {"url": game_url}
                }
            ],
            [
                {
                    "text": "👥 Invite Friends (+Rewards)",
                    "url": share_url
                },
                {
                    "text": "📖 How to Play",
                    "callback_data": "help_guide"
                }
            ]
        ]
    }

    call_tg("sendMessage", {
        "chat_id": chat_id,
        "text": msg_text,
        "parse_mode": "Markdown",
        "reply_markup": keyboard
    })

def send_help(chat_id):
    help_text = (
        "📖 *Neon Metropolis — Operative Field Guide*\n\n"
        "1️⃣ *Tap & Accumulate:* Tap the glowing chlorophyll core to harvest raw Dream Sparks (⚡).\n"
        "2️⃣ *Botanical Cards:* Reinvest your Sparks into Cards across 7 sections (Mini Spores, Luminescent Flora, Ancient Trees, Cosmic Engines, etc.) to generate auto-income while offline.\n"
        "3️⃣ *Daily Combo (5M Sparks):* Every day at 00:00 UTC, 3 secret cards form the Daily Combo. Buy or upgrade all 3 to claim an instant 5,000,000 Sparks payout.\n"
        "4️⃣ *Underworld Bazaar:* Spend minted 🪙 GREEN Coins on weapons, ballistic vests, food, and medicine. Items grant direct damage, protection, and vital restores.\n"
        "5️⃣ *Dream Market:* In the Dream Tap menu, trade Sparks directly for Energy, Food Satiety, Nerve, and Happiness.\n\n"
        "Tap the button below anytime to jump back in!"
    )

    keyboard = {
        "inline_keyboard": [
            [
                {
                    "text": "🚀 Launch Game Now 🌿",
                    "web_app": {"url": EVERGREEN_URL}
                }
            ]
        ]
    }

    call_tg("sendMessage", {
        "chat_id": chat_id,
        "text": help_text,
        "parse_mode": "Markdown",
        "reply_markup": keyboard
    })

def run_bot():
    print(f"🤖 Starting Neon Metropolis Telegram Bot (@{BOT_USERNAME})...")
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

                # Handle callback queries
                if "callback_query" in upd:
                    cb = upd["callback_query"]
                    cb_data = cb.get("data", "")
                    chat_id = cb["message"]["chat"]["id"]
                    call_tg("answerCallbackQuery", {"callback_query_id": cb["id"]})
                    if cb_data == "help_guide":
                        send_help(chat_id)
                    continue

                # Handle messages
                if "message" not in upd:
                    continue

                msg = upd["message"]
                text = (msg.get("text") or "").strip()
                chat_id = msg["chat"]["id"]
                user_first = msg.get("from", {}).get("first_name", "")

                if text.startswith("/start"):
                    parts = text.split(maxsplit=1)
                    ref_code = parts[1] if len(parts) > 1 else ""
                    send_welcome(chat_id, user_first, ref_code)
                elif text == "/play":
                    send_welcome(chat_id, user_first)
                elif text == "/help":
                    send_help(chat_id)
                elif text:
                    # Generic response
                    send_welcome(chat_id, user_first)

        except Exception as e:
            time.sleep(3)

if __name__ == '__main__':
    run_bot()
