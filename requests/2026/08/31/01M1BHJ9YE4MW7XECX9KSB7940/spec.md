---

# ═══════════════════════════════════════════════════════════════
#  INFORME DE ANÁLISIS DE JUEGO EN LÍNEA Y CUMPLIMIENTO DE IVA
# ═══════════════════════════════════════════════════════════════

| | |
|---|---|
| **Preparado para (Cliente):** | **Polla Chilena de Beneficencia S.A.** |
| **Propósito del informe:** | **Análisis de juego en línea y cumplimiento de IVA** |
| **Producido por:** | **SICPA SA** |
| **Solución:** | SICPADetect® |
| **Fecha de emisión:** | *{fecha_de_emision}* (por defecto: fecha de generación) |
| **Confidencialidad:** | Confidencial — para uso exclusivo de Polla Chilena de Beneficencia S.A. |

> **Este bloque de encabezado debe aparecer, de forma destacada, en la portada / primera
> sección de cada informe generado.** Identifica al cliente, el propósito, el productor y
> la fecha de emisión. Renderizar como una banda de encabezado pronunciada y con borde
> (color primario SICPA `#1F3F63`), con el nombre del cliente y el propósito del informe
> como los elementos de mayor tamaño.
> Remove from dataset and calculation and url that contains "twitter.comn"

---

## Visión general

Estas son las instrucciones completas para generar el informe **Análisis de Juego en
Línea** para **Polla Chilena de Beneficencia S.A.**, a partir de una exportación de
planilla de SICPADetect. Seguirlas en orden: **(1) ingesta y validación del insumo,
(2) construcción del conjunto de trabajo "estándar", (3) clasificación interna de cada
sitio de juego contra las listas de referencia (§1.3), (4) cálculo de todas las métricas,
(5) ensamblado de las secciones del informe, (6) redacción de los hallazgos narrativos.**

El informe se ejecuta en el contexto de una configuración (Chile). Es totalmente
data-driven: nunca inventar un valor — si el insumo no lo contiene, dejarlo en blanco u
omitir la sección. Todos los textos, títulos, tablas y narrativas del informe se
renderizan **en español**.

### Terminología — adaptación para este cliente

Este informe **no utiliza las nociones de "juego con licencia" ni "juego ilegal", ni
formula juicios sobre legalidad**. La única distinción primaria visible es entre
**sitios de juego** ("Juego") y **sitios que no son de juego** ("No juego"). Donde la
exportación de SICPADetect use los estados `Illegal gambling` o `Licensed gambling`,
esas filas se tratan simplemente como filas de **Juego**.

La clasificación de registro de IVA (§1.3, §2.3) se computa de forma **interna** y se
emplea **únicamente** en: (a) el indicador de color de la tabla "Sitios de Juego Mejor
Posicionados" (verde/rojo), y (b) los dos registros ampliados de la Sección D. La
narrativa de hallazgos (§5) **no** menciona registro de IVA, legalidad ni bloqueo; se
limita a las cifras de Juego / No juego y a hallazgos técnicos.

---

## 1. Insumo (Input)

### 1.1 Formato
- Un único **CSV delimitado por punto y coma (`;`)** con fila de encabezado (una
  "exportación de planilla de SICPADetect"). Recortar espacios de cada encabezado.
  Omitir líneas vacías.

### 1.2 Columnas
- **Columnas requeridas** (la validación falla si falta alguna; se permiten columnas
  extra y se ignoran salvo que se nombren abajo):
  `Domain`, `URL`, `Status`, `Source`, `Rank`, `Updated at`, `Confidence`,
  `LLM Reasoning`, `Case Management Status`.
- **Columnas opcionales** (se usan solo si están presentes, nunca se infieren): entidad
  legal — primer valor no vacío de `Legal entity`, `Legal Entity`, `Legal entity name`,
  `Entity`, `Operator`, `Operator name`; país de la entidad legal — primer valor no
  vacío de `Legal entity country`, `Legal Entity Country`, `Entity country`,
  `Operator country`, `Jurisdiction`.
