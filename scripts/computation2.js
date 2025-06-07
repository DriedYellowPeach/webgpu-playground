async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    fail("Failed to get GPU device");
    return;
  }

  const shader_src = await loadWGSLShader("shaders/computation2.wgsl");
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

  const input = new Float32Array(4096);
  for (let i = 0; i < input.length; i++) {
    input[i] = i;
  }
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
  pass.dispatchWorkgroups(4, 4, 4);
  pass.end();

  encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);
  const commandBuffer = encoder.finish();

  device.queue.submit([commandBuffer]);
  console.time("GPU execution time");

  await resultBuffer.mapAsync(GPUMapMode.READ);
  console.timeEnd("GPU execution time");

  let output = new Float32Array(4096);

  console.time("CPU execution time");
  for (let i = 0; i < input.length; i++) {
    output[i] = i * 2;
  }
  console.timeEnd("CPU execution time");

  const result = new Float32Array(resultBuffer.getMappedRange());
  console.log("input", input[4095]);
  console.log("result", result[4095]);

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

await main();
