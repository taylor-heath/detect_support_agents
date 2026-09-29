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
2. **Lista de dominios ya denunciados** — está incrustada más abajo en este mismo prompt. No hace
   falta ningún archivo adicional.

Lee el export desde disco antes de escribir nada. Si falta, detente y pregunta.

---

## REGLAS

**1. Terminología.** La única distinción de contenido permitida es **juego / no juego**. No uses
"ilegal", "ilícito", "no autorizado", "con licencia" ni sinónimos para calificar un sitio o un
operador. El campo `Status` del export trae una etiqueta de legalidad: renómbrala a `Juego` y dilo
una vez en el método, para que los recuentos sigan cuadrando con el archivo original. El informe no
determina la situación legal de ningún sitio y nadie debe inferirla de su inclusión aquí.

**2. Atribución a la marca.** El campo `Source` codifica el linaje como `Variant (dominio.padre)` o
`Redirect (dominio.padre)`. Resuelve la cadena hasta la raíz (con control de ciclos) y atribuye cada
dominio a **la marca raíz**, no al padre inmediato. `Google Search`, `Youtube` y `Manual` son
métodos de descubrimiento, no linaje.

**3. Descarta lo que no se puede bloquear.** Fuera del informe:
- Infraestructura compartida: CDN, hosting, ISP, registradores, analítica (Akamai, Cloudflare, AWS,
  OVH, Contabo, `hosted-by-*`, Google y similares). Bloquearlas rompe servicios ajenos.
- Dominios que ya figuran en la lista de denunciados incrustada abajo (compara por dominio
  registrable: `m.betsala11.com` cuenta como `betsala11.com`).
- Dominios institucionales o comerciales legítimos que sirven contenido de juego. Indican
  compromiso del sitio o colocación pagada, no propiedad del operador. Van en una lista aparte al
  final del informe, con la advertencia de que requieren notificación y retiro, no orden de bloqueo.

**4. Relevancia para Chile.** Tres niveles, en este orden:

| Nivel | Criterio |
|---|---|
| **Alta** | Termina en `.cl`, o el nombre contiene `chile`, `chil`, `cl`, `latam` o `lat`, o el contenido cita Chile, pesos chilenos o ciudades chilenas |
| **Media** | Sufijo genérico alcanzable desde Chile (`.com`, `.net`, `.bet`, `.vip`, `.app`, `.top`, `.online`, `.casino`, `.xyz`) con contenido en español |
| **Baja** | ccTLD o moneda de otro mercado (`.mx`, `.pe`, `.co`, `.ar`, `.es`, `.br`, `.de`, `.za`) |

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
| `Denunciada` | La marca figura en la tabla de denuncias incrustada abajo. Lo propuesto es una réplica nueva que se suma a un expediente ya abierto. |
| `Sin denuncia previa` | La marca solo figura en la lista de seguimiento. Requiere una primera denuncia, no una ampliación. |

Las dos poblaciones se reportan en secciones separadas y nunca se mezclan en la misma tabla.

---

## DATOS FIJOS — DOMINIOS YA DENUNCIADOS

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

## DATOS FIJOS — MARCAS MONITOREADAS SIN DENUNCIA REGISTRADA

Marcas de la lista de seguimiento de Polla que **no** figuran en ninguna de las dos olas de
denuncia. Se procesan igual que las anteriores, pero se reportan por separado y se marcan como
`Sin denuncia previa`: para estas marcas lo que se propone no es sumar una réplica a una denuncia
existente, sino abrir una primera denuncia. 31 marcas.

| Marca | Dominio de referencia |
|---|---|
| PlaySala | `playsala.com` |
| WinChile | `winchile.com` |
| Poker en Chile | `pokerenchile.com` |
| Betting Is Cool | `bettingiscool.com` |
| Fortunazo | `fortunazo.cl` |
| Jugabet | `jugabet.cl` |
| Novibet | `cl.novibet.com` |
| State77 | `state77.com` |
| Bet7K | `cl.bet7k.com` |
| Epicbet | `epicbet.com` |
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
- Una línea: cuántos registros se evaluaron y cuántos quedaron fuera, y por qué.

**2. Marcas denunciadas** — una sección por marca, ordenadas por número de URLs propuestas, de
mayor a menor. Cada una:

> ### Marca
>
> **Ya denunciados** — 28-08-2026: `dominio, dominio…` · 14-09-2026: `dominio, dominio…`
>
> **Propuestos para bloqueo**
>
> | URL | Dominio | Relevancia | Motivo | Detectado |
> |---|---|---|---|---|

El **motivo** es una de estas, siempre explícita: réplica numerada · rotación de TLD · marca más
afijo · marca embebida · error tipográfico (typosquat) · página clonada · redirección.

Si una marca no tiene réplicas nuevas, dilo en una línea en vez de rellenar la tabla.

**3. Marcas sin denuncia previa** — mismo formato, sin la línea de "Ya denunciados", precedido de
una frase que diga cuántas marcas de la lista de seguimiento tienen actividad detectada y cuántas
no. Estas requieren una primera denuncia.

**4. Sitios legítimos comprometidos** — tabla aparte, con la advertencia del punto 3 de las reglas.

**5. Límites** — máximo media página:
- Un registro pendiente de revisión está sin validar, no descartado.
- El alcance se limita a las marcas de las dos tablas incrustadas (23 denunciadas + 31 en
  seguimiento); la actividad fuera de esas marcas no está evaluada y no aparece aquí. Di cuánta es.
- Duplicados, registros vacíos o mal formados del export: cuántos y qué se hizo con ellos.

---

## SALIDA 2 — CSV

UTF-8 con BOM. Una fila por URL. Ordenado por relevancia (Alta primero), luego marca, luego
dominio.

**Columnas:** `marca`, `estado_marca`, `url`, `dominio`, `relevancia`, `motivo`, `fuente`,
`estado_revision`, `detectado`

`estado_marca` toma los valores `Denunciada` o `Sin denuncia previa` (regla 6).

Contiene exactamente las URLs propuestas en el informe. Ni una más.

---

## VERIFICACIÓN ANTES DE ENTREGAR

- [ ] Ninguna aparición de ilegal / ilícito / con licencia / sin licencia fuera de la nota de
      terminología.
- [ ] El número de filas del CSV coincide con el total del resumen.
- [ ] Ningún dominio del CSV figura en la tabla de denunciados (comparado por dominio registrable).
- [ ] Ninguna URL sin motivo declarado ni sin `estado_marca`.
- [ ] Ninguna marca atribuida a `skillonnet.com`, `418services.com`, `baytreeinteractive.com` o
      `kaizengaming.com` como si fueran marcas de consumo.
- [ ] Ninguna URL inventada: todas provienen del export.
- [ ] Revisión manual de 10 registros contra su `LLM Reasoning`. La confusión español/portugués es
      el error más probable.
- [ ] Presentar todos los archivos generados — un archivo escrito y no presentado es inalcanzable.