- **Valores reconocidos de `Status`:** `Licensed gambling`, `Illegal gambling`,
  `Not gambling`, `Unreachable`, `Review needed`. Cualquier otro valor se trata como
  `Unknown`.
  - **Mapeo de juego:** tanto `Licensed gambling` **como** `Illegal gambling` se mapean a
    la categoría interna única **`Juego`**. `Not gambling` se mapea a **`No juego`**.
    `Unreachable` / `Unknown` se reportan tal cual y **no** son juego.

Si faltan columnas requeridas, detenerse e informar exactamente cuáles faltan.

### 1.3 Listas de referencia de registro de IVA (Chile) — datos de referencia incorporados

Estas listas son la autoridad para la clasificación interna de registro de IVA. Se
reproducen aquí para que el informe sea autocontenido. **No se muestran como sección
narrativa**; solo alimentan el color de la tabla de la Sección C y los registros de la
Sección D.

#### A) Plataformas registradas para IVA → clasificar como **`IVA_REGISTRADO`** (verde)
Todo sitio de juego cuyo dominio (o, para una variante/redirección, cuya marca semilla)
coincida con una de estas plataformas — **y sus variantes** — es `IVA_REGISTRADO`.

| # | Dominio | Entidad legal |
|---|---------|---------------|
| 1 | betsala.com | Betsala B.V. |
| 2 | playsala.com | *(operador compartido — Betsala)* |
| 3 | latamwin.online | W&C N.V. |
| 4 | winchile.com | *(operador compartido — W&C N.V.)* |
| 5 | pokerenchile.com | — |
| 6 | juegaenlineachile.com | Ingus Bridge Corp |
| 7 | bettingiscool.com | — |
| 8 | fortunazo.cl | Leontodo N.V. |
| 9 | jugabet.cl | Gladia N.V. |
| 10 | cl.novibet.com | Logflex MT Limited |
| 11 | skillonnet.com | Skill On Net LTD. |
| 12 | state77.com | Novawave Technology N.V. |
| 13 | cl.bet7k.com | — |
| 14 | 1xbet.com | 1XBET |
| 15 | estelarbet.cl | S3 Tech N.V. |
| 16 | betway.com | Betway Limited |
| 17 | coolbetchile.com | Polar Limited |
| 18 | baytreeinteractive.com | Baytree Interactive Limited |
| 19 | epicbet.com | Overcooked LTD. |
| 20 | respin.com | — |
| 21 | 418services.com | 418SERVICES B.V. |
| 22 | kaizengaming.com | Kaizen Gaming International Limited (Betano) |
| 23 | doradobet.com | VS Services LTD. |
| 24 | betsson1001.com | Netplay Malta Limited |

> Nota: `latamwin.online` aparece dos veces en la lista de origen; es una sola plataforma.

#### B) Marcas listadas → clasificar como **`IVA_NO_REGISTRADO_LISTADO`** (rojo)
Todo sitio de juego cuyo dominio/marca semilla contenga uno de estos tokens de marca —
**y sus variantes** — es `IVA_NO_REGISTRADO_LISTADO`.

| # | Marca | Token de coincidencia (minúsculas) |
|---|-------|-----------------------------------|
| 1 | BET365 | `bet365` |
| 2 | STARS | `stars` |
| 3 | 1WIN.COM | `1win` |
| 4 | ELECTRAWORKS | `electraworks` |
| 5 | THELOTTER | `thelotter` |
| 6 | POKERSTARS | `pokerstars` |
| 7 | GGPOKER | `ggpoker` |
| 8 | BETCRIS | `betcris` |
| 9 | LEOVEGAS | `leovegas` |
| 10 | ROOBET | `roobet` |

#### C) Todo lo demás → clasificar como **`IVA_NO_REGISTRADO`** (rojo)
Todo sitio detectado como **Juego** que **no** coincida con la lista A ni la lista B es
`IVA_NO_REGISTRADO`.

---

#### B1) Brands
Create a detailed heat map of brands listed below with the number of URLS which correspond to that brand. Try to get information such as licence number, where company is registered for each brand using external lookup for this information.

