# Prompt — Informe de sitios a bloquear (Polla Chilena)

Prompt simple y reutilizable. Toma un export de SICPA Detect y devuelve **una sola cosa**: la lista
de URLs que Polla debería considerar enviar a bloqueo, por marca, con su nivel de relevancia para
Chile.

No es un informe de mercado, ni de cumplimiento tributario, ni un análisis de tendencias. Si un
dato no ayuda a decidir si una URL se bloquea o no, no va en el informe.

---

## ENTRADA

1. **Export de SICPA Detect** — CSV delimitado por `;`. Columnas esperadas:
   `Domain`, `URL`, `Status`, `Source`, `Rank`, `Updated at`, `Confidence`, `LLM Reasoning`,
   `Case Management Status`.
2. **Lista de dominios ya denunciados** — está incrustada más abajo en este mismo prompt, en tres
   olas. No hace falta ningún archivo adicional.

Lee el export desde disco antes de escribir nada. Si falta, detente y pregunta.

---

## REGLAS

**1. Terminología.** La única distinción de contenido permitida es **juego / no juego**. No uses
"ilegal", "ilícito", "no autorizado", "con licencia" ni sinónimos para calificar un sitio o un
operador. El campo `Status` del export trae una etiqueta de legalidad: renómbrala a `Juego` y dilo
una vez en el método, para que los recuentos sigan cuadrando con el archivo original. El informe no
determina la situación legal de ningún sitio y nadie debe inferirla de su inclusión aquí.

*Única excepción:* las citas textuales de resoluciones judiciales y de formularios oficiales
conservan su redacción original, siempre entre comillas y con la fuente identificada. Esa redacción
no se extiende al resto del informe ni a las columnas de las tablas.

**2. Atribución a la marca.** El campo `Source` codifica el linaje como `Variant (dominio.padre)` o
`Redirect (dominio.padre)`. Resuelve la cadena hasta la raíz (con control de ciclos) y atribuye cada
dominio a **la marca raíz**, no al padre inmediato. `Google Search`, `Youtube` y `Manual` son
métodos de descubrimiento, no linaje.

**3. Descarta lo que no se puede bloquear.** Fuera de las tablas de propuestas:
- Infraestructura compartida: CDN, hosting, ISP, registradores, analítica (Akamai, Cloudflare, AWS,
  OVH, Contabo, `hosted-by-*`, Google y similares). Bloquearlas rompe servicios ajenos.
- Dominios que ya figuran en **cualquiera de las tres olas de denuncia** incrustadas abajo
  (28-08-2026, 14-09-2026 y 02-10-2026), comparados por dominio registrable: `m.betsala11.com`
  cuenta como `betsala11.com`. Los dominios de la tercera ola **no desaparecen del informe**: no se
  proponen para bloqueo porque ya están presentados, pero se reportan en la sección de contraste
  (SALIDA 1, sección 2).
- Dominios institucionales o comerciales legítimos que sirven contenido de juego. Indican
  compromiso del sitio o colocación pagada, no propiedad del operador. Van en una lista aparte al
  final del informe, con la advertencia de que requieren notificación y retiro, no orden de bloqueo.

**4. Relevancia para Chile.** Tres niveles, en este orden:

| Nivel | Criterio |
|---|---|
| **Alta** | Termina en `.cl`, o el nombre contiene `chile`, `chil`, `cl`, `latam` o `lat`, o el contenido cita Chile, pesos chilenos o ciudades chilenas, o la ruta de la URL incluye `/cl` |
| **Media** | Sufijo genérico alcanzable desde Chile (`.com`, `.net`, `.bet`, `.vip`, `.app`, `.top`, `.online`, `.casino`, `.xyz`, `.io`) con contenido en español |
| **Baja** | ccTLD o moneda de otro mercado (`.mx`, `.pe`, `.co`, `.ar`, `.es`, `.br`, `.de`, `.za`, `.eu`) |

La ruta de la URL es señal válida en los dos sentidos: `/cl` o `/cl/` eleva a **Alta**
(`betsson1003.com/cl`, `juegacoolbet.com/cl/deportes`); un locale de otro mercado como `/es-es`
no baja por sí solo el nivel, pero se deja anotado.

