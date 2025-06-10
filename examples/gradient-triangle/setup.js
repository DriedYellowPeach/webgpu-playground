async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    fail("Failed to get GPU device");
    return;
  }

  const canvas = document.getElementById("webgpu-canvas");
  const context = canvas.getContext("webgpu");
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
  });

  const shader = await loadWGSLShader("gradient.wgsl");

  const module = device.createShaderModule({
    label: "our hardcoded red triangle shaders",
    code: shader,
  });

  const pipeline = device.createRenderPipeline({
    label: "our hardcoded red triangle pipeline",
    layout: "auto",
    vertex: {
      entryPoint: "vs",
      module,
    },
    fragment: {
      entryPoint: "fs",
      module,
      targets: [{ format: presentationFormat }],
    },
  });

  const renderPassDescriptor = {
    label: "our hardcoded red triangle render pass",
    colorAttachments: [
      {
        clearValue: [0.3, 0.3, 0.3, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  function render() {
    // Get the current texture from the canvas context and
    // set it as the texture to render to.
    renderPassDescriptor.colorAttachments[0].view = context
      .getCurrentTexture()
      .createView();

    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: "our encoder" });

    // make a render pass encoder to encode render specific commands
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.draw(3); // call our vertex shader 3 times.
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const canvas = entry.target;
      const width = entry.contentBoxSize[0].inlineSize;
      const height = entry.contentBoxSize[0].blockSize;
      canvas.width = Math.max(
        1,
        Math.min(width, device.limits.maxTextureDimension2D),
      );
      canvas.height = Math.max(
        1,
        Math.min(height, device.limits.maxTextureDimension2D),
      );
    }
    render();
  });
  observer.observe(canvas);
}

async function loadWGSLShader(path) {
  const response = await fetch(path);
  return await response.text();
}

function fail(msg) {
  // eslint-disable-next-line no-alert
  alert(msg);
}

main();