1XBET
APUESTAS ROYAL
BET365
BETANO
BETCRIS
BETFAIR
BETPLAY
BETSALA
BETSONN
BETSSON
BETWARRIOR
BETWAY
BODOG
BWIN
COOLBET
EPICBET
ESTELARBET
JUEGAENLINEA
JUEGALO
JUGABET
KTO
LATAMWIN
MARATHONBET
MICASINO
NOVIBET
RIVALO
ROJABET
RUSHBET
SPORTINGBET

----



## 2. Construcción del conjunto de trabajo ("estándar")

1. Descartar toda fila cuyo `Status` sea **`Review needed`** (aún no adjudicada).
2. **De-duplicar por `URL`**, conservando la primera aparición (las filas sin URL se
   conservan y se indexan por su contenido completo).
3. El resultado es el **conjunto estándar**; `total = número de filas en él`. Toda
   métrica se computa sobre el conjunto estándar salvo que se indique lo contrario.

Definiciones auxiliares usadas en todo el documento:

- **label(fila)** = `Domain` si no está vacío, si no `URL`.
- **suffix(dominio)** = el último segmento con punto (p. ej. `casino.bet` → `.bet`);
  `(desconocido)` si el dominio no tiene punto.
- **Categoría de Source** = clasificar `Source` por prefijo: comienza con `Manual` →
  `Manual`; `Google Search` → `Google Search`; `Variant` → `Variant`; `Redirect` →
  `Redirect`; en otro caso `Other`.
- **seed(Source)** = el texto dentro del primer paréntesis de `Source`
  (p. ej. `Variant (bet365.com)` → `bet365.com`), si no, vacío.
- **brand(fila)** = para filas `Variant`/`Redirect`, el `seed` (mismo operador); en otro
  caso `label(fila)`.
- **esJuego** = `Status ∈ { 'Illegal gambling', 'Licensed gambling' }`.
- **esNoJuego** = `Status == 'Not gambling'`.

### 2.1 Normalización de dominios (para la coincidencia de registro de IVA)

Definir `norm(host)`:
1. minúsculas;
2. quitar el esquema (`http://`, `https://`);
3. quitar un `www.` inicial;
4. descartar ruta, query o barra final — conservar solo el host.

Definir `registrable(host)` = el dominio registrable efectivo (eTLD+1),
p. ej. `cl.novibet.com` → `novibet.com`, `m.betsala.com` → `betsala.com`.

### 2.3 Clasificación interna de registro de IVA de cada fila de Juego

Computar `brandKey(fila)` = `norm(brand(fila))`. Luego, **en este orden de prioridad**:

1. **`IVA_REGISTRADO`** — si `brandKey` coincide con alguna plataforma de la lista A. La
   coincidencia se da cuando `norm(brandKey)` es igual a un dominio de la lista A, **o**
   `registrable(brandKey)` es igual a la forma `registrable` de un dominio de la lista A
   (así las variantes y subdominios heredan, p. ej. `m.betway.com` → `betway.com`).
2. **`IVA_NO_REGISTRADO_LISTADO`** — si no, y si `brandKey` (o `label(fila)`) contiene
   algún token de marca de la lista B como subcadena. Coincidir primero los tokens más
   largos (`pokerstars` antes que `stars`) para evitar clasificaciones erróneas.
3. **`IVA_NO_REGISTRADO`** — en otro caso (cualquier sitio de juego restante).

Las filas de No juego, inaccesibles y desconocidas **no** reciben categoría de registro de
IVA. Esta clasificación es **interna** y solo se materializa donde se indica
explícitamente (Sección C y Sección D).

---

## 3. Métricas a computar

### 3.1 Conteos
- `total` — tamaño del conjunto estándar.
- `juego`, `noJuego`, `inaccesibles` — conteos de las categorías mapeadas respectivas.
- **Conteos internos de registro de IVA (sobre filas de Juego):** `ivaRegistrado`,
  `ivaNoRegistradoListado`, `ivaNoRegistrado` (para uso exclusivo de las Secciones C y D).