**Español vs portugués.** Discrimina por vocabulario que cambia entre los dos idiomas: *apuestas /
apostas*, *cuenta / conta*, *jugar / jogar*, *dinero / dinheiro*, *ruleta / roleta*, *tragamonedas /
caça-níqueis*, *bienvenida / boas-vindas*, *giros gratis / rodadas grátis*. **Nunca uses `depósito`
como señal de español** — se escribe igual en portugués y genera falsos positivos en volumen.

Si el contenido en español apunta a un mercado vecino concreto (soles peruanos, pesos argentinos,
"para Perú"), regístralo como relevancia **Baja** e indica el mercado. Un dominio que lleva `chile`
en el nombre pero sirve contenido de otro mercado es un hallazgo: márcalo.

**5. Registros sin validar.** Incluye **todas** las URLs de juego detectadas, hayan sido revisadas
o no. En particular, los registros con `Source` = `Variant` y `Case Management Status` = revisión
pendiente **se incluyen siempre**: son precisamente las réplicas nuevas que todavía nadie validó, y
son el motivo por el que existe el monitoreo.

Arrastra el valor de `Case Management Status` al CSV como `estado_revision`, sin convertirlo en una
puntuación ni en un nivel. Di en el resumen del informe cuántas de las URLs propuestas están
pendientes de revisión. No se asigna ningún nivel de confianza ni de certeza: la única
clasificación del informe es la relevancia para Chile.

**6. Estado de la marca.** Toda URL propuesta lleva además uno de estos dos valores, según la marca
raíz a la que se atribuye:

| Valor | Significado |
|---|---|
| `Denunciada` | La marca figura en alguna de las tres olas de denuncia incrustadas abajo. Lo propuesto es una réplica nueva que se suma a un expediente ya abierto. |
| `Sin denuncia previa` | La marca solo figura en la lista de seguimiento. Requiere una primera denuncia, no una ampliación. |

Las dos poblaciones se reportan en secciones separadas y nunca se mezclan en la misma tabla.

**7. Denuncia no es bloqueo, y bloqueo no es inaccesibilidad.** Tres estados distintos que el
informe no debe confundir:

| Estado | Qué significa | De dónde sale |
|---|---|---|
| **Denunciado** | El dominio fue reportado a la autoridad en alguna de las tres olas. | Tablas incrustadas abajo. |
| **Cubierto por orden** | Existe la orden judicial a las ISP descrita en la base legal de la tercera ola. Alcanza a los sitios comprendidos en la sentencia y a sus derivados. | Sentencias de 29-09-2025 y 07-08-2026. |
| **Observado activo** | Alguien verificó la URL y seguía respondiendo con contenido de juego en una fecha concreta. | Columna `estado_observado` de la tabla de la tercera ola. |

Un dominio denunciado y cubierto por orden puede seguir observado activo: eso es exactamente lo que
documenta la presentación del 02-10-2026. El informe nunca afirma que un dominio está bloqueado.

**8. Sitios con carga diferida o condicionada.** La presentación del 02-10-2026 registra dos
dominios (`juegacoolbet.com`, `latamwin.online`) que sólo terminan de cargar si la ventana del
navegador permanece activa durante al menos 30 segundos. Un rastreo headless o en segundo plano los
registra como caídos. Si el export marca como inactivo o sin contenido un dominio que la tercera
ola reporta activo, no lo descartes: anótalo como **verificación divergente** y déjalo en la tabla
con esa marca. Es un límite del rastreo, no una prueba de que el sitio cayó.

---

## DATOS FIJOS — DOMINIOS YA DENUNCIADOS (OLAS 1 Y 2)

Tabla entregada por Polla. Dos olas de denuncia a la Excma. Corte Suprema: **28-08-2026** (sitios
principales y réplicas básicas) y **14-09-2026** (réplicas adicionales encontradas por Polla).
90 dominios distintos, 23 marcas, 101 registros de denuncia.

**Las fechas son de denuncia, no de bloqueo.** Indican cuándo el dominio fue reportado a la Corte,
no que exista una orden dictada ni ejecutada. El informe no debe afirmar lo contrario.

