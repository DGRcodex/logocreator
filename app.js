const fonts = [
  { label: "Montserrat (Sans)", value: "'Montserrat', sans-serif" },
  { label: "Fira Sans", value: "'Fira Sans', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Staatliches", value: "'Staatliches', cursive" },
  { label: "Bebas Neue", value: "'Bebas Neue', sans-serif" },
  { label: "Playfair Display (Serif)", value: "'Playfair Display', serif" },
  { label: "Roboto Slab", value: "'Roboto Slab', serif" },
  { label: "Source Serif Pro", value: "'Source Serif Pro', serif" }
];

const textureOptions = [
  { label: "Color sólido", value: "solid" },
  { label: "Degradado cálido", value: "gradient-warm" },
  { label: "Degradado frío", value: "gradient-cool" },
  { label: "Textura granulada", value: "grain" },
  { label: "Textura rayas", value: "stripes" },
  { label: "Textura puntos", value: "dots" },
  { label: "Metal pulido", value: "metal" }
];

const DEFAULT_CANVAS = {
  width: 960,
  height: 540
};

const CANVAS_LIMITS = {
  width: { min: 240, max: 2000 },
  height: { min: 240, max: 2000 }
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const createLetter = (char = "") => ({
  char,
  fontFamily: fonts[0].value,
  fontWeight: 600,
  fontStyle: "normal",
  fillColor: "#f5f5f5",
  strokeColor: "#000000",
  strokeWidth: 0,
  opacity: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  marginRight: 0,
  textStyle: "solid",
  shadow: {
    enabled: false,
    offsetX: 6,
    offsetY: 6,
    blur: 18,
    color: "rgba(0,0,0,0.4)"
  }
});

const createLine = (text = "Logo Creativo") => ({
  text,
  tracking: 0,
  baselineShift: 0,
  lineGap: 26,
  align: "center",
  letterData: Array.from(text).map((char) => createLetter(char))
});

const logoState = {
  lines: [createLine()],
  selected: null,
  canvas: { ...DEFAULT_CANVAS }
};

const lineControls = document.getElementById("lineControls");
const preview = document.getElementById("logoPreview");
const letterControls = document.getElementById("letterControls");
const selectedInfo = document.getElementById("selectedInfo");
const canvasWidthInput = document.getElementById("canvasWidth");
const canvasHeightInput = document.getElementById("canvasHeight");

const addLineBtn = document.getElementById("addLine");
const resetBtn = document.getElementById("resetLogo");
const exportPngBtn = document.getElementById("exportPng");
const exportSvgBtn = document.getElementById("exportSvg");

const ensureLetterDataMatchesText = (line) => {
  const characters = Array.from(line.text);
  const updated = characters.map((char, index) => {
    const existing = line.letterData[index];
    if (existing) {
      return { ...existing, char };
    }
    return createLetter(char);
  });
  line.letterData = updated;
};

const updateLineCharacter = (lineIndex, letterIndex, newChar) => {
  const line = logoState.lines[lineIndex];
  if (!line) return;
  const characters = Array.from(line.text);
  if (letterIndex < 0 || letterIndex >= characters.length) return;
  characters[letterIndex] = newChar;
  line.text = characters.join("");
  const letter = line.letterData[letterIndex];
  if (letter) {
    letter.char = newChar;
  }
  const textInputs = lineControls.querySelectorAll(".line-control input[type=\"text\"]");
  const textInput = textInputs[lineIndex];
  if (textInput) {
    textInput.value = line.text;
  }
};

const renderLineControls = () => {
  lineControls.innerHTML = "";
  logoState.lines.forEach((line, index) => {
    ensureLetterDataMatchesText(line);

    const wrapper = document.createElement("div");
    wrapper.className = "line-control";

    const header = document.createElement("header");
    header.innerHTML = `<span>Línea ${index + 1}</span>`;

    const actions = document.createElement("div");
    actions.className = "header-actions";
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Eliminar";
    removeBtn.className = "danger";
    removeBtn.disabled = logoState.lines.length === 1;
    removeBtn.addEventListener("click", () => removeLine(index));
    actions.append(removeBtn);
    header.append(actions);
    wrapper.append(header);

    const textLabel = document.createElement("label");
    textLabel.innerHTML = `Texto
      <input type="text" value="${line.text.replace(/"/g, "&quot;")}" placeholder="Escribe tu lema" />`;
    const textInput = textLabel.querySelector("input");
    textInput.addEventListener("input", (event) => {
      line.text = event.target.value;
      ensureLetterDataMatchesText(line);
      if (logoState.selected) {
        const { lineIndex, letterIndex } = logoState.selected;
        if (lineIndex === index && letterIndex >= line.letterData.length) {
          logoState.selected = null;
        }
      }
      renderPreview();
      renderControlsForSelected();
    });
    wrapper.append(textLabel);

    const spacingGroup = document.createElement("div");
    spacingGroup.className = "inline-inputs";
    spacingGroup.innerHTML = `
      <label>Tracking
        <input type="range" class="range-input" min="-40" max="80" step="1" value="${line.tracking}" />
      </label>
      <label>Desplazamiento vertical
        <input type="range" class="range-input" min="-120" max="120" step="1" value="${line.baselineShift}" />
      </label>
      <label>Espacio entre líneas
        <input type="range" class="range-input" min="0" max="160" step="2" value="${line.lineGap}" />
      </label>
      <label>Alineación
        <select>
          <option value="flex-start" ${line.align === "flex-start" ? "selected" : ""}>Izquierda</option>
          <option value="center" ${line.align === "center" ? "selected" : ""}>Centro</option>
          <option value="flex-end" ${line.align === "flex-end" ? "selected" : ""}>Derecha</option>
        </select>
      </label>
    `;
    const [trackingInput, baselineInput, gapInput, alignSelect] = spacingGroup.querySelectorAll(
      "input, select"
    );
    trackingInput.addEventListener("input", (event) => {
      line.tracking = Number(event.target.value);
      renderPreview();
    });
    baselineInput.addEventListener("input", (event) => {
      line.baselineShift = Number(event.target.value);
      renderPreview();
    });
    gapInput.addEventListener("input", (event) => {
      line.lineGap = Number(event.target.value);
      renderPreview();
    });
    alignSelect.addEventListener("change", (event) => {
      line.align = event.target.value;
      renderPreview();
    });

    wrapper.append(spacingGroup);
    lineControls.append(wrapper);
  });
};

const buildTransform = (letter, line) => {
  const translateX = letter.offsetX;
  const translateY = letter.offsetY + line.baselineShift;
  return `translate(${translateX}px, ${translateY}px) rotate(${letter.rotation}deg) skewX(${letter.skewX}deg) scale(${letter.scaleX}, ${letter.scaleY})`;
};

const applyTexture = (element, letter) => {
  element.classList.remove("use-background", "texture-grain", "texture-stripes", "texture-dots", "texture-metal");
  element.style.backgroundImage = "";
  element.style.color = letter.fillColor;
  element.style.setProperty("-webkit-text-fill-color", letter.fillColor);

  switch (letter.textStyle) {
    case "gradient-warm":
      element.classList.add("use-background");
      element.style.backgroundImage =
        "linear-gradient(120deg, #ff5f6d 0%, #ffc371 45%, #ff9966 80%)";
      break;
    case "gradient-cool":
      element.classList.add("use-background");
      element.style.backgroundImage =
        "linear-gradient(135deg, #74ebd5 0%, #9face6 50%, #4f7bf8 100%)";
      break;
    case "grain":
      element.classList.add("use-background", "texture-grain");
      element.style.backgroundImage =
        "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(0,0,0,0.65))";
      break;
    case "stripes":
      element.classList.add("use-background", "texture-stripes");
      element.style.backgroundImage = "linear-gradient(135deg, #ffffff, #ff69b4)";
      break;
    case "dots":
      element.classList.add("use-background", "texture-dots");
      element.style.backgroundImage = "linear-gradient(135deg, #ffffff, #33c4ff)";
      break;
    case "metal":
      element.classList.add("use-background", "texture-metal");
      break;
    default:
      break;
  }

  if (letter.textStyle !== "solid") {
    element.style.setProperty("-webkit-text-fill-color", "transparent");
  }
};

const renderPreview = () => {
  preview.style.setProperty("--canvas-width", `${logoState.canvas.width}px`);
  preview.style.setProperty("--canvas-height", `${logoState.canvas.height}px`);
  preview.innerHTML = "";
  logoState.lines.forEach((line, lineIndex) => {
    ensureLetterDataMatchesText(line);

    const lineWrapper = document.createElement("div");
    lineWrapper.className = "line-wrapper";
    lineWrapper.style.setProperty("--line-gap", `${line.lineGap}px`);
    lineWrapper.style.alignSelf = line.align;

    const lineEl = document.createElement("div");
    lineEl.className = "logo-line";
    lineEl.style.letterSpacing = `${line.tracking}px`;

    line.letterData.forEach((letter, letterIndex) => {
      const span = document.createElement("span");
      span.className = "logo-letter";
      span.dataset.lineIndex = lineIndex;
      span.dataset.letterIndex = letterIndex;
      span.textContent = letter.char === " " ? "\u00A0" : letter.char;

      if (letter.char === " ") {
        span.classList.add("space");
      }

      span.style.fontFamily = letter.fontFamily;
      span.style.fontWeight = letter.fontWeight;
      span.style.fontStyle = letter.fontStyle;
      span.style.opacity = letter.opacity;
      span.style.marginRight = `${letter.marginRight}px`;
      span.style.transform = buildTransform(letter, line);
      span.style.setProperty("-webkit-text-stroke", `${letter.strokeWidth}px ${letter.strokeColor}`);
      span.style.textShadow = letter.shadow.enabled
        ? `${letter.shadow.offsetX}px ${letter.shadow.offsetY}px ${letter.shadow.blur}px ${letter.shadow.color}`
        : "none";

      applyTexture(span, letter);

      if (
        logoState.selected &&
        logoState.selected.lineIndex === lineIndex &&
        logoState.selected.letterIndex === letterIndex
      ) {
        span.classList.add("selected");
      }

      span.addEventListener("click", (event) => {
        event.stopPropagation();
        logoState.selected = { lineIndex, letterIndex };
        renderControlsForSelected();
        renderPreview();
      });

      lineEl.append(span);
    });

    lineWrapper.append(lineEl);
    preview.append(lineWrapper);
  });
};

const removeLine = (index) => {
  if (logoState.lines.length === 1) return;
  logoState.lines.splice(index, 1);
  if (logoState.selected && logoState.selected.lineIndex === index) {
    logoState.selected = null;
  }
  renderAll();
};

const renderLetterSelectInfo = () => {
  if (!logoState.selected) {
    selectedInfo.innerHTML = "<p>Selecciona una letra del logotipo para modificarla.</p>";
    letterControls.innerHTML = "";
    return;
  }
  const { lineIndex, letterIndex } = logoState.selected;
  const line = logoState.lines[lineIndex];
  const letter = line.letterData[letterIndex];
  const displayChar = letter.char && letter.char.trim() !== "" ? letter.char : "(espacio)";
  selectedInfo.innerHTML = `<p>Editando: <strong>Línea ${lineIndex + 1}</strong>, letra <strong>“${displayChar}”</strong></p>`;
};

const renderCanvasControls = () => {
  if (document.activeElement !== canvasWidthInput) {
    canvasWidthInput.value = logoState.canvas.width;
  }
  if (document.activeElement !== canvasHeightInput) {
    canvasHeightInput.value = logoState.canvas.height;
  }
};

const updateCanvasDimension = (dimension, rawValue, clampValue = false) => {
  if (rawValue === "" || rawValue === null) return;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    if (clampValue) {
      renderCanvasControls();
    }
    return;
  }
  const limits = CANVAS_LIMITS[dimension];
  let nextValue = clampValue ? clamp(Math.round(parsed), limits.min, limits.max) : Math.round(parsed);
  if (!clampValue && (nextValue < limits.min || nextValue > limits.max)) {
    return;
  }
  logoState.canvas[dimension] = nextValue;
  renderPreview();
  if (clampValue) {
    renderCanvasControls();
  }
};