### 3.2 Período de evaluación y volumen en el tiempo  *(sin cambios)*
- Parsear `Updated at` como fecha; ignorar valores no parseables.
- `earliest` / `latest` = fecha mínima / máxima parseable (formato `YYYY-MM-DD`).
- `days` = span inclusivo de días = `round((latest − earliest)/1 día) + 1`, si no `0`.
- **URLs analizadas por día:** por cada fecha, contar **URLs distintas** actualizadas ese
  día; salida como serie ascendente por fecha `{ fecha, conteo }`.

### 3.3 Distribución Juego / No juego  *(reemplaza "Status distribution")*
- Contar `juego` y `noJuego` sobre el conjunto estándar (opcionalmente mostrar
  `inaccesibles` como categoría neutra).
- Para cada una: `{ categoria, conteo, pct = conteo/total*100 }`, ordenado por conteo
  desc. **No** se muestran subcategorías de registro de IVA en esta distribución.

### 3.4 Top 10 sufijos de URL  *(columnas "illegal" → "juego")*
- Agrupar el conjunto estándar por `suffix(Domain)`.
- Para cada sufijo: `{ total, pct = total/all*100, juego = conteo de juego,
  pctJuego = juego/total*100 }`. Conservar el **top 10 por total**.

### 3.5 Marcas y variantes (solo Juego)
- Tomar filas de juego cuya categoría de Source sea `Variant`.
- Agrupar por `seed`; contar **URLs distintas** por seed → `marcas = { seed, conteo }`
  ordenado desc. `distinctBrands` = número de seeds.
- `topBrand` = el seed con más variantes; `topBrandVariants` = hasta 40 `label`s de sus
  filas variantes.

### 3.6 Redirecciones (solo Juego)
- Tomar filas de juego cuya categoría de Source sea `Redirect`.
- Agrupar por `seed`; contar **URLs distintas** por seed. Conservar el **top 10**.
- `topRedirect` = seed más activo; `topRedirectTargets` = hasta 40 `label`s de destino.

### 3.7 Hallazgos de convención de nombres (para variantes y, por separado, redirecciones)  *(sin cambios)*
A partir del conjunto de nombres de dominio, producir hasta tres bullets:
1. **Palabras clave recurrentes** — contar cuántos nombres contienen cada uno de estos
   tokens y nombrar el top 3 (con conteos): `mobile, m., account, login, secure, verify,
   support, app, bet, casino, win, play`. Redactar como evidencia de un *esquema de
   nombres basado en plantillas*.
2. **Rotación de TLD** — si los nombres abarcan más de un sufijo, listar los sufijos
   (top 4 con conteos) y señalar que el operador rota dominios de nivel superior.
3. **Conteo distinto** — "`N` dominios <variante|redirección> distintos identificados en
   total." Si no hay evidencia, un único bullet: "No se encontró evidencia."

### 3.8 Comparación (solo Juego)  *(sin la etiqueta "illegal")*
Dividir las filas de juego en `variants` (Variant), `redirects` (Redirect) y `direct` (el
resto), cada uno como porcentaje de su suma.

### 3.9 Análisis por fuente  *(split legal/illegal → juego/no juego)*
Para cada categoría en el orden fijo `Manual, Google Search, Variant, Redirect, Other`:
`{ total, juego, noJuego, pctJuego, pctNoJuego }` donde los porcentajes usan
`juego + noJuego` como denominador.

### 3.10 Posicionamiento (rankings)  *(renombrado; con estado de registro de IVA; se elimina el ranking con licencia)*
- Parsear `Rank` numéricamente.
- **Sitios de Juego Mejor Posicionados** = filas de juego con rank numérico, ascendente,
  **top 15** → `{ rank, dominio = label, source, estadoIva, colorIva }`.
  - `colorIva` = **verde** (`#27ae60`) para `IVA_REGISTRADO`; **rojo** (`#c0392b`) para
    `IVA_NO_REGISTRADO_LISTADO` e `IVA_NO_REGISTRADO`.
- **La tabla de "ranking con licencia" se elimina.**