| Marca | Denunciados 28-08-2026 | Denunciados 14-09-2026 |
|---|---|---|
| 1xBet | 1xbet.com, 1xbet1.cl, 1xbetargentina.casino, chile.1xbet.com | 1xbetchil.com |
| Bet365 | bet36.com, bet362.vip, bet363.app, bet363.bet, bet365.es, bet365bonus.com, bet36fifa.com, loginbet365.com, officialbet365.com | bet365.es |
| Betano | lat.betano.com | betano.com, latam.betano.com |
| Betcris | be.betcris.com, be.betcris.mx, betcris.com, betcris.mx, betcris.pe, betnbet.mx | be.betcris.com, betcris.com |
| Betfair | betfair.com | clbetfair.com |
| BetPlay | betplay-chile.com | betplay-chile.com |
| Betsala | betonwinchile.app, betsala.app, betsala.bet, betsala.com, betsala11.com, betzala.com, m.betsala11.com, m.betsalavip.com, mobile.betsala.com | betsalavip.com |
| Betsson | betsson-casinoo.it.com, betsson.bet.ar, betsson.co, betsson1001.com, betssonchile.cl, ofertas.betsson.pe, offers.betsson.co | betsson1002.com |
| BetWarrior | betwarrior.bet, betwarrior.bet.ar | betwarrior.bet.ar |
| Betway | betway.co.za, betway.com, betway.de, betway.es, betway.mx, blog.betway.com, new.betway.co.za | betway.com |
| Bodog | bodog-cl.com, bodog.com | bodog-cl.com |
| bwin | bwin.es | bwin.com |
| Coolbet | coolbetchile.com, coolbetchile.info, coolbetchile.net, coolbetchile.top | apuestacoolbet.com |
| Estelarbet | estelar-bet.cl, estelarbet.cl | estelar.bet |
| Juega en Linea | juegaenlineachile.bet, juegaenlineachile.com, juegaenlineachile.net, juegaenlineachile.org | juegaenlineachile.net |
| KTO | kto.bet.br | kto.bet.br |
| Latamwin | aguasanjoaquin.cl, latamwin-cl.cl, latamwin.online | latamwin.online |
| Marathonbet | marathonbet.cl, marathonbet.com | marathonbet.es |
| Mi Casino | micasino.com, micasinocl.com, micasinoenvivo.com, micasinoscl.com | micasinochileoficial.com |
| Rivalo | rivalo-chile.com | rivalo.co |
| RojaBet | blog.rojabet.com, rojabet.cl, rojabet.com | rojabet2.com |
| Rushbet | rushbet.co | rushbet.es |
| Sportingbet | sportingbet.com | sportingbet.com |

**Once dominios aparecen en las dos olas**: `be.betcris.com`, `bet365.es`, `betcris.com`,
`betplay-chile.com`, `betwarrior.bet.ar`, `betway.com`, `bodog-cl.com`, `juegaenlineachile.net`,
`kto.bet.br`, `latamwin.online`, `sportingbet.com`. Por eso 101 registros corresponden a 90
dominios distintos.

**`aguasanjoaquin.cl`** figura bajo Latamwin pero es el dominio de una empresa sanitaria chilena.
No lo trates como propiedad del operador ni lo uses como semilla de marca.

---

## DATOS FIJOS — TERCERA OLA (02-10-2026): PRESENTACIÓN ANTE LA SCJ

### Base legal y trazabilidad

Esta ola se presenta por una vía distinta de las dos anteriores: no es una denuncia directa a la
Corte Suprema, sino un reporte a la **Superintendencia de Casinos de Juego (SCJ)** dentro del
procedimiento de cumplimiento de una orden ya dictada. La cadena completa, que debe citarse íntegra
en cualquier informe que incluya estas URLs:

| Hito | Fecha | Detalle |
|---|---|---|
| Sentencia de la Excma. Corte Suprema | 29-09-2025 | Dictada en el recurso de protección interpuesto por Lotería de Concepción. Ordena a las empresas prestadoras de servicios de internet dejar de transmitir y promover apuestas deportivas y juegos de azar explotados comercialmente por plataformas que, en los términos del fallo, "no cuenten con autorización legal de la autoridad competente". |
| Sentencia de la I. Corte de Apelaciones de Santiago | **07-08-2026** | Dictada con el objeto de dar cumplimiento a la sentencia de la Corte Suprema de 29-09-2025. |
| Presentación **GG N°60.2026** | **19-08-2026** | Presentación mediante la cual se obtiene la sentencia de cumplimiento anterior. |
| Procedimiento informado por SUBTEL | — | Contempla informar a la Superintendencia de Casinos los dominios, subdominios, redirecciones o sitios derivados que se estimen asociados a los sitios web comprendidos en la sentencia y que, a juicio del informante, incumplan lo ordenado en ella. |
| Reporte SCJ **N° 49916** | **02-10-2026 10:44** | Formulario **R11 "Validación de plataformas de apuesta en línea"**, Solicitud N° 1005. Presentado por Demian Arancibia. Sujeto obligado: Lotería de Concepción y Polla Chilena de Beneficencia. Estado: acepta tramitación digital. |

