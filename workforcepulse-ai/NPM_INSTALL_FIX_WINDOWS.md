# Windows npm install fix

If npm tries to download packages from an internal registry URL such as:

`packages.applied-caas-gateway1.internal.api.openai.org`

remove old lock files and force npm to use the public npm registry.

Run these commands from the project root in PowerShell:

```powershell
npm config set registry https://registry.npmjs.org/
npm config delete proxy
npm config delete https-proxy

Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\server\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\client\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force .\package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force .\server\package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force .\client\package-lock.json -ErrorAction SilentlyContinue

npm install --prefix server
npm install --prefix client
npm install
npm run dev
```
