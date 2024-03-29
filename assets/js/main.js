
//make scene fullscreen
var h = document.documentElement.clientHeight || document.body.clientHeight;
var w = document.documentElement.clientHeight || document.body.clientWidth;
window.addEventListener( 'load', onWindowResize, true );
window.addEventListener( 'resize', onWindowResize, true );

function onWindowResize() {
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize( w, h );
}
//=====================================================================================

//set the scene
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x59472B);
scene.fog = new THREE.Fog(0x59472B, 1, 400); //black fog
var renderer = new THREE.WebGLRenderer( {antialias: true});
renderer.shadowMap.enabled = true;
TW.mainInit(renderer,scene);

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var c1 = renderer.domElement;
document.addEventListener('mousemove', onMouseMove, false);

//=====================================================================================
var animationID = null;
var startAngle =  0;
var numZoetropes = 42;
var zoetropes = [];
var rotationP = [];
var rotationV = -0.2;
var rotatingIndex = -1;

//camera setup
var state = TW.cameraSetup(renderer, scene,
                          {minx: -50, maxx: 50,//-50 to 50
                           miny: 0, maxy: 40,
                           minz: -50, maxz:50});//-50 to 50
var camera = state.cameraObject;

//initialization of zoetropes
for (var i = 0; i < numZoetropes; i++) {
  zoetropes.push(null);
  rotationP[i] = startAngle;
}

//load image that displays a sequence of cat jumping motion
TW.loadTextures(["assets/img/wood.jpg","assets/img/copper.jpg", "assets/img/copper_black.jpg",
"assets/img/wood_black.jpg","assets/img/jump.jpg","assets/img/horse.jpg", "assets/img/rabbit.jpg"],
        function (image) {
            for (var i = 0; i < numZoetropes; i++) {
              zoetropes[i] = displayZoetrope(image, rotationP[i], zoetropes[i], i);//extra parameter
            }
        } );

var geometry = new THREE.PlaneBufferGeometry( 100, 100 );
var planeMaterial = new THREE.MeshPhongMaterial( { color: 0xffb851 } );
var ground = new THREE.Mesh( geometry, planeMaterial );
ground.position.set( 0, -10, 0 );
ground.rotation.x = - Math.PI / 2;
ground.scale.set( 100, 100, 100 );
ground.receiveShadow = true;
scene.add(ground);
//=====================================================================================
function animate(timestamp) {
  updateState();
  animationID = requestAnimationFrame(animate);
}

function updateState() {

  //creating zoetropes while textures are loading
  if (zoetropes[0] == null){
    TW.loadTextures(["assets/img/wood.jpg","assets/img/copper.jpg", "assets/img/copper_black.jpg",
    "assets/img/wood_black.jpg","assets/img/jump.jpg","assets/img/horse.jpg", "assets/img/rabbit.jpg"],
                function (image) {
                  for (var i = 0; i < numZoetropes; i++) {
                      zoetropes[i] = displayZoetrope(image, rotationP[i], zoetropes[i], i);//extra parameter
                    }
                } );
  }
  //after textures are loaded
  else {
    if (rotatingIndex != -1) {
      //rotate and rerender zoetrope
      zoetropes[rotatingIndex] = displayZoetrope(null, rotationP[rotatingIndex], zoetropes[rotatingIndex], i);//extra parameter
      //update zoetrope rotation
      rotationP[rotatingIndex] += rotationV;
    }
    renderer.render(scene, camera);
  }
}

//=====================================================================================

//use global for the lights (and targets)
var dirLight,ambLight,pointLight;

function makeLights() {

  dirLight = new THREE.DirectionalLight(0xFFFFFF,.7);
  dirLight.position.set(50, 30, 50);
  dirLight.castShadow = true;
  scene.add(dirLight);

  ambLight = new THREE.AmbientLight(0xB6B6B6, 1);
  scene.add(ambLight);

  pointLight = new THREE.PointLight(0xB6B6B6, 0.9);
  pointLight.position.set(30,20,40);
  pointLight.castShadow = true;
  scene.add(pointLight);
}
makeLights();

//=====================================================================================
function onMouseMove (event) {
 event.preventDefault();
  if (event.target == c1) {
     // use canvas offset to determine mouse coordinates in canvas coordinate frame
     var rect = event.target.getBoundingClientRect();
     var canvasX = event.clientX - rect.left;
     var canvasY = event.clientY - rect.top;
  } else {
     return;
  }
  // get mouse coordinates in the range from -1 to +1 (canvas is 800 x 500 pixels)
  mouse.x = (canvasX / w) * 2 - 1;
  mouse.y = -(canvasY / h) * 2 + 1;

  if (zoetropes[0] != null){
    //moved raycasting
    //mouse is updated when mouse is moved
    raycaster.setFromCamera(mouse, camera);
    //find zoetrope with minimum distance from raycaster
    var min = 10000;
    var minIndex = -1;
    for (var i =0 ; i < numZoetropes; i++){
      var intersects = raycaster.intersectObject(zoetropes[i], true);
      if (intersects.length > 0){
        if (min > intersects[0].distance){
          minIndex = i;
          min =  intersects[0].distance;
        }
      }
    }
    //update rotating index
    rotatingIndex = minIndex;
  }
}

animate(0); //start animation