Consecuencia operativa para el informe: a diferencia de las olas 1 y 2, aquí **sí existe una orden
judicial vigente dirigida a las ISP**, y el formulario R11 es el canal por el que se informan los
derivados que la incumplen. Lo que la tercera ola documenta no es "este sitio fue denunciado", sino
"este sitio sigue respondiendo pese a la orden". Esa diferencia es la que hace útil la sección de
contraste de la SALIDA 1.

### Dominios reportados el 02-10-2026

20 bloques de dominio en el formulario, 20 marcas, 21 registros (Betcris aporta dominio y
subdominio). **10 ya figuraban** en las olas 1 o 2; **11 son dominios nuevos**.

`estado_observado` reproduce lo que el campo *Detalle* del formulario consigna para cada marca.

| Marca | Dominio | Subdominio | URL reportada | Denuncia previa | estado_observado (02-10-2026) |
|---|---|---|---|---|---|
| 1xBet | 1xbetchil.com | — | `https://1xbetchil.com/es` | 14-09-2026 | Nuevo dominio de marca (ver discrepancias) |
| Bet365 | bet365.es | — | `https://www.bet365.es/#/HO/` | 28-08 y 14-09 | Activo |
| Betano | betanosports.com | — | `https://www.betanosports.com` | — | Nuevo dominio de marca |
| Betcris | betcris.com | be.betcris.com | `https://www.betcris.com` · `https://be.betcris.com/sportsbook/category/flat/FCE76739-FFAC4FFC-94D0-EEEE19F837FB` | 28-08 y 14-09 | Activo; ofrece medios de pago chilenos; redirige al subdominio de juego |
| BetPlay | betplay.io | betplay.io | `https://betplay.io/es/` | — | Nuevo dominio de marca |
| Betsala | betsala12.com | — | `https://www.betsala12.com` | — | Nuevo dominio de marca |
| Betsson | betsson1003.com | — | `https://www.betsson1003.com/cl` | — | Nuevo dominio de marca |
| BetWarrior | betwarrior.bet | — | `https://betwarrior.bet` | 28-08-2026 | Activo; redirige a un descargo del propio operador, no al descargo estándar de las telco que cita el fallo |
| Betway | betway.com | — | `https://betway.com/g/es/sports` | 28-08 y 14-09 | Activo |
| Bodog | ozoon.eu | — | `https://www.ozoon.eu/login` | — | Activo; sitio rebrandeado de Bodog |
| bwin | bwin.es | — | `https://www.bwin.es/es/sports` | 28-08-2026 | Activo; redirige a un descargo del propio operador, no al descargo estándar de las telco que cita el fallo |
| Coolbet | juegacoolbet.com | — | `https://www.juegacoolbet.com/cl/deportes/recommendations` · `/cl/registrarse` | — | Activo; carga diferida, requiere ventana del navegador activa ≥30 s |
| Epicbet | epicbet1.com | — | `https://epicbet1.com/es/deportes` | — | Activo (ver discrepancias: campo `Dominio` sin TLD) |
| Estelarbet | estelarbet1.cl | — | `https://estelarbet1.cl` | — | Activo |
| Juega en Linea | jelchile.com | — | `https://www.jelchile.com` | — | Activo; versión para Chile |
| Latamwin | latamwin.online | — | `https://latamwin.online` | 28-08 y 14-09 | Activo; carga diferida, requiere ventana del navegador activa ≥30 s |
| Mi Casino | oficialmicasino.com | — | `https://oficialmicasino.com` | — | Activo |
| Novibet | novibet2.com | lat.novibet2.com | `https://lat.novibet2.com/casino` · `https://lat.novibet2.com/apuestasdeportivas` | — | Activo, dominio y subdominio |
| Rivalo | rivalo.co | — | `https://www.rivalo.co/es/sportsbook` | 14-09-2026 | Activo |
| RojaBet | rojabet2.com | — | `https://rojabet2.com/es-es` | 14-09-2026 | Activo |

