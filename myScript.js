
//GLOBAL INITIATION OF VARIABLES
var container;

var camera, cubeCamera, scene, controls, sphere, cube, oclSphere, oclCube;

var pointLight, cameraLight;

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var renderTargetOcl, renderTarget, hblur, vblur;
var renderer, composer, oclComposer, gui;
var urlPrefix = "images/";
var grPass, sceneShader, fireballPass;

var fireballUniforms;

var projector;

function startGL(){
	init();
	initGui();
	animate();
}

function init(){

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	//RENDERER
	renderer = new THREE.WebGLRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	renderer.domElement.style.position = "relative";
	container.appendChild(renderer.domElement);


/*		MAIN SCENE 		*/
	//CAMERA
	camera = new THREE.PerspectiveCamera( 25, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );

	//SCENE
	scene = new THREE.Scene();
	scene.add( new THREE.AmbientLight(0xffffff));
	pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0,100,0);
	camera.position.z = 15;
	scene.add(pointLight);
	cameraLight = new THREE.PointLight(0x666666);
	camera.add(cameraLight);

/*		OCCLUSION SCENE */
	//SCENE
	oclScene = new THREE.Scene();
	oclScene.add(new THREE.AmbientLight(0xffffff));


	//Volumetric light for occlusion scene
	fireballUniforms = {
		fTime: {type: "f", value: 1.0},
		fScale: {type: "f", value: 1.0}
	};
	
	var fireballMaterial = new THREE.ShaderMaterial( {
		uniforms: fireballUniforms,
		vertexShader: THREE.myShader['Fireball'].vertexShader,
		fragmentShader: THREE.myShader['Fireball'].fragmentShader
	} );
	vlight = new THREE.Mesh(
			new THREE.IcosahedronGeometry(1,3),
			fireballMaterial
	);
	vlight.position.set(2, 0, -10);
	oclScene.add(vlight);
	// scene.add(vlight);

/*			SCENE 		*/
	//Projector to track lightsource in screen space coordinates (x,y)
	projector = new THREE.Projector();
	//CONTROLS
	controls = new THREE.OrbitControls( camera,renderer.domElement );
	createScene();


	// postprocessing

	var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };
	renderTargetOcl = new THREE.WebGLRenderTarget( SCREEN_WIDTH/2, SCREEN_HEIGHT/2, renderTargetParameters );

	hblur = new THREE.ShaderPass( THREE.myShader[ "horizontalBlur" ] );
	vblur = new THREE.ShaderPass( THREE.myShader[ "verticalBlur" ] );

	var bluriness = 2;

	hblur.uniforms[ 'h' ].value = bluriness / SCREEN_WIDTH*2;
	vblur.uniforms[ 'v' ].value = bluriness / SCREEN_HEIGHT*2;

	var renderModel = new THREE.RenderPass( scene, camera );
	var renderModelOcl = new THREE.RenderPass( oclScene, camera );
	

	var finalPass = new THREE.ShaderPass( THREE.myShader['additive'] );
	finalPass.needsSwap = true;
	finalPass.renderToScreen = true;

	grPass = new THREE.ShaderPass( THREE.myShader['Godrays'] );
	grPass.needsSwap = true;
	grPass.renderToScreen = false;
	
	fireballPass = new THREE.ShaderPass( THREE.myShader['Fireball'] );
	
	fireballPass.needsSwap = true;
	fireballPass.renderToScreen = false;
	

	oclComposer = new THREE.EffectComposer( renderer, renderTargetOcl );
	oclComposer.addPass(renderModelOcl);
	// oclComposer.addPass(fireballPass);
	oclComposer.addPass(hblur);
	oclComposer.addPass(vblur);
	oclComposer.addPass(hblur);
	oclComposer.addPass(vblur);
	oclComposer.addPass(grPass);
	


	finalPass.uniforms[ 'tAdd' ].value = oclComposer.renderTarget1;

	renderTarget = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters );

	composer = new THREE.EffectComposer( renderer, renderTarget );
	sceneShader = new THREE.ShaderPass( THREE.myShader['myShader'] );
	sceneShader.uniforms[ 'brightness' ].value = 0.9;
	// sceneShader.renderToScreen = true;
	composer.addPass(renderModel);
	composer.addPass( sceneShader );
	composer.addPass(finalPass);
}

