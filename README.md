# Creador de Logotipos

Aplicación web para construir logotipos tipográficos controlando cada letra de forma individual. Permite combinar fuentes, ajustar la posición o la escala y añadir efectos visuales para crear identidades únicas.

## Características

- Texto dividido por líneas personalizables con control de tracking, desplazamiento vertical, espaciado interlineal y alineación.
- Edición letra por letra del carácter mostrado, la fuente, peso, estilo, color de relleno, contorno, opacidad y textura (degradados y patrones).
- Transformaciones avanzadas por carácter: posición X/Y, rotación, inclinación, escalas independientes y kerning.
- Efectos de sombra configurable (offset, blur y color) por letra.
- Control del tamaño del lienzo (ancho y alto) aplicado tanto a la vista previa como a las exportaciones.
- Exportación del resultado como imagen PNG o como SVG vectorial con un solo clic.

## Uso

1. Abre `index.html` en tu navegador o sirve la carpeta mediante un servidor estático (`python -m http.server`).
2. Escribe tus líneas de texto en el panel izquierdo; añade o elimina líneas según sea necesario.
3. Haz clic sobre cualquier letra en la vista previa para acceder a todos sus controles: carácter, tipografía, color, transformaciones y efectos.
4. Ajusta los controles hasta conseguir la composición deseada. Usa el botón **Restablecer** para volver a los valores por defecto de la letra o del logotipo completo.
5. Ajusta el ancho y alto del lienzo antes de exportar si necesitas un formato específico.
6. Pulsa **Descargar PNG** para una imagen rasterizada o **Descargar SVG** para un archivo vectorial.

## Desarrollo

El proyecto no necesita compilación ni bundlers. Todos los estilos y scripts se cargan de forma local (salvo Google Fonts, html2canvas y dom-to-image para la exportación).

## Capturas

![Interfaz del creador de logotipos](artifacts/logo-preview.png)