**Los 10 dominios ya denunciados que la presentación reporta como activos o con descargo
incorrecto**: `1xbetchil.com`, `bet365.es`, `betcris.com` (+ `be.betcris.com`), `betwarrior.bet`,
`betway.com`, `bwin.es`, `latamwin.online`, `rivalo.co`, `rojabet2.com`. Son el núcleo de la brecha
de cumplimiento y deben aparecer siempre en la sección de contraste, los detecte o no el export.

**Acumulado de las tres olas**: 101 dominios distintos, 122 registros de denuncia o reporte,
25 marcas denunciadas.

### Dos marcas cambian de población

`Epicbet` y `Novibet` figuraban en la lista de seguimiento sin denuncia registrada. Con esta
presentación pasan a **`Denunciada`** para efectos de la regla 6. La lista de seguimiento baja de
31 a 29 marcas y las denunciadas suben de 23 a 25.

### Discrepancias de la presentación

Déjalas consignadas en la sección de límites del informe; no las corrijas en silencio.

- **`1xbetchil.com`** aparece descrito como "nuevo dominio de marca 1xbet", pero ya figuraba en la
  ola del 14-09-2026. Es un re-reporte, no un hallazgo nuevo.
- **Epicbet**: el campo `Dominio` del formulario dice `epicbet`, sin TLD. El dominio real sale del
  redireccionamiento: `epicbet1.com`. Usa ese.
- **`ozoon.eu`** se atribuye a Bodog por rebranding, sin token de marca compartido. La atribución
  viene de la verificación manual del formulario, no de la cadena `Source`. No la reproduzcas como
  si fuera linaje técnico ni la uses como semilla para generar tokens de marca.
- El formulario trae **cinco bloques `Campo / Valor` vacíos** antes de los 20 poblados. Son
  estructura del formulario, no dominios omitidos. Si cuentas bloques, cuenta 20.
- Dominio de seguimiento contra dominio reportado, además de los casos ya conocidos:
  Epicbet (`epicbet.com` en seguimiento, `epicbet1.com` reportado) · Novibet (`cl.novibet.com` vs
  `novibet2.com`) · BetPlay (`betplay.com.co` en seguimiento, `betplay-chile.com` denunciado,
  `betplay.io` reportado) · Bodog (`bodog.com` denunciado, `ozoon.eu` reportado).

---

## DATOS FIJOS — MARCAS MONITOREADAS SIN DENUNCIA REGISTRADA

Marcas de la lista de seguimiento de Polla que **no** figuran en ninguna de las tres olas de
denuncia. Se procesan igual que las anteriores, pero se reportan por separado y se marcan como
`Sin denuncia previa`: para estas marcas lo que se propone no es sumar una réplica a una denuncia
existente, sino abrir una primera denuncia. **29 marcas** (Epicbet y Novibet salieron de esta lista
con la presentación del 02-10-2026).

| Marca | Dominio de referencia |
|---|---|
| PlaySala | `playsala.com` |
| WinChile | `winchile.com` |
| Poker en Chile | `pokerenchile.com` |
| Betting Is Cool | `bettingiscool.com` |
| Fortunazo | `fortunazo.cl` |
| Jugabet | `jugabet.cl` |
| State77 | `state77.com` |
| Bet7K | `cl.bet7k.com` |
| Respin | `respin.com` |
| Doradobet | `doradobet.com` |
| PokerStars | `pokerstars.com` |
| GGPoker | `ggpoker.com` |
| LeoVegas | `leovegas-chile.cl` |
| Roobet | `roobet.com` |
| 1Win | `1win.com` |
| TheLotter | `thelotter.com` |
| TonyBet | `tonybet.cl, tonybet.com` |
| Apuestas Royal | `apuestasroyal.com` |
| Stake | `stake.com` |
| BC Game | `bc.game` |
| Rabona | `rabona.com` |
| Pin-Up | `pin-up.world` |
| MelBet | `melbet.com` |
| TikiTaka | `tikitaka.com` |
| BetFury | `betfury.io` |
| Jackpot City Casino | `jackpotcitycasino.com` |
| Juega con el King | `juegaconelking.com` |
| Casino Nano | `casinonano.com` |
| Naya Fácil Casino | `nayafacil-903.com` |