const buildSelect = (options, value) => {
  const select = document.createElement("select");
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    if (option.value === value) opt.selected = true;
    select.append(opt);
  });
  return select;
};

const createRangeControl = (label, { min, max, step, value, onChange }) => {
  const wrapper = document.createElement("label");
  wrapper.textContent = label;
  const input = document.createElement("input");
  input.type = "range";
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  input.className = "range-input";
  input.addEventListener("input", (event) => onChange(Number(event.target.value)));
  wrapper.appendChild(input);
  return { wrapper, input };
};

const createNumberControl = (label, { min, max, step, value, onChange }) => {
  const wrapper = document.createElement("label");
  wrapper.textContent = label;
  const input = document.createElement("input");
  input.type = "number";
  if (min !== undefined) input.min = min;
  if (max !== undefined) input.max = max;
  input.step = step;
  input.value = value;
  input.addEventListener("input", (event) => onChange(Number(event.target.value)));
  wrapper.appendChild(input);
  return { wrapper, input };
};

const normalizeHexColor = (value) => {
  if (!value) return null;
  let normalized = value.trim();
  if (!normalized) return null;
  if (!normalized.startsWith("#")) {
    normalized = `#${normalized}`;
  }
  const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  if (!hexPattern.test(normalized)) {
    return null;
  }
  if (normalized.length === 4) {
    normalized =
      "#" +
      normalized
        .slice(1)
        .split("")
        .map((char) => char + char)
        .join("");
  }
  return normalized.toLowerCase();
};