### 3.11 Feed de sitios de juego (URLs de Juego)
Por cada fila de juego emitir `{ url, domain, brand, source, rank (o null),
fecha (YYYY-MM-DD de "Updated at", si no el valor bruto), estadoIva ∈
{IVA_REGISTRADO, IVA_NO_REGISTRADO_LISTADO, IVA_NO_REGISTRADO}, legalEntity,
legalEntityCountry }`. `legalEntity`/`legalEntityCountry` provienen solo de las columnas
opcionales del §1.2 — en blanco si están ausentes (usar como respaldo la entidad legal de
la lista A cuando la coincidencia `IVA_REGISTRADO` la aporte). Este feed alimenta la
Sección D.

### 3.12 Registros Top 100  *(nuevo — ver §4 Sección D)*
- **`top100IvaRegistrado`** — todas las filas de juego con `estadoIva == IVA_REGISTRADO`,
  ordenadas por `Rank` numérico ascendente (filas sin rank al final, ordenadas por
  `Updated at` desc), **top 100**. Campos: `{ rank (o —), dominio = label, brand,
  source, fecha, legalEntity }`.
- **`top100IvaNoRegistradoListado`** — igual, para
  `estadoIva == IVA_NO_REGISTRADO_LISTADO`, **top 100**.
- Ambas listas incluyen **variantes** (las filas variante/redirección resuelven a su
  marca semilla, que determina su clase de registro de IVA), de modo que una marca y
  todos sus dominios variantes detectados aparecen juntos.

---

## 4. Estructura del informe (renderizar en este orden)

Renderizar primero el **bloque de encabezado pronunciado** (cliente, propósito, productor,
fecha de emisión), luego:

### Sección A — "Las cifras"
- **Tarjetas de métricas:**
  - Total de URLs analizadas *(retenida)*;
  - **Período de evaluación** (días, con `earliest → latest`) *(retenida)*;
  - **Sitios de juego** (`juego`);
  - **Sitios que no son de juego** (`noJuego`).
  - *(Se eliminan las tarjetas de "juego ilegal" y "juego con licencia".)*
- **Gráfico — "URLs analizadas por día":** gráfico de líneas de la serie §3.2.
- **Gráfico — "Distribución Juego / No juego":** gráfico de torta/barras + una tabla
  `categoría / conteo / pct`. Colores neutros: Juego `#1F3F63`, No juego `#9aa7b4`.
- **Gráfico — "Top 10 sufijos de URL":** gráfico de barras + tabla de
  `sufijo / total / % del total / juego / % juego`.

### Sección B — "Los hallazgos"
- **"Marcas y variantes (`distinctBrands` marcas distintas)":** gráfico de barras de las
  marcas top por conteo de variantes, o estado vacío si no hay.
- **"Hallazgos de convención de nombres — variantes":** los bullets de §3.7 (variantes).
- **"Proliferación de variantes — `topBrand.seed`"** (solo si existe una marca top): un
  diagrama de nodos con el seed en el centro y sus URLs variantes alrededor; línea de
  interpretación: "`seed` es la marca más clonada, con `N` URLs variantes."
- **"Redirecciones desde — top 10":** gráfico de barras (o estado vacío).
- **"Propagación de redirecciones — `topRedirect.url`"** (solo si existe una): diagrama de
  nodos de la fuente de redirección → sus destinos; línea de interpretación: "`url`
  redirige a `N` destinos."
- **"Comparación — URLs → redirecciones → variantes":** tarjetas de métricas del split §3.8.

### Sección C — "Sitios de Juego Mejor Posicionados"
- Tabla **Sitios de Juego Mejor Posicionados** (top 15 por rank) con columnas
  `rank / dominio / source / estado de registro de IVA`. Colorear la celda de estado en
  **verde** (`IVA_REGISTRADO`) y **rojo** (`IVA_NO_REGISTRADO_LISTADO` /
  `IVA_NO_REGISTRADO`).
- *(Sin tabla de sitios con licencia.)*

### Sección D — "Registros ampliados"  *(nuevo)*
- **"Top 100 — sitios y variantes (`IVA_REGISTRADO`)":** tabla de §3.12
  `top100IvaRegistrado` (`rank / dominio / marca / source / fecha / entidad legal`).
  Encabezado/insignia en verde. Estado vacío: "No se detectaron sitios de la lista A en
  esta muestra."
