THREE.myShader = {
	'myShader': {
			uniforms: {
			tDiffuse: {type: "t", value:0, texture:null},
		    brightness: {type: "f", value: 0.6},
			},

			vertexShader: [

			"varying vec2 vUv;",
			"void main() {",
				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

			].join("\n"),

			fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform float brightness;",
			"varying vec2 vUv;",

			"void main() {",

				"vec4 color = texture2D(tDiffuse, vUv);",
				"gl_FragColor = color*brightness;",

			"}"


			].join("\n")
	},

	"horizontalBlur" : {
		uniforms: {

			"tDiffuse": { type: "t", value: null },
			"h":        { type: "f", value: 1.0 / 512.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform float h;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 sum = vec4( 0.0 );",

				"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",

				"gl_FragColor = sum;",

			"}"

		].join("\n")

	},

	"verticalBlur" : {
		uniforms: {

			"tDiffuse": { type: "t", value: null },
			"v":        { type: "f", value: 1.0 / 512.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform float v;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 sum = vec4( 0.0 );",

				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;",

				"gl_FragColor = sum;",

			"}"

		].join("\n")
	},
	"additive" : {
        uniforms: {
            tDiffuse: { type: "t", value: 0, texture: null },
            tAdd: { type: "t", value: 1, texture: null },
            fCoeff: { type: "f", value: 1.0 }
        },

        vertexShader: [
            "varying vec2 vUv;",

            "void main() {",

                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform sampler2D tDiffuse;",
            "uniform sampler2D tAdd;",
            "uniform float fCoeff;",

            "varying vec2 vUv;",

            "void main() {",

                "vec4 texel = texture2D( tDiffuse, vUv );",
                "vec4 add = texture2D( tAdd, vUv );",
                "gl_FragColor = texel + add * fCoeff;",

            "}"
        ].join("\n")
    },
    "Godrays" : {
		uniforms: {
			tDiffuse: {type: "t", value:0, texture:null},
			fX: {type: "f", value: 0.5},
			fY: {type: "f", value: 0.5},
			fExposure: {type: "f", value: 0.6},
			fDecay: {type: "f", value: 0.93},
			fDensity: {type: "f", value: 0.96},
			fWeight: {type: "f", value: 0.4},
			fClamp: {type: "f", value: 1.0}
		},

		vertexShader: [
			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x,  uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"
		].join("\n"),

		fragmentShader: [
			"varying vec2 vUv;",
			"uniform sampler2D tDiffuse;",

			"uniform float fX;",
			"uniform float fY;",
			"uniform float fExposure;",
			"uniform float fDecay;",
			"uniform float fDensity;",
			"uniform float fWeight;",
			"uniform float fClamp;",

			"const int iSamples = 20;",

			"void main()",
			"{",
				"vec2 deltaTextCoord = vec2(vUv - vec2(fX,fY));",
				"deltaTextCoord *= 1.0 /  float(iSamples) * fDensity;",
				"vec2 coord = vUv;",
				"float illuminationDecay = 1.0;",
				"vec4 FragColor = vec4(0.0);",

				"for(int i=0; i < iSamples ; i++)",
				"{",
					"coord -= deltaTextCoord;",
					"vec4 texel = texture2D(tDiffuse, coord);",
					"texel *= illuminationDecay * fWeight;",

					"FragColor += texel;",

					"illuminationDecay *= fDecay;",
				"}",
				"FragColor *= fExposure;",
				"FragColor = clamp(FragColor, 0.0, fClamp);",
				"gl_FragColor = FragColor;",
			"}"
		].join("\n")
	},
	
	"Fireball" : {
		uniforms: {
			fTime: 	{type: "f", value:0},
			fScale: 	{type: "f", value:1}
		},

		vertexShader: [
			"uniform float fTime;",
			"uniform float fScale;",
			
			"varying vec3 vTexCoord3D;",
			"varying vec3 vNormal;",
			"varying vec3 vViewPosition;",
			
			"void main() {",

				"vec4 mPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vNormal = normalize( normalMatrix * normal);",
				"vViewPosition = cameraPosition - mPosition.xyz;",
				
				"vTexCoord3D = fScale * (position.xyz + vec3( 0.0, 0.0, -fTime) );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"
		].join("\n"),

		fragmentShader: [
			"uniform float fTime;",
			
			"varying vec3 vTexCoord3D;",
			"varying vec3 vNormal;",
			"varying vec3 vViewPosition;",
			

			"vec4 permute(vec4 x)",
			"{",
				"return mod( ( ( x*34.0)+1.0)*x,289.0);",
			"}",
			
			"vec4 taylorInvSqrt(vec4 r) {",
				"return 1.79284291400159 - 0.85373472095314 * r;",
			"}",
			
			"float snoise( vec3 v ) {",

				"const vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );",
				"const vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );",

				// First corner

				"vec3 i  = floor( v + dot( v, C.yyy ) );",
				"vec3 x0 = v - i + dot( i, C.xxx );",

				// Other corners

				"vec3 g = step( x0.yzx, x0.xyz );",
				"vec3 l = 1.0 - g;",
				"vec3 i1 = min( g.xyz, l.zxy );",
				"vec3 i2 = max( g.xyz, l.zxy );",

				//  x0 = x0 - 0. + 0.0 * C
				"vec3 x1 = x0 - i1 + 1.0 * C.xxx;",
				"vec3 x2 = x0 - i2 + 2.0 * C.xxx;",
				"vec3 x3 = x0 - 1. + 3.0 * C.xxx;",

				// Permutations

				"i = mod( i, 289.0 );",
				"vec4 p = permute( permute( permute(",
						 "i.z + vec4( 0.0, i1.z, i2.z, 1.0 ) )",
					   "+ i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) )",
					   "+ i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );",

				// Gradients
				// ( N*N points uniformly over a square, mapped onto an octahedron.)

				"float n_ = 1.0 / 7.0;", // N=7

				"vec3 ns = n_ * D.wyz - D.xzx;",

				"vec4 j = p - 49.0 * floor( p * ns.z *ns.z );",  //  mod(p,N*N)

				"vec4 x_ = floor( j * ns.z );",
				"vec4 y_ = floor( j - 7.0 * x_ );",    // mod(j,N)

				"vec4 x = x_ *ns.x + ns.yyyy;",
				"vec4 y = y_ *ns.x + ns.yyyy;",
				"vec4 h = 1.0 - abs( x ) - abs( y );",

				"vec4 b0 = vec4( x.xy, y.xy );",
				"vec4 b1 = vec4( x.zw, y.zw );",

				"vec4 s0 = floor( b0 ) * 2.0 + 1.0;",
				"vec4 s1 = floor( b1 ) * 2.0 + 1.0;",
				"vec4 sh = -step( h, vec4( 0.0 ) );",

				"vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;",
				"vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;",

				"vec3 p0 = vec3( a0.xy, h.x );",
				"vec3 p1 = vec3( a0.zw, h.y );",
				"vec3 p2 = vec3( a1.xy, h.z );",
				"vec3 p3 = vec3( a1.zw, h.w );",

				// Normalise gradients

				"vec4 norm = taylorInvSqrt( vec4( dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3) ) );",
				"p0 *= norm.x;",
				"p1 *= norm.y;",
				"p2 *= norm.z;",
				"p3 *= norm.w;",

				// Mix final noise value

				"vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3) ), 0.0 );",
				"m = m * m;",
				"return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),",
											"dot(p2,x2), dot(p3,x3) ) );",

			"}",
			"float heightMap( vec3 coord ) {",

				"float n = abs( snoise( coord ) );",

				"n += 0.25   * abs( snoise( coord * 2.0 ) );",
				"n += 0.25   * abs( snoise( coord * 4.0 ) );",
				"n += 0.125  * abs( snoise( coord * 8.0 ) );",
				"n += 0.0625 * abs( snoise( coord * 16.0 ) );",

				"return n;",

			"}",	

			"void main()",
			"{",
				// height

				"float n = heightMap( vTexCoord3D );",

				// color

				"gl_FragColor = vec4( vec3( 1.5 - n, 1.0 - n, 0.5 - n ), 1.0 );",

				// normal

				"const float e = 0.001;",

				"float nx = heightMap( vTexCoord3D + vec3( e, 0.0, 0.0 ) );",
				"float ny = heightMap( vTexCoord3D + vec3( 0.0, e, 0.0 ) );",
				"float nz = heightMap( vTexCoord3D + vec3( 0.0, 0.0, e ) );",

				"vec3 normal = normalize( vNormal + 0.05 * vec3( n - nx, n - ny, n - nz ) / e );",

				// diffuse light

				"vec3 vLightWeighting = vec3( 0.1 );",

				"vec4 lDirection = viewMatrix * vec4( normalize( vec3( 1.0, 0.0, 0.5 ) ), 0.0 );",
				"float directionalLightWeighting = dot( normal, normalize( lDirection.xyz ) ) * 0.25 + 0.75;",
				"vLightWeighting += vec3( 1.0 ) * directionalLightWeighting;",

				// specular light

				"vec3 dirHalfVector = normalize( lDirection.xyz + normalize( vViewPosition ) );",

				"float dirDotNormalHalf = dot( normal, dirHalfVector );",

				"float dirSpecularWeight = 0.0;",
				"if ( dirDotNormalHalf >= 0.0 )",
					"dirSpecularWeight = ( 1.0 - n ) * pow( dirDotNormalHalf, 5.0 );",

				"vLightWeighting += vec3( 1.0, 0.5, 0.0 ) * dirSpecularWeight * n * 2.0;",

				"gl_FragColor *= vec4( vLightWeighting, 1.0 );",
			"}"
		].join("\n")
	}
	
};