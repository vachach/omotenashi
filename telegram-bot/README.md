# Omotenashi Academy Bot

## Google Sheets header assumptions
- Leads: `tg_id, username, name, phone, goal, level, source, status, created_at, last_contact`
- Trials: `tg_id, trial_at_iso, meet_link, booked_at_iso, remind_24h_sent, remind_1h_sent, attended, note`
- Payments: `tg_id, amount, proof_file_id, proof_type, submitted_at_iso, status, verified_by, verified_at_iso`

These headers must be present in row 1 of each tab, in the listed order.

## Google Service Account + Sheets API
1) Create a Google Cloud project.
2) Enable **Google Sheets API** for the project.
3) Create a **Service Account** and download the JSON key.
4) Share your Google Sheet with the service account email (edit access).
5) Base64-encode the JSON file and set it to `GOOGLE_SERVICE_ACCOUNT_JSON`.
   - Windows PowerShell example:
     - `Get-Content path\\to\\service-account.json -Raw | [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($_))`

## Get GROUP_ID (private group)
1) Add the bot to the group.
2) Make the bot an **admin**.
3) Send any message in the group.
4) Use `@userinfobot` or a small script to read the group chat id, then set `GROUP_ID`.

## Enable Join Requests
1) In the group settings, enable **Join Requests**.
2) Ensure the bot is admin with permission to **approve/decline join requests**.

## Env vars
```env
BOT_TOKEN=your_token
ADMIN_IDS=123,456
SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_JSON=base64_json
GROUP_ID=-1001234567890
MEET_LINK=https://meet.google.com/...
CARD_NUMBER=8600....
TZ=Asia/Tokyo
```

## Run
```bash
npm install
npm run dev
```