function createScene(){
	//CUBECAMERA
	cubeCamera = new THREE.CubeCamera( 1, 10000, 256 );
	cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
	scene.add( cubeCamera );

	//SKYBOX
	
	var urls = [ urlPrefix + "right.png", urlPrefix + "left.png",
	    urlPrefix + "top.png", urlPrefix + "bottom.png",
	    urlPrefix + "front.png", urlPrefix + "back.png" ];
	var textureCube = THREE.ImageUtils.loadTextureCube( urls );

	var shader = THREE.ShaderLib["cube"];
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	uniforms['tCube'].value= textureCube;   // textureCube has been init before
	var SkyBoxMat = new THREE.ShaderMaterial({
	    fragmentShader    : shader.fragmentShader,
	    vertexShader  : shader.vertexShader,
	    uniforms  : uniforms
	});
	SkyBoxMat.side = THREE.BackSide;

	// build the skybox Mesh
	var skyBoxGeo =  new THREE.BoxGeometry( 1000, 1000, 1000, 1, 1, 1, null, true );
	var skyboxMesh = new THREE.Mesh( skyBoxGeo, SkyBoxMat);
	// add it to the scene
	scene.add( skyboxMesh );

	//SPINNING CUBE
	var geometry = new THREE.BoxGeometry(1,1,1); 
	var sphereGeo = new THREE.SphereGeometry( 1, 30, 30 );

	var geoClone = geometry.clone();
	var sphereGeoClone = sphereGeo.clone();

	var material = new THREE.MeshBasicMaterial( { envMap: cubeCamera.renderTarget } );
	var cubeMaterial = new THREE.MeshBasicMaterial({color: 0x77aa54});
	var oclmat = new THREE.MeshBasicMaterial( { color: 0x000000, map: null } );

	sphere = new THREE.Mesh(sphereGeo, material);
	scene.add(sphere); 

	cube = new THREE.Mesh(geometry, cubeMaterial);
	cube.position.x = 2;
	scene.add(cube);

	oclSphere = new THREE.Mesh(sphereGeoClone, oclmat);
	oclScene.add(oclSphere);

	oclCube = new THREE.Mesh(geoClone, oclmat);
	oclCube.position = cube.position;
	oclScene.add(oclCube);
}

var vlightConfigData = function(){
		this.scale = 1.0;
		this.color1 = 0x77bbff;
		this.bluriness = 2;
}

function initGui(){
	var vlightConfig = new vlightConfigData();

	gui = new dat.GUI();

	gui.add(grPass.uniforms.fExposure, 'value').min(0).max(1.0).step(0.01).name("Exposure of VLR");
	gui.add(grPass.uniforms.fDecay, 'value').min(0.6).max(1.0).step(0.01).name("Decay of VLR");
	gui.add(grPass.uniforms.fDensity, 'value').min(0.0).max(1.0).step(0.01).name("Density of VLR");
	gui.add(grPass.uniforms.fWeight, 'value').min(0.0).max(1.0).step(0.01).name("Weight of VLR");
	gui.add(grPass.uniforms.fClamp, 'value').min(0.0).max(1.0).step(0.01).name("Clamp of VLR");
	gui.add(vlightConfig, 'scale').min(0.01).max(10).step(0.01).name("Scale of VLR").onChange(function(){
		vlight.scale.set(vlightConfig.scale, vlightConfig.scale, vlightConfig.scale);
	});

	gui.addColor( vlightConfig, 'color1', 0x77bbff ).onChange( function() {
	// console.log( box3Config.color1 );
	  vlight.material.color.setHex( dec2hex(vlightConfig.color1) );
	} ); 
	gui.add(vlightConfig, 'bluriness').min(0).max(10).name("Bluriness of VLR shader").onChange(function(){
		hblur.uniforms[ 'h' ].value = vlightConfig.bluriness / SCREEN_WIDTH*2;
		vblur.uniforms[ 'v' ].value = vlightConfig.bluriness / SCREEN_HEIGHT*2;
	})
	gui.add(sceneShader.uniforms.brightness, 'value').min(0).max(3.0).step(0.01).name("Scene Exposure");
}

var t = 0;

function animate(){
	t+=0.1;
	requestAnimationFrame(animate);
	cube.rotation.x += 0.01; 
	cube.rotation.y += 0.01;
	// console.log(oclCube);
	// console.log(cube);
	oclCube.rotation.x = cube.rotation.x;
	oclCube.rotation.y = cube.rotation.y;
	cubeCamera.updateCubeMap( renderer, scene );
	// console.log(vlight);
	//light position to camera
	// vlight.position.set(Math.cos(t)*5, 0, -10);
	// vlight.material.color.setHex(Math.random() * 0xffffff);
	var lPos = projectOnScreen(vlight, camera);
	// console.log(lPos);
	fireballUniforms["fTime"].value = t/10;
	grPass.uniforms["fExposure"].value = 0.6 + Math.cos(t)*0.05;
	grPass.uniforms["fX"].value = lPos.x;
	grPass.uniforms["fY"].value = lPos.y;

	oclComposer.render(0.1);
	composer.render(0.1); 
}

function projectOnScreen(object, camera){
	var pos = object.position.clone();
	var v = projector.projectVector(pos, camera);
	var lPos = new THREE.Vector3(((v.x + 1) / 2), ((v.y + 1) / 2), 0);
	// console.log(lPos);
	return lPos;
}

function dec2hex(i) {
  var result = "0x000000";
  if (i >= 0 && i <= 15) { result = "0x00000" + i.toString(16); }
  else if (i >= 16 && i <= 255) { result = "0x0000" + i.toString(16); }
  else if (i >= 256 && i <= 4095) { result = "0x000" + i.toString(16); }
  else if (i >= 4096 && i <= 65535) { result = "0x00" + i.toString(16); }
  else if (i >= 65535 && i <= 1048575) { result = "0x0" + i.toString(16); }
  else if (i >= 1048575 ) { result = '0x' + i.toString(16); }
  //console.log(result);
 return result
} 
