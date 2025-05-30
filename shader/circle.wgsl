const PI: f32 = 3.14159265358979323846;

@vertex
fn vs(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4<f32> {
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(3.0, -1.0),
        vec2<f32>(-1.0, 3.0)
    );
    return vec4<f32>(pos[idx], 0.0, 1.0);
}

struct Resolution {
    res: vec2<f32>
};

struct Time {
    value: f32,
};

@group(0) @binding(0)
var<uniform> u_resolution: Resolution;

@group(0) @binding(1)
var<uniform> u_time: Time;

@fragment
fn fs(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
    let ratio = u_resolution.res.x / u_resolution.res.y;
    let uv = (2.0 * coord.xy / u_resolution.res - 1.0) * vec2f(ratio, 1.0);
    let dist = length(uv - vec2(ratio * sin(3 * u_time.value), 0));
    let a = 16 * PI;
    let y = sin(a * (dist - 4 * u_time.value));

    if (y > 0) {
        return vec4<f32>(1.0, 0.0, 0.0, 1.0); // Inside circle
    } else {
        return vec4f(1.0, 1.0, 1.0, 1.0);
    }
}

