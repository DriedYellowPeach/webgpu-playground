struct VertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
}

@vertex 
fn vs(
    @builtin(vertex_index) vertexIndex: u32
) -> VertexShaderOutput {
    let pos = array(
        vec2f(.0, 0.5),  // top center
        vec2f(-0.5, -0.5),  // bottom left
        vec2f(0.5, -0.5)   // bottom right
    );

    var color = array<vec4f, 3>(
        vec4f(0.5, 0, 0, 1),
        vec4f(0, 0.5, 0, 1),
        vec4f(0, 0, 0.5, 1),
    );

    var vsOut: VertexShaderOutput;
    vsOut.position = vec4f(pos[vertexIndex], 0.0, 1.0);
    vsOut.color = color[vertexIndex];

    return vsOut;
}

@fragment 
fn fs(@location(0) color: vec4f) -> @location(0) vec4f {
    return color;
}
