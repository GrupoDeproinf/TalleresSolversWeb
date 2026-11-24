# Pruebas de las Cloud Functions

`probar-solo-personal.mjs` comprueba que las funciones que llama el panel
(borrar cuentas, correo de decisión, reconstruir índices) solo responden al
personal de Solvers, y que nadie borra su propia cuenta ni (sin ser Admin) la
de otro miembro del personal.

Corre en los emuladores de Auth, Firestore y Functions: nunca toca la base real
ni envía correos (la contraseña de Gmail del emulador es falsa).

```
cd functions
npm ci && npm run build
printf 'GMAIL_APP_PASSWORD=falso-solo-emulador\n' > .secret.local
cd pruebas
npx -y firebase-tools@14 emulators:exec --only auth,firestore,functions --project demo-solvers "node probar-solo-personal.mjs"
```

firebase-tools 13 no sirve (llama a `functions.config()`, que ya no existe en
firebase-functions 7). La 14 funciona con Java 17; la 15 pide Java 21.
