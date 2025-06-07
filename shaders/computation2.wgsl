@group(0) @binding(0) var<storage, read_write> input_data:  array<f32>;

@compute @workgroup_size(4, 4, 4)
fn compute(@builtin(global_invocation_id) id: vec3u) {
    let i = id.x + id.y * 16 + id.z * 256;
    input_data[i] = input_data[i] * 2.0;
}
