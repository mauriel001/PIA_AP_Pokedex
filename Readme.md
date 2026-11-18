# Pokédex – PIA de Aplicaciones Móviles

Aplicación móvil hecha con **React Native** y **Expo** que consume la [PokéAPI](https://pokeapi.co/) para explorar los Pokémon y los objetos del juego. Incluye inicio de sesión local, favoritos, búsqueda, filtros y modo oscuro.

> **Materia:** Aplicaciones Móviles  
> **Autores:** ALdo y Mau  

## Funciones

**Pokédex**
- Lista con carga progresiva: se piden más Pokémon al llegar al final de la lista.
- Tarjetas con número, nombre, tipos en español y un color pastel según su tipo principal.
- Filtro por **generación** (I a IX) y por **uno o varios tipos** a la vez.
- **Búsqueda** por nombre o por número.
- **Favoritos** con estrella en cada tarjeta, guardados en el dispositivo, y filtro para ver solo favoritos.
- Al abrir un Pokémon se reproduce su grito.

**Detalle del Pokémon**
- Descripción en español, altura, peso y experiencia base.
- Habilidades (indicando las ocultas) y estadísticas base con barras.
- Carrusel de **formas alternativas**: Mega Evolución, forma de Alola y Gigamax, cada una con su versión **shiny**.

**Objetos**
- Objetos del juego organizados por bolsillo (Botiquín, Poké Balls, MT y MO, Bayas, Objetos clave y general) y separados por categoría.

**Cuenta y ajustes**
- Registro e inicio de sesión **locales**. La contraseña se guarda con hash SHA-256 y sal aleatoria, y la sesión se conserva al cerrar la app.
- **Modo oscuro** con interruptor en el encabezado; recuerda tu elección.
- Mensajes de error con opción de reintentar cuando falla la conexión.

## Tecnologías

| Uso | Librería |
|---|---|
| Framework | React Native + Expo |
| Interfaz | React Native Paper |
| Imágenes | expo-image |
| Sonido | expo-audio |
| Almacenamiento local | @react-native-async-storage/async-storage |
| Cifrado de contraseñas | expo-crypto |
| Datos | PokéAPI (REST) |

## Estructura del proyecto

```
├── index.js              # Punto de entrada
├── main.js               # Sesión, tema y pantalla principal
├── MainContent.js        # Lista, resultados y estados vacíos / de error
├── navigation.js         # Encabezado, pestañas, filtros y búsqueda
├── ListaDespegable.js    # Listas de generación y tipo
├── PokemonCard.js        # Tarjeta de cada Pokémon
├── Detalle.js            # Pantalla de detalle
├── Alternativas.js       # Carrusel de formas alternativas y shiny
├── Objetos.js            # Objetos por bolsillo y categoría
├── DetalleObjeto.js      # Detalle de un objeto
├── Login.js / auth.js    # Pantalla y lógica de inicio de sesión
├── tema.js               # Modo claro / oscuro
├── colores.js            # Colores pastel por tipo
├── styles.js             # Estilos compartidos
├── hooks/                # useFavorites, usePokemonCatalog, usePokemonSearch
└── useNetworkRetry.js    # Reintento al recuperar la conexión
```

## Cómo ejecutarla

Requisitos: **Node.js** y la app **Expo Go** en tu celular (o un emulador).

```bash
git clone https://github.com/mauriel001/PIA_AP_Pokedex.git
cd PIA_AP_Pokedex
npm install
npx expo start
```

Escanea el código QR con Expo Go. El celular y la computadora deben estar en la misma red Wi-Fi. Para abrirla en el navegador, presiona `w` en la terminal.

Si algo falla al arrancar, prueba `npx expo start -c` para limpiar la caché.

## Generar el APK

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

El perfil `preview` de `eas.json` debe incluir `"android": { "buildType": "apk" }` para obtener un archivo instalable.

## Capturas

_(agregar capturas de la lista, el detalle, las formas alternativas, los objetos y el modo oscuro)_

## Notas

- La aplicación necesita conexión a internet para cargar datos, imágenes y sonidos de la PokéAPI.
- El inicio de sesión es local: las cuentas viven solo en el dispositivo o navegador donde se crearon y no hay servidor de autenticación.

## Créditos y licencia

- Datos e imágenes: [PokéAPI](https://pokeapi.co/). Los gritos provienen de Pokémon Showdown.
- Pokémon y sus nombres son marcas de Nintendo, Game Freak y Creatures Inc. Este proyecto es solo con fines educativos y no tiene relación con ellas.
- Código bajo licencia MIT (ver `LICENSE`).

## Extensiones

- npx expo install @expo-audio
- npx expo install @expo/vector-icons
- npx expo install expo-crypto