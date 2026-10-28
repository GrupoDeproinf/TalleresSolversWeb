# Pruebas de las reglas de Firestore y Storage

Prueban `firestore.rules` y `storage.rules` con cada tipo de cuenta (admin,
certificador, soporte, personal antiguo, taller, cliente, sin sesión) en el
emulador de Firebase. No tocan la base real.

```
cd reglas-pruebas
npm i --no-save @firebase/rules-unit-testing firebase
cp ../firestore.rules ../storage.rules .
npx firebase-tools@13.35.1 emulators:exec --only firestore,storage --project demo-solvers "node probar.mjs ."
```

(firebase-tools 15 pide Java 21; la 13 funciona con Java 17.)
