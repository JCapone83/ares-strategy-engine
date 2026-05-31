# Security Policy

Ares v0.1 does not require API keys and does not send model requests to provider APIs.

## Reporting

Please report security issues privately to the repository owner before opening a public issue.

## Sensitive Data

Do not commit:

- API keys
- private model prompts
- client data
- private leaderboard exports
- screenshots containing credentials or personal data

## Browser Storage

The app stores local leaderboard entries in browser `localStorage`. Treat those as local demo data, not a secure database.
