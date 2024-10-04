import React, { useEffect } from 'react';
import '../App.css'

const AudioDevice = () => {
  useEffect(() => {
    setup();
  }, []);

  const setup = async () => {
    const patchExportURL = "export/patch.export.json";
    const WAContext = window.AudioContext || window.webkitAudioContext;
    const context = new WAContext();
    const outputNode = context.createGain();
    outputNode.connect(context.destination);

    let response, patcher;
    try {
      response = await fetch(patchExportURL);
      patcher = await response.json();
      if (!window.RNBO) {
        await loadRNBOScript(patcher.desc.meta.rnboversion);
      }
    } catch (err) {
      handleError(err, response, patchExportURL);
      return;
    }

    let dependencies = [];
    try {
      const dependenciesResponse = await fetch("export/dependencies.json");
      dependencies = await dependenciesResponse.json();
      dependencies = dependencies.map(d => d.file ? { ...d, file: "export/" + d.file } : d);
    } catch (e) {}

    let device;
    try {
      device = await RNBO.createDevice({ context, patcher });
    } catch (err) {
      handleGuardrails({ error: err });
      return;
    }

    if (dependencies.length) await device.loadDataBufferDependencies(dependencies);
    device.node.connect(outputNode);
    document.getElementById("patcher-title").innerText = `${patcher.desc.meta.filename || "Unnamed Patcher"} (v${patcher.desc.meta.rnboversion})`;

    makeSliders(device);
    makeInportForm(device);
    attachOutports(device);
    loadPresets(device, patcher);
    makeMIDIKeyboard(device);

    document.body.onclick = () => {
      context.resume();
    }

    if (typeof guardrails === "function") guardrails();
  };

  const handleError = (err, response, patchExportURL) => {
    const errorContext = { error: err };
    if (response && (response.status >= 300 || response.status < 200)) {
      errorContext.header = `Couldn't load patcher export bundle`;
      errorContext.description = `Check app.js to see what file it's trying to load. Currently it's trying to load "${patchExportURL}".`;
    }
    handleGuardrails(errorContext);
  };

  const handleGuardrails = (errorContext) => {
    if (typeof guardrails === "function") {
      guardrails(errorContext);
    } else {
      throw errorContext.error;
    }
  };

  const loadRNBOScript = (version) => {
    return new Promise((resolve, reject) => {
      if (/^\d+\.\d+\.\d+-dev$/.test(version)) {
        throw new Error("Patcher exported with a Debug Version!\nPlease specify the correct RNBO version to use in the code.");
      }
      const el = document.createElement("script");
      el.src = `https://c74-public.nyc3.digitaloceanspaces.com/rnbo/${encodeURIComponent(version)}/rnbo.min.js`;
      el.onload = resolve;
      el.onerror = (err) => {
        console.log(err);
        reject(new Error("Failed to load rnbo.js v" + version));
      };
      document.body.append(el);
    });
  };

  const makeSliders = (device) => {
    const pdiv = document.getElementById("rnbo-parameter-sliders");
    const noParamLabel = document.getElementById("no-param-label");
    if (noParamLabel && device.numParameters > 0) pdiv.removeChild(noParamLabel);

    let isDraggingSlider = false;
    let uiElements = {};

    device.parameters.forEach(param => {
      let label = document.createElement("label");
      let slider = document.createElement("input");
      let text = document.createElement("input");
      let sliderContainer = document.createElement("div");
      sliderContainer.appendChild(label);
      sliderContainer.appendChild(slider);
      sliderContainer.appendChild(text);

      label.setAttribute("name", param.name);
      label.setAttribute("for", param.name);
      label.setAttribute("class", "param-label");
      label.textContent = `${param.name}: `;

      slider.setAttribute("type", "range");
      slider.setAttribute("class", "param-slider");
      slider.setAttribute("id", param.id);
      slider.setAttribute("name", param.name);
      slider.setAttribute("min", param.min);
      slider.setAttribute("max", param.max);
      slider.setAttribute("step", (param.steps > 1 ? (param.max - param.min) / (param.steps - 1) : (param.max - param.min) / 1000.0));
      slider.setAttribute("value", param.value);

      text.setAttribute("value", param.value.toFixed(1));
      text.setAttribute("type", "text");

      slider.addEventListener("pointerdown", () => {
        isDraggingSlider = true;
      });
      slider.addEventListener("pointerup", () => {
        isDraggingSlider = false;
        slider.value = param.value;
        text.value = param.value.toFixed(1);
      });
      slider.addEventListener("input", () => {
        param.value = Number.parseFloat(slider.value);
      });

      text.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          let newValue = Number.parseFloat(text.value);
          if (isNaN(newValue)) {
            text.value = param.value;
          } else {
            newValue = Math.min(newValue, param.max);
            newValue = Math.max(newValue, param.min);
            text.value = newValue;
            param.value = newValue;
          }
        }
      });

      uiElements[param.id] = { slider, text };
      pdiv.appendChild(sliderContainer);
    });

    device.parameterChangeEvent.subscribe(param => {
      if (!isDraggingSlider) {
        uiElements[param.id].slider.value = param.value;
      }
      uiElements[param.id].text.value = param.value.toFixed(1);
    });
  };

  const makeInportForm = (device) => {
    const idiv = document.getElementById("rnbo-inports");
    const inportSelect = document.getElementById("inport-select");
    const inportText = document.getElementById("inport-text");
    const inportForm = document.getElementById("inport-form");
    
    const inports = device.messages.filter(message => message.type === RNBO.MessagePortType.Inport);
    if (inports.length === 0) {
      idiv.removeChild(document.getElementById("inport-form"));
      return;
    } else {
      idiv.removeChild(document.getElementById("no-inports-label"));
      inports.forEach(inport => {
        const option = document.createElement("option");
        option.innerText = inport.tag;
        inportSelect.appendChild(option);
      });

      let inportTag = inportSelect.value;
      inportSelect.onchange = () => inportTag = inportSelect.value;

      inportForm.onsubmit = (ev) => {
        ev.preventDefault();
        const values = inportText.value.split(/\s+/).map(s => parseFloat(s));
        const messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, inportTag, values);
        device.scheduleEvent(messageEvent);
      };
    }
  };

  const attachOutports = (device) => {
    const outports = device.outports;
    if (outports.length < 1) {
      document.getElementById("rnbo-console").removeChild(document.getElementById("rnbo-console-div"));
      return;
    }

    document.getElementById("rnbo-console").removeChild(document.getElementById("no-outports-label"));
    device.messageEvent.subscribe((ev) => {
      if (outports.findIndex(elt => elt.tag === ev.tag) < 0) return;
      document.getElementById("rnbo-console-readout").innerText = `${ev.tag}: ${ev.payload}`;
    });
  };

  const loadPresets = (device, patcher) => {
    let presets = patcher.presets || [];
    if (presets.length < 1) {
      document.getElementById("rnbo-presets").removeChild(document.getElementById("preset-select"));
      return;
    }

    document.getElementById("rnbo-presets").removeChild(document.getElementById("no-presets-label"));
    let presetSelect = document.getElementById("preset-select");
    presets.forEach((preset, index) => {
      const option = document.createElement("option");
      option.innerText = preset.name;
      option.value = index;
      presetSelect.appendChild(option);
    });
    presetSelect.onchange = () => device.setPreset(presets[presetSelect.value].preset);
  };

  const makeMIDIKeyboard = (device) => {
    let mdiv = document.getElementById("rnbo-clickable-keyboard");
    if (device.numMIDIInputPorts === 0) return;

    mdiv.removeChild(document.getElementById("no-midi-label"));
    const midiNotes = [49, 52, 56, 63];
    midiNotes.forEach(note => {
      const key = document.createElement("div");
      const label = document.createElement("p");
      label.textContent = note;
      key.appendChild(label);
      key.addEventListener("pointerdown", () => {
        const midiChannel = 0;
        const noteOnMessage = [144 + midiChannel, note, 100];
        const noteOffMessage = [128 + midiChannel, note, 0];
        let noteDurationMs = 250;

        let midiPort = 0;
        let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, midiPort, noteOnMessage);
        let noteOffEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000 + noteDurationMs, midiPort, noteOffMessage);
        device.scheduleEvent(noteOnEvent);
        device.scheduleEvent(noteOffEvent);
        key.classList.add("clicked");
      });

      key.addEventListener("pointerup", () => key.classList.remove("clicked"));

      mdiv.appendChild(key);
    });
  };

  return (
    <div id="rnbo-root">
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <svg id="background" width="100%" height="100%"></svg>
      <div>
        <h1 id="patcher-title">Unnamed patcher</h1>
      </div>
      <div id="rnbo-clickable-keyboard">
        <h2>MIDI Keyboard</h2>
        <em id="no-midi-label">No MIDI input</em>
      </div>
      <div id="rnbo-inports">
        <h2>Inports</h2>
        <em id="no-inports-label">No inports available</em>
        <form id="inport-form" className="inport">
          <div className="inport-input">
            <select id="inport-select"></select>
            <input id="inport-text" type="text" />
            <input id="inport-submit" className="smallButton" type="submit" value="Send" />
          </div>
        </form>
      </div>
      <div id="rnbo-console">
        <h2>Outports</h2>
        <em id="no-outports-label">No outports available</em>
        <div id="rnbo-console-div">
          <p id="rnbo-console-readout">Waiting for messages...</p>
          <em id="rnbo-console-description">Check the developer console for more messages from the RNBO device</em>
        </div>
      </div>
      <div id="rnbo-presets">
        <h2>Presets</h2>
        <em id="no-presets-label">No presets defined</em>
        <select id="preset-select"></select>
      </div>
      <div id="rnbo-parameter-sliders">
        <h2>Parameters</h2>
        <em id="no-param-label">No parameters</em>
      </div>
    </div>
  );
};

export default AudioDevice;