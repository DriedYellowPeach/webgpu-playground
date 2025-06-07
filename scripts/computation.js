async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    fail("Failed to get GPU device");
    return;
  }

  const shader_src = await loadWGSLShader("shaders/computation.wgsl");
  const module = device.createShaderModule({
    label: "doubling compute module",
    code: shader_src,
  });

  const pipeline = device.createComputePipeline({
    label: "doubling compute pipeline",
    layout: "auto",
    compute: {
      module,
      entryPoint: "compute",
    },
  });

  const input = new Float32Array([1, 3, 5]);
  const workBuffer = device.createBuffer({
    label: "work buffer",
    size: input.byteLength,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(workBuffer, 0, input);

  const resultBuffer = device.createBuffer({
    label: "result buffer",
    size: input.byteLength,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  const bindGroup = device.createBindGroup({
    label: "bindGroup for work buffer",
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: workBuffer,
        },
      },
    ],
  });

  const encoder = device.createCommandEncoder({
    label: "doubling encoder",
  });

  const pass = encoder.beginComputePass({
    label: "doubling compute pass",
  });

  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(input.length);
  pass.end();

  encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);
  const commandBuffer = encoder.finish();

  device.queue.submit([commandBuffer]);

  await resultBuffer.mapAsync(GPUMapMode.READ);
  const result = new Float32Array(resultBuffer.getMappedRange());

  console.log("input", input);
  console.log("result", result);

  resultBuffer.unmap();
}

function fail(msg) {
  // eslint-disable-next-line no-alert
  alert(msg);
}

async function loadWGSLShader(path) {
  const response = await fetch(path);
  return await response.text();
}

main();
