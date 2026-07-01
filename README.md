# ¿Salimos? 💕

Una página web cute para invitar a salir y coordinar los detalles de la cita.
Es reutilizable: podés configurarla una vez y volver a usarla para futuras citas sin tocar el código.

## Qué hace

- Pantalla inicial con invitación juguetona y botón "No" travieso.
- Wizard de una pregunta a la vez, pensado para celular.
- Opciones en grillas 2×2 con emojis grandes.
- Resumen final con opción de responder por WhatsApp o compartir como imagen.
- Diseño soft & pastel, responsive y optimizado para celular.
- Easter eggs para quien abra el inspector (F12).

## Modo configuración (solo para vos)

La pantalla de configuración **no se muestra a ella** automáticamente. Para editar la invitación:

1. Abrí la página agregando `?config=1` al final de la URL:

```
https://tuusuario.github.io/nombre-del-repo/?config=1
```

2. Editá título, subtítulo, opciones, mensajes del botón No, etc.
3. Tocá **"Guardar y empezar"**.
4. Compartile el link **sin** el `?config=1`:

```
https://tuusuario.github.io/nombre-del-repo/
```

Ella verá directamente la invitación linda, sin la pantalla de configuración.

## Cómo probar localmente

1. Abrí el archivo `index.html` en tu navegador para ver la invitación.
2. Para entrar al modo configuración:

```bash
# Mac/Linux
open "index.html?config=1"

# Windows
start "index.html?config=1"
```

O con un servidor local:

```bash
cd C:\MyStuff\Coding\Date
python -m http.server 8000
```

- Invitación: `http://localhost:8000`
- Configuración: `http://localhost:8000/?config=1`

## Cómo publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube estos archivos (`index.html`, `style.css`, `script.js`, `README.md`).
3. Ve a **Settings > Pages** del repositorio.
4. En **Source** elige **Deploy from a branch**, selecciona `main` y carpeta `/ (root)`.
5. Guardá y esperá unos minutos. GitHub te dará un link tipo:

```
https://tuusuario.github.io/nombre-del-repo/
```

6. Para configurar la invitación, visitá `https://tuusuario.github.io/nombre-del-repo/?config=1`.
7. Para compartirle a ella, pasale el link sin `?config=1`.

## Personalizar

La forma más fácil es usar el modo configuración (`?config=1`).

Si querés tocar el código:

- Editá los textos por defecto en `script.js` dentro de `defaultConfig`.
- Cambiá colores en las variables CSS al inicio de `style.css`.
- Agregá o quitá opciones en los campos de configuración.

## Notas

- Las opciones se escriben separadas por coma, con el emoji al final. Ejemplo: `Pizza 🍕, Hamburguesas 🍔`.
- Los mensajes del botón No se escriben uno por línea. El primero siempre es el mensaje inicial.
- La configuración se guarda en el navegador (`localStorage`). Si abrís la página en otro dispositivo, no se transfiere automáticamente: tenés que volver a configurarla ahí o copiar la URL.

## Créditos

Hecho con mucho cariño 💌