const renderControlsForSelected = () => {
  renderLetterSelectInfo();
  if (!logoState.selected) return;

  const { lineIndex, letterIndex } = logoState.selected;
  const line = logoState.lines[lineIndex];
  const letter = line.letterData[letterIndex];

  letterControls.innerHTML = "";

  const typography = document.createElement("div");
  typography.className = "control-group";
  const charLabel = document.createElement("label");
  charLabel.textContent = "Carácter";
  const charInput = document.createElement("input");
  charInput.type = "text";
  charInput.maxLength = 2;
  charInput.value = letter.char;
  charInput.placeholder = "Espacio";
  charInput.addEventListener("input", (event) => {
    if (event.target.value === "") {
      event.target.value = letter.char;
      return;
    }
    const newChar = Array.from(event.target.value).pop();
    event.target.value = newChar;
    updateLineCharacter(lineIndex, letterIndex, newChar);
    renderPreview();
    renderLetterSelectInfo();
  });
  charLabel.append(charInput);
  const charHint = document.createElement("small");
  charHint.textContent = "Escribe un nuevo carácter o pulsa espacio.";
  charLabel.append(charHint);
  const fontLabel = document.createElement("label");
  fontLabel.textContent = "Familia tipográfica";
  const fontSelect = buildSelect(fonts, letter.fontFamily);
  fontSelect.addEventListener("change", (event) => {
    letter.fontFamily = event.target.value;
    renderPreview();
  });
  fontLabel.append(fontSelect);

  const weightRange = createRangeControl("Peso", {
    min: 100,
    max: 900,
    step: 100,
    value: letter.fontWeight,
    onChange: (value) => {
      letter.fontWeight = value;
      renderPreview();
    }
  });

  const styleSelectLabel = document.createElement("label");
  styleSelectLabel.textContent = "Estilo";
  const styleSelect = document.createElement("select");
  [
    { label: "Normal", value: "normal" },
    { label: "Itálica", value: "italic" },
    { label: "Oblicua", value: "oblique" }
  ].forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    if (letter.fontStyle === option.value) opt.selected = true;
    styleSelect.append(opt);
  });
  styleSelect.addEventListener("change", (event) => {
    letter.fontStyle = event.target.value;
    renderPreview();
  });
  styleSelectLabel.append(styleSelect);

  typography.append(charLabel, fontLabel, weightRange.wrapper, styleSelectLabel);

  const colorGroup = document.createElement("div");
  colorGroup.className = "control-group";

  const fillLabel = document.createElement("label");
  fillLabel.textContent = "Color de relleno";
  const fillWrapper = document.createElement("div");
  fillWrapper.className = "color-input-wrapper";
  const fillColor = document.createElement("input");
  fillColor.type = "color";
  fillColor.value = letter.fillColor;
  fillColor.addEventListener("input", (event) => {
    letter.fillColor = event.target.value;
    fillHex.classList.remove("invalid");
    fillHex.value = event.target.value;
    renderPreview();
  });
  fillWrapper.append(fillColor);
  const fillHex = document.createElement("input");
  fillHex.type = "text";
  fillHex.value = letter.fillColor;
  fillHex.addEventListener("input", () => {
    fillHex.classList.remove("invalid");
  });
  fillHex.addEventListener("change", (event) => {
    const normalized = normalizeHexColor(event.target.value);
    if (!normalized) {
      fillHex.classList.add("invalid");
      fillHex.value = letter.fillColor;
      return;
    }
    letter.fillColor = normalized;
    fillColor.value = normalized;
    fillHex.value = normalized;
    fillHex.classList.remove("invalid");
    renderPreview();
  });
  fillWrapper.append(fillHex);
  fillLabel.append(fillWrapper);

  const textureLabel = document.createElement("label");
  textureLabel.textContent = "Estilo/ textura";
  const textureSelect = buildSelect(
    textureOptions.map(({ label, value }) => ({ label, value })),
    letter.textStyle
  );
  textureSelect.addEventListener("change", (event) => {
    letter.textStyle = event.target.value;
    renderPreview();
  });
  textureLabel.append(textureSelect);

  const strokeLabel = document.createElement("label");
  strokeLabel.textContent = "Contorno";
  const strokeWrapper = document.createElement("div");
  strokeWrapper.className = "color-input-wrapper";
  const strokeColor = document.createElement("input");
  strokeColor.type = "color";
  strokeColor.value = letter.strokeColor;
  strokeColor.addEventListener("input", (event) => {
    letter.strokeColor = event.target.value;
    renderPreview();
  });
  const strokeWidth = document.createElement("input");
  strokeWidth.type = "number";
  strokeWidth.min = 0;
  strokeWidth.max = 20;
  strokeWidth.value = letter.strokeWidth;
  strokeWidth.addEventListener("input", (event) => {
    letter.strokeWidth = Number(event.target.value);
    renderPreview();
  });
  strokeWrapper.append(strokeColor, strokeWidth);
  strokeLabel.append(strokeWrapper);

  const opacityRange = createRangeControl("Opacidad", {
    min: 0.1,
    max: 1,
    step: 0.05,
    value: letter.opacity,
    onChange: (value) => {
      letter.opacity = value;
      renderPreview();
    }
  });

  colorGroup.append(fillLabel, textureLabel, strokeLabel, opacityRange.wrapper);

  const shapeGroup = document.createElement("div");
  shapeGroup.className = "control-group";
  const positionControls = document.createElement("div");
  positionControls.className = "inline";

  const offsetX = createNumberControl("Posición X", {
    min: -200,
    max: 200,
    step: 1,
    value: letter.offsetX,
    onChange: (value) => {
      letter.offsetX = value;
      renderPreview();
    }
  });

  const offsetY = createNumberControl("Posición Y", {
    min: -200,
    max: 200,
    step: 1,
    value: letter.offsetY,
    onChange: (value) => {
      letter.offsetY = value;
      renderPreview();
    }
  });

  const kerning = createNumberControl("Kerning", {
    min: -60,
    max: 60,
    step: 1,
    value: letter.marginRight,
    onChange: (value) => {
      letter.marginRight = value;
      renderPreview();
    }
  });

  positionControls.append(offsetX.wrapper, offsetY.wrapper, kerning.wrapper);

  const transformControls = document.createElement("div");
  transformControls.className = "inline";

  const scaleX = createNumberControl("Escala X", {
    min: 0.2,
    max: 3,
    step: 0.1,
    value: letter.scaleX,
    onChange: (value) => {
      letter.scaleX = value;
      renderPreview();
    }
  });

  const scaleY = createNumberControl("Escala Y", {
    min: 0.2,
    max: 3,
    step: 0.1,
    value: letter.scaleY,
    onChange: (value) => {
      letter.scaleY = value;
      renderPreview();
    }
  });

  const rotation = createNumberControl("Rotación", {
    min: -180,
    max: 180,
    step: 1,
    value: letter.rotation,
    onChange: (value) => {
      letter.rotation = value;
      renderPreview();
    }
  });

  const skew = createNumberControl("Inclinación", {
    min: -60,
    max: 60,
    step: 1,
    value: letter.skewX,
    onChange: (value) => {
      letter.skewX = value;
      renderPreview();
    }
  });

  transformControls.append(scaleX.wrapper, scaleY.wrapper, rotation.wrapper, skew.wrapper);

  shapeGroup.append(positionControls, transformControls);

  const shadowGroup = document.createElement("div");
  shadowGroup.className = "control-group";
  const shadowToggleLabel = document.createElement("label");
  shadowToggleLabel.textContent = "Sombra";
  const shadowToggle = document.createElement("input");
  shadowToggle.type = "checkbox";
  shadowToggle.checked = letter.shadow.enabled;
  shadowToggle.addEventListener("change", (event) => {
    letter.shadow.enabled = event.target.checked;
    renderPreview();
    renderControlsForSelected();
  });
  shadowToggleLabel.append(shadowToggle);

  shadowGroup.append(shadowToggleLabel);

  if (letter.shadow.enabled) {
    const shadowSettings = document.createElement("div");
    shadowSettings.className = "inline";

    const shadowX = createNumberControl("Sombra X", {
      step: 1,
      value: letter.shadow.offsetX,
      onChange: (value) => {
        letter.shadow.offsetX = value;
        renderPreview();
      }
    });

    const shadowY = createNumberControl("Sombra Y", {
      step: 1,
      value: letter.shadow.offsetY,
      onChange: (value) => {
        letter.shadow.offsetY = value;
        renderPreview();
      }
    });

    const shadowBlur = createNumberControl("Desenfoque", {
      min: 0,
      step: 1,
      value: letter.shadow.blur,
      onChange: (value) => {
        letter.shadow.blur = value;
        renderPreview();
      }
    });

    const shadowColorLabel = document.createElement("label");
    shadowColorLabel.textContent = "Color";
    const shadowColor = document.createElement("input");
    shadowColor.type = "color";
    shadowColor.value = rgbaToHex(letter.shadow.color);
    shadowColor.addEventListener("input", (event) => {
      letter.shadow.color = event.target.value;
      renderPreview();
    });
    shadowColorLabel.append(shadowColor);

    shadowSettings.append(shadowX.wrapper, shadowY.wrapper, shadowBlur.wrapper, shadowColorLabel);
    shadowGroup.append(shadowSettings);
  }

  const actions = document.createElement("div");
  actions.className = "control-group";
  const resetLetterBtn = document.createElement("button");
  resetLetterBtn.className = "ghost";
  resetLetterBtn.textContent = "Restablecer esta letra";
  resetLetterBtn.addEventListener("click", () => {
    line.letterData[letterIndex] = createLetter(line.letterData[letterIndex].char);
    logoState.selected = { lineIndex, letterIndex };
    renderPreview();
    renderControlsForSelected();
  });
  actions.append(resetLetterBtn);

  letterControls.append(typography, colorGroup, shapeGroup, shadowGroup, actions);
};

