@group(0) @binding(0)
var<uniform> u_resolution: vec2f;

@vertex fn vs(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
    // apply aspect ratio
    let ratio = u_resolution.x / u_resolution.y;
    let pos = array(
        vec2f(0.0, 0.0),
        vec2f(-0.5 / ratio , -0.5),
        vec2f(0.5 / ratio , -0.5),
    );

    return vec4f(pos[vertexIndex], 0.0, 1.0);
}

@fragment fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {

    let black = vec4f(0, 0, 0, 1);
    let white = vec4f(1, 1, 1, 1);

    let grid_idx = vec2u(pos.xy) / 8;
    let checker = (grid_idx.x + grid_idx.y) % 2 == 0;

    return select(black, white, checker);
}