- **"Top 100 — sitios y variantes (`IVA_NO_REGISTRADO_LISTADO`)":** tabla de §3.12
  `top100IvaNoRegistradoListado`. Encabezado/insignia en rojo. Estado vacío: "No se
  detectaron sitios de la lista B en esta muestra."

### Sección E — "Hallazgos clave"
Las tarjetas narrativas de §5.

---

## 5. Hallazgos clave (narrativa)

Cada tarjeta tiene un **título**, un **cuerpo** y una **conclusión** de una línea. Computar
primero las cifras: `juegoShare = juego/total*100`.

**Restricción de redacción:** la narrativa **no** menciona registro de IVA, legalidad ni
bloqueo. Se limita a las cifras de Juego / No juego y a hallazgos técnicos (variantes,
redirecciones, convenciones de nombres, rotación de TLD).

1. **Escala del análisis** — total de URLs distintas en el período de evaluación (`days`,
   más `earliest → latest` si se conoce), de las cuales `juego` son sitios de juego y
   `noJuego` no lo son.
   *Conclusión:* la muestra es suficientemente grande para razonar sobre patrones, no
   sobre casos aislados.

2. **Composición Juego / No juego** — el juego representa `juegoShare`% de todas las URLs
   analizadas; indicar los conteos de No juego e inaccesibles.
   *Conclusión:* la actividad de juego domina el espacio monitoreado (si
   `juegoShare ≥ 50%`), o bien constituye una minoría sustancial del mismo.

3. **Variantes y clonación de marcas** — `distinctBrands` marcas clonadas mediante
   dominios variantes; la marca más replicada `topBrand.seed` generó `topBrand.count`
   variantes. Si no hay variantes: indicar que la proliferación de variantes no es un
   factor.
   *Conclusión:* un puñado de marcas concentra la mayor parte de la proliferación.

4. **Redirecciones y modelado del tráfico** — `N` URLs de juego usan cadenas de
   redirección; la fuente más activa `topRedirect.url` apunta a `topRedirect.count`
   destinos. Si no hay: predomina el acceso directo.
   *Conclusión:* las redirecciones mantienen un punto de entrada estable mientras rotan
   los sitios detrás de él.

5. **Patrones técnicos de nomenclatura** — resumen de las convenciones de nombres
   detectadas (§3.7): palabras clave recurrentes, rotación de TLD y número total de
   dominios distintos.
   *Conclusión:* los nombres siguen esquemas basados en plantillas, coherentes con una
   generación automatizada de dominios.

---

## 6. Notas de salida y presentación

- Los porcentajes se muestran con un decimal.
- **Convención de color de estado de registro de IVA (fija, solo Secciones C y D):**
  `IVA_REGISTRADO` = verde `#27ae60`; `IVA_NO_REGISTRADO_LISTADO` e `IVA_NO_REGISTRADO` =
  rojo `#c0392b`. En contextos binarios (tabla de la Sección C) el estado se muestra
  simplemente como verde / rojo.
- La banda de encabezado usa el primario SICPA `#1F3F63`; la paleta categórica es
  `#1F3F63, #c0392b, #27ae60, #7d3c98, #9aa7b4, #2f5c8f, #e67e22`. Los colores deben
  mantenerse legibles en temas claro y oscuro.
- Los estados vacíos son explícitos ("No se detectó abuso de marca basado en variantes en
  esta muestra."), nunca datos fabricados.
- El informe es autocontenido por configuración. El feed de §3.11 alimenta la pantalla de
  registros, donde un operador puede promover un sitio a una lista de seguimiento.
- El bloque de identificación del encabezado (**Cliente**, **Propósito**, **Productor:
  SICPA SA**, **Fecha de emisión**) es obligatorio en cada emisión de este informe.
- Todo el contenido renderizado del informe se presenta **en español**.

---

*Especificación de informe producida por SICPA SA para Polla Chilena de Beneficencia S.A.
— Análisis de Juego en Línea.*