const rgbaToHex = (rgba) => {
  if (rgba.startsWith("#")) return rgba;
  const [r, g, b] = rgba
    .replace(/rgba?\(|\)|\s/g, "")
    .split(",")
    .map((value) => parseInt(value, 10));
  return (
    "#" +
    [r, g, b]
      .map((value) => {
        const hex = value.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      })
      .join("")
  );
};

const resetLogo = () => {
  logoState.lines = [createLine()];
  logoState.selected = null;
  logoState.canvas = { ...DEFAULT_CANVAS };
  renderAll();
};

const exportPng = async () => {
  exportPngBtn.disabled = true;
  exportPngBtn.textContent = "Generando...";
  try {
    const canvas = await html2canvas(preview, {
      backgroundColor: getComputedStyle(preview).backgroundColor || "#11131d",
      width: logoState.canvas.width,
      height: logoState.canvas.height,
      scrollY: -window.scrollY,
      scale: window.devicePixelRatio < 2 ? 2 : window.devicePixelRatio
    });
    const link = document.createElement("a");
    link.download = "logotipo.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    alert("No fue posible generar la imagen. Intenta nuevamente.");
    console.error(error);
  } finally {
    exportPngBtn.disabled = false;
    exportPngBtn.textContent = "Descargar PNG";
  }
};

