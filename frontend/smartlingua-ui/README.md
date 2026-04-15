# SmartLingua UI (Angular)

Student-facing UI for the SmartLingua Task 4 demo.

## Run (local dev)

```powershell
cd C:\Users\abbas\Desktop\microservice\frontend\smartlingua-ui
npm install
npm start
```

Open: http://localhost:4200

## API proxy

During local development the UI calls `/api/...` and forwards it using:

- [proxy.conf.json](proxy.conf.json)

If you change backend ports, update that file to match.