**Entidades corporativas, no marcas de consumo.** `skillonnet.com`, `418services.com` y
`baytreeinteractive.com` aparecen en la lista de seguimiento pero son sociedades operadoras, no
sitios de cara al público. No las uses como semilla para buscar réplicas ni generes tokens de marca
a partir de ellas: producirían falsos positivos. Si el export detecta marcas de consumo que operan
bajo ellas, atribúyelas a la marca de consumo y deja constancia de que la lista de origen no
documenta qué marcas operan. Lo mismo aplica a `kaizengaming.com`, que es la sociedad detrás de
Betano.

**Discrepancias entre la lista de seguimiento y la tabla de denuncias.** El dominio de referencia de
la lista de seguimiento no siempre coincide con el denunciado. Trabaja sobre el token de marca, no
sobre el dominio literal, y deja constancia de estos casos: Rivalo (`rivalo.com` en seguimiento,
`rivalo.co` denunciado) · KTO (`kto.com/cl` vs `kto.bet.br`) · bwin (`bwin.cl` vs `bwin.es`,
`bwin.com`) · BetPlay (`betplay.com.co` vs `betplay-chile.com`) · Bet365 (la lista incluye
`bet365.chile`, que no es un dominio válido: `.chile` no existe como TLD).

---

## SALIDA 1 — INFORME (Markdown)

Corto. Sin portada, sin relleno, sin secciones que no sirvan para decidir un bloqueo.

**1. Resumen (media página)**
- Cuántas URLs nuevas se proponen para bloqueo, de cuántas marcas.
- Desglose por relevancia (Alta / Media / Baja).
- Cuántas de las URLs propuestas están pendientes de revisión.
- Las tres marcas con más réplicas nuevas.
- Cuántos de los 20 dominios de la presentación del 02-10-2026 aparecen en el export.
- Una línea: cuántos registros se evaluaron y cuántos quedaron fuera, y por qué.

**2. Contraste con la presentación del 02-10-2026** — tabla única con **las 20 filas** de la
tercera ola, en el orden de la tabla incrustada arriba. Ninguna se omite, aunque el export no la
traiga. Encabeza la sección con la cadena legal completa en dos o tres líneas: sentencia de la
Corte Suprema de 29-09-2025, sentencia de la I. Corte de Apelaciones de Santiago de **07-08-2026**
obtenida mediante la presentación **GG N°60.2026** de **19-08-2026**, y reporte SCJ N° 49916 del
02-10-2026.

> | URL reportada | Dominio | Marca | Denuncia previa | Estado observado 02-10-2026 | En el export de Detect |
> |---|---|---|---|---|---|

`Denuncia previa` toma `28-08-2026`, `14-09-2026`, ambas, o `Sin denuncia previa`.

`En el export de Detect` toma exactamente uno de estos cuatro valores:

| Valor | Cuándo |
|---|---|
| `Detectado` | El export trae el mismo dominio registrable y la misma URL. |
| `Detectado con otra URL` | Mismo dominio registrable, ruta o subdominio distintos. Pon la URL del export. |
| `No detectado` | El dominio registrable no aparece en el export. |
| `Verificación divergente` | Aparece en el export sin contenido de juego o marcado como caído, pero la presentación lo reporta activo. Aplica la regla 8. |

Cierra la sección con tres cifras: cuántos de los 20 detectó el export, cuántos no, y cuántos de
los 10 ya denunciados siguen reportados como activos.

**3. Marcas denunciadas** — una sección por marca, ordenadas por número de URLs propuestas, de
mayor a menor. Cada una:

> ### Marca
>
> **Ya denunciados** — 28-08-2026: `dominio, dominio…` · 14-09-2026: `dominio, dominio…` ·
> 02-10-2026 (SCJ): `dominio, dominio…`
>
> **Propuestos para bloqueo**
>
> | URL | Dominio | Relevancia | Motivo | Detectado |
> |---|---|---|---|---|

El **motivo** es una de estas, siempre explícita: réplica numerada · rotación de TLD · marca más
afijo · marca embebida · acrónimo de marca · error tipográfico (typosquat) · página clonada ·
redirección · rebranding.

