# Backend Assignment Study Agent Report

Generated at: 2026-09-08T16:23:00.571Z

## Inputs

- Source: `samples/week-four-auth-source.md`
- Project folder: `../../../Backend_AI_Engineer/week_four`

## Grounded Source Facts

Detected endpoints:

- `GET /`
- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /public/info`
- `GET /protected/profile`
- `GET /protected/dashboard`

Detected status codes:

- `201`
- `200`
- `204`
- `401`
- `400`

Detected requirement themes:

- [x] Authentication
- [x] Environment variables
- [x] Swagger or docs
- [x] README or documentation
- [x] Screenshot or proof
- [ ] Curl or API tests

## Project Inspection

Files inspected: 16

Important project evidence:

- [x] README.md
- [x] package.json
- [x] openapi.json
- [x] .env.example
- [x] .gitignore
- [x] Swagger screenshot
- [x] Source folder

Available npm scripts:

- `npm run start`
- `npm run dev`

Auth-specific checks:

- [x] Supabase client mentioned
- [x] Bearer auth mentioned
- [x] Protected route mentioned
- [x] 401 behavior mentioned
- [x] Secret warning mentioned

## Build / Test Checklist

- Read the assignment source and keep source facts above as the checklist.
- Run `npm install` if dependencies are missing.
- Run `npm start` or the documented run command.
- Test public routes without a token.
- Test protected routes without a token and confirm `401`.
- Log in, copy a bearer token locally, and test protected routes with `Authorization: Bearer <token>`.
- Confirm `.env` is gitignored and real secrets are not committed.
- Confirm Swagger/OpenAPI docs include auth and protected routes if the assignment requires docs.
- Confirm README contains setup, run instructions, endpoint table, and one visible proof output.

## Missing Or Needs Verification

- No missing core project files detected by this MVP agent.
- needs verification: this MVP inspects files but does not execute API curl tests automatically.
- needs verification: public GitHub link and assignment upload must still be checked by a human.

## Human Review Before Submission

- Run the app and verify the endpoints manually.
- Check that screenshots match the assignment requirement.
- Check `git status` before commit or push.
- Do not upload or submit until the report matches the assignment portal.
