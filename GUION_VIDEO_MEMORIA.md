# Guion de video: Memoria y algoritmos de reemplazo

Este guion arranca como una continuación natural de la parte que expuso David sobre procesos y planificación de CPU. Está pensado para durar entre 5 y 6 minutos a un ritmo cómodo (alrededor de 140 a 150 palabras por minuto en español).

Cada bloque incluye:
- Tiempo aproximado.
- Lo que debes mostrar en pantalla.
- El texto a narrar (lo que va entre comillas se lee tal cual).

---

## Bloque 1. Transición desde la parte de David (00:00 – 00:25)

En pantalla: el simulador con el módulo de Procesos visible (el último que cubrió David). Después navega al módulo de Memoria en la barra lateral.

Narración:

"Gracias David. Hasta aquí ya vimos cómo el simulador captura procesos y cómo los planifica en la CPU. Ahora me toca a mí mostrarles la otra mitad del sistema operativo: la gestión de memoria. Voy a recorrer dos módulos que también están en el modo libre, el módulo de Memoria y el de Reemplazo de páginas, y voy a explicar qué algoritmos están implementados y cómo funciona cada uno."

---

## Bloque 2. Qué está implementado en el módulo de Memoria (00:25 – 01:15)

En pantalla: módulo de Memoria abierto. Resalta el panel de Configuración, las tarjetas de marcos, el mapa de memoria y, si hay procesos cargados, la tabla de páginas.

Narración:

"El módulo de Memoria implementa el modelo de paginación. En el panel de configuración se define el tamaño total de la memoria física en kilobytes y el tamaño de página, también en kilobytes. El simulador divide automáticamente la memoria entre el tamaño de página y nos dice cuántos marcos quedan disponibles. Por ejemplo, con 64 kilobytes de memoria y páginas de 4, obtenemos 16 marcos."

"Cuando presiono Asignar páginas, el simulador toma los procesos que ya estaban capturados y reparte sus páginas entre los marcos. En el mapa de memoria cada marco se pinta con el color del proceso que lo ocupa y se etiqueta con el identificador del proceso y el número de página. Las tarjetas de arriba muestran cuántos marcos hay en total, cuántos están usados, cuántos libres y la fragmentación interna en kilobytes, que aparece cuando la última página de un proceso no se llena por completo. Más abajo está la tabla de páginas: aquí se selecciona un proceso y se ve, página por página, en qué marco quedó. Esa es exactamente la estructura que el sistema operativo consultaría para traducir direcciones virtuales a físicas."

---

## Bloque 3. Qué está implementado en el módulo de Reemplazo (01:15 – 02:00)

En pantalla: navega al módulo de Reemplazo. Abre el selector de algoritmo para que se vean las cinco opciones. Ajusta los marcos a 3 y presiona Ejecutar.

Narración:

"El módulo de Reemplazo aborda la pregunta natural que sigue: ¿qué pasa cuando hay más páginas que marcos? Aquí el simulador implementa cinco algoritmos clásicos: FIFO, LRU, Óptimo, Reloj y Segunda Oportunidad. La cadena de referencias no la inventamos, sino que se genera automáticamente a partir de la ráfaga y del número de páginas de cada proceso, con un patrón que simula localidad temporal."

"Cuando elijo un algoritmo, fijo el número de marcos y presiono Ejecutar, el simulador resuelve toda la cadena paso a paso. En el panel principal se ve el estado de los marcos, qué proceso pidió qué página, si fue acierto en verde o fallo en rojo, y cuál fue la página expulsada cuando hubo que hacer espacio. La línea de tiempo de abajo permite saltar a cualquier paso, y los controles de reproducción animan la simulación a la velocidad que se quiera. Al final aparecen las métricas: total de referencias, fallos, porcentaje de aciertos y el desglose de cada fallo."

---

## Bloque 4. FIFO (02:00 – 02:30)

En pantalla: con el algoritmo FIFO seleccionado, avanza dos o tres pasos hasta que ocurra una expulsión.

Narración:

"El primero es FIFO, primero en entrar, primero en salir. La idea es la más sencilla posible: cuando hay que reemplazar una página, se elige la que lleva más tiempo cargada en memoria, sin importar cuándo se usó por última vez. Internamente se mantiene una cola, y al expulsar siempre sale la que está al frente. Su ventaja es que es muy barato de implementar; su desventaja es que puede expulsar páginas que el proceso seguía usando, y además sufre la anomalía de Belady: en algunos casos aumentar el número de marcos aumenta los fallos en lugar de reducirlos."

---

## Bloque 5. LRU (02:30 – 03:00)

En pantalla: cambia el algoritmo a LRU, vuelve a ejecutar y compara visualmente el número de fallos contra FIFO.

