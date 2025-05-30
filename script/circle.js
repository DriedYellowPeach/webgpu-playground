const canvas = document.getElementById("webgpu-canvas");
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const context = canvas.getContext("webgpu");

const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({
  device,
  format,
});

const shader = await loadWGSLShader("shader/circle.wgsl");

const module = device.createShaderModule({
  label: "circle shader",
  code: shader,
});

// Compile shaders
const pipeline = device.createRenderPipeline({
  layout: "auto",
  vertex: {
    module,
    entryPoint: "vs",
  },
  fragment: {
    module,
    entryPoint: "fs",
    targets: [{ format }],
  },
  primitive: { topology: "triangle-list" },
});

// Upload canvas resolution as uniform
canvas.width = 1024;
canvas.height = 768;
const resData = new Float32Array([canvas.width, canvas.height]);
const resBuffer = device.createBuffer({
  size: resData.byteLength,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
const timeData = new Float32Array([0.0]);
const timeBuffer = device.createBuffer({
  size: timeData.byteLength,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(resBuffer, 0, resData.buffer);

// Bind group
const bindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [
    {
      binding: 0,
      resource: { buffer: resBuffer },
    },
    {
      binding: 1,
      resource: { buffer: timeBuffer },
    },
  ],
});

// Draw function
function draw(timestamp) {
  const timeInSeconds = timestamp / 1000;
  device.queue.writeBuffer(timeBuffer, 0, new Float32Array([timeInSeconds]));

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(3);
  pass.end();

  device.queue.submit([encoder.finish()]);

  requestAnimationFrame(draw);
}

async function loadWGSLShader(path) {
  const response = await fetch(path);
  return await response.text();
}

requestAnimationFrame(draw);