const exportSvg = async () => {
  if (!window.domtoimage) {
    alert("La librería para exportar SVG no está disponible.");
    return;
  }
  exportSvgBtn.disabled = true;
  exportSvgBtn.textContent = "Generando...";
  try {
    const dataUrl = await window.domtoimage.toSvg(preview, {
      width: logoState.canvas.width,
      height: logoState.canvas.height,
      bgcolor: getComputedStyle(preview).backgroundColor || "#11131d",
      style: {
        transform: "scale(1)",
        transformOrigin: "center",
        "--canvas-width": `${logoState.canvas.width}px`,
        "--canvas-height": `${logoState.canvas.height}px`
      }
    });
    const link = document.createElement("a");
    link.download = "logotipo.svg";
    link.href = dataUrl;
    link.click();
  } catch (error) {
    alert("No fue posible generar el SVG. Intenta nuevamente.");
    console.error(error);
  } finally {
    exportSvgBtn.disabled = false;
    exportSvgBtn.textContent = "Descargar SVG";
  }
};

const renderAll = () => {
  renderLineControls();
  renderPreview();
  renderCanvasControls();
  renderLetterSelectInfo();
};

addLineBtn.addEventListener("click", () => {
  logoState.lines.push(createLine("Nueva Idea"));
  renderAll();
});

canvasWidthInput.addEventListener("input", (event) => {
  updateCanvasDimension("width", event.target.value, false);
});
canvasWidthInput.addEventListener("change", (event) => {
  updateCanvasDimension("width", event.target.value, true);
});
canvasHeightInput.addEventListener("input", (event) => {
  updateCanvasDimension("height", event.target.value, false);
});
canvasHeightInput.addEventListener("change", (event) => {
  updateCanvasDimension("height", event.target.value, true);
});

resetBtn.addEventListener("click", resetLogo);
exportPngBtn.addEventListener("click", exportPng);
exportSvgBtn.addEventListener("click", exportSvg);

document.body.addEventListener("click", (event) => {
  if (event.target.closest(".logo-letter")) return;
  if (event.target.closest("#letterControls")) return;
  logoState.selected = null;
  renderAll();
});

renderAll();