Narración:

"El segundo es LRU, menos recientemente usado. En lugar de mirar cuándo se cargó cada página, mira cuándo se usó por última vez y expulsa la que lleva más tiempo sin tocarse. Se basa en el principio de localidad: si una página se usó hace poco, lo más probable es que se vuelva a usar pronto. En el simulador, cada acceso actualiza un contador interno, y al expulsar se toma la página con el contador más antiguo. LRU se acerca mucho al óptimo y, a diferencia de FIFO, no sufre la anomalía de Belady."

---

## Bloque 6. Óptimo (03:00 – 03:30)

En pantalla: cambia el algoritmo a Óptimo, vuelve a ejecutar y muestra la baja en el número de fallos.

Narración:

"El tercero es el algoritmo Óptimo, también conocido como algoritmo de Belady. Su regla es la más simple de enunciar: expulsar la página que no se va a usar durante el mayor tiempo en el futuro. En el simulador esto es posible porque generamos toda la cadena de referencias antes de empezar, así que el algoritmo puede mirar hacia adelante. En un sistema operativo real es imposible aplicarlo, porque nadie conoce el futuro. Lo usamos como referencia teórica: ningún otro algoritmo puede dar menos fallos que este sobre la misma cadena."

---

## Bloque 7. Reloj (03:30 – 04:15)

En pantalla: cambia a Reloj y vuelve a ejecutar. Muestra los marcos y resalta los bits R que aparecen debajo de cada uno.

Narración:

"El cuarto es Reloj, una aproximación eficiente de LRU. La idea es que cada marco tiene un bit de referencia, llamado R, que se pone en uno cada vez que la página se accede. Las páginas se imaginan en un círculo y un puntero recorre ese círculo cuando hay que reemplazar. Si el puntero encuentra una página con R en cero, esa es la víctima; si la encuentra con R en uno, le da una segunda oportunidad: pone su bit a cero y pasa a la siguiente. En el simulador este bit es visible: cada marco muestra debajo su valor de R, así que se puede seguir paso a paso por qué el algoritmo eligió tal o cual página. Reloj logra casi la misma calidad que LRU pero a una fracción del costo, por eso es la base de la mayoría de los sistemas reales."

---

## Bloque 8. Segunda Oportunidad (04:15 – 04:50)

En pantalla: cambia a Segunda Oportunidad, ejecuta y avanza unos pasos.

Narración:

"El quinto es Segunda Oportunidad, que es básicamente FIFO con un detalle extra. Cuando toca expulsar la página al frente de la cola, primero se revisa su bit R: si está en cero, se expulsa como en FIFO normal; si está en uno, se le perdona, se pone su bit a cero y se manda al final de la cola. Conceptualmente hace lo mismo que Reloj, pero la diferencia es que Reloj evita mover físicamente las páginas, mientras que Segunda Oportunidad sí las reordena en la cola. Es una mejora clara sobre FIFO sin cambiar mucho su estructura."

---

## Bloque 9. Cierre (04:50 – 05:30)

En pantalla: muestra el panel de métricas y abre el desplegable "¿Cómo se calcularon estas métricas?". Termina volviendo al selector de algoritmo para resaltar la idea de comparar.

Narración:

"En todos los algoritmos las métricas se calculan igual: la tasa de fallos es fallos entre referencias por cien, y la tasa de aciertos es uno menos esa tasa. Aquí abajo el simulador explica de dónde sale cada número y lista, paso a paso, qué página entró, en qué marco y cuál tuvo que salir."

"En resumen, el módulo de Memoria nos deja experimentar con la configuración de RAM, el tamaño de página y la fragmentación interna, mientras que el módulo de Reemplazo implementa los cinco algoritmos clásicos sobre la misma carga, paso a paso. Cambiando algoritmo o número de marcos podemos ver de inmediato cómo cada estrategia toma decisiones distintas frente a la misma cadena de referencias. Con esto cerramos la parte de memoria. Gracias."

---

## Notas para grabar

- Antes de empezar la grabación: deja capturados tres o cuatro procesos con páginas variadas (por ejemplo, 4, 6, 5 y 3 páginas). Así la cadena de referencias da fallos y aciertos suficientes para que se note la diferencia entre algoritmos.
- Para que el bloque 5 (LRU) y el bloque 6 (Óptimo) luzcan, conviene fijar el número de marcos en 3 o 4 antes de ejecutar cada algoritmo, y mantener la misma cadena.
- El guion completo ronda las 950 palabras, que da entre 5:30 y 6:00 minutos a ritmo natural. Si necesitas bajar a 5:00 minutos, los bloques más fáciles de recortar son el 8 (Segunda Oportunidad) y la mitad final del 9.