- **acrónimo de marca**: el dominio usa una abreviatura del nombre, no el token completo. Ejemplo
  de la tercera ola: `jelchile.com` por Juega En Línea.
- **rebranding**: el sitio sirve la operación de una marca conocida bajo un nombre sin relación
  léxica. Ejemplo: `ozoon.eu` por Bodog. Exige evidencia de contenido o de redirección, nunca
  parecido de nombre. Si la evidencia no está en el export, no uses este motivo.

Si una marca no tiene réplicas nuevas, dilo en una línea en vez de rellenar la tabla.

**4. Marcas sin denuncia previa** — mismo formato, sin la línea de "Ya denunciados", precedido de
una frase que diga cuántas marcas de la lista de seguimiento tienen actividad detectada y cuántas
no. Estas requieren una primera denuncia. Son 29 marcas.

**5. Sitios legítimos comprometidos** — tabla aparte, con la advertencia del punto 3 de las reglas.

**6. Límites** — máximo media página:
- Un registro pendiente de revisión está sin validar, no descartado.
- El alcance se limita a las marcas de las tablas incrustadas (25 denunciadas + 29 en
  seguimiento); la actividad fuera de esas marcas no está evaluada y no aparece aquí. Di cuánta es.
- Las discrepancias de la presentación del 02-10-2026 que apliquen a lo reportado.
- Dominios con `Verificación divergente` y por qué la regla 8 impide descartarlos.
- Duplicados, registros vacíos o mal formados del export: cuántos y qué se hizo con ellos.

---

## SALIDA 2 — CSV (propuestas de bloqueo)

UTF-8 con BOM. Una fila por URL. Ordenado por relevancia (Alta primero), luego marca, luego
dominio.

**Columnas:** `marca`, `estado_marca`, `url`, `dominio`, `relevancia`, `motivo`, `fuente`,
`estado_revision`, `detectado`

`estado_marca` toma los valores `Denunciada` o `Sin denuncia previa` (regla 6).

Contiene exactamente las URLs propuestas en el informe. Ni una más. Ningún dominio de las tres olas.

---

## SALIDA 3 — CSV (contraste con la presentación del 02-10-2026)

UTF-8 con BOM. **Exactamente 20 filas**, en el orden de la tabla incrustada. Es el respaldo
tabular de la sección 2 del informe.

**Columnas:** `marca`, `dominio`, `subdominio`, `url_reportada`, `denuncia_previa`,
`estado_observado`, `en_export_detect`, `url_detect`, `relevancia`

---

## VERIFICACIÓN ANTES DE ENTREGAR

- [ ] Ninguna aparición de ilegal / ilícito / con licencia / sin licencia fuera de la nota de
      terminología y de las citas textuales identificadas.
- [ ] El número de filas del CSV de propuestas coincide con el total del resumen.
- [ ] Ningún dominio de ese CSV figura en ninguna de las tres olas (comparado por dominio
      registrable).
- [ ] El CSV de contraste tiene 20 filas, ni una más ni una menos, y las 20 aparecen también en la
      sección 2 del informe.
- [ ] Los 10 dominios ya denunciados de la tercera ola aparecen en la sección de contraste aunque el
      export no los traiga.
- [ ] Ninguna URL sin motivo declarado ni sin `estado_marca`.
- [ ] Ninguna marca atribuida a `skillonnet.com`, `418services.com`, `baytreeinteractive.com` o
      `kaizengaming.com` como si fueran marcas de consumo.
- [ ] Epicbet y Novibet tratadas como `Denunciada`, no como seguimiento.
- [ ] El motivo `rebranding` sólo se usa con evidencia de contenido o redirección en el export.
- [ ] Ninguna afirmación de que un dominio está bloqueado. Denuncia, orden y observación son tres
      cosas distintas (regla 7).
- [ ] La cadena legal (29-09-2025 · 07-08-2026 · GG N°60.2026 de 19-08-2026 · SCJ N° 49916 de
      02-10-2026) citada completa al abrir la sección 2.
- [ ] Ninguna URL inventada: todas provienen del export o de la tabla de la tercera ola.
- [ ] Revisión manual de 10 registros contra su `LLM Reasoning`. La confusión español/portugués es
      el error más probable.
- [ ] Presentar todos los archivos generados — un archivo escrito y no presentado es inalcanzable.
