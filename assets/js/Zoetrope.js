/********************

AUTHORS: Rachel and Enmo

TITLE: zoetrope.js

DATE: Nov 9, 2019

CS307

PURPOSE: Creates a zoetrope object with input image

********************/

// creates the zoetrope paramameters with the inputted values
var params = {
  cylinderRadius: 10,
  cylinderRim: 11,
  cylinderHeight: 6,
  numCylinderSlit: 12,
  slitGapAngle:0.15,
  cylinderRimHeight: 0.3,
  cylinderTorusRotation: Math.PI*0.5,
  baseTopRadius:1,
  baseBottomRadius:6,
  baseHeight:10,
  baseNumSeg:20,
  color: 0xB88451,
  floorSize: 300,
  //floorHeight: 100,
  objPerRow: 6
}

// declare global materials for zoetrope
var imageMaterials, baseMaterial, cylinderMaterial, imageBackMaterial;
// makes zoetrope geometry and materials based on textures, then adds to scene and render
function displayZoetrope(image, rotation, zoetrope, index){ //added parameter
  if (zoetrope !== null && zoetrope !== undefined) { //remove zoetrope from scene, if exists
    scene.remove(zoetrope);
  }
  else { //zoetrope doesn't exist; making new zoetrope
      cylinderMaterial = new THREE.MeshStandardMaterial( {
        color: params.color,
        side: THREE.DoubleSide,
        map: image[1],
        roughness: .5,
        metalness: 0.7,
        bumpMap: image[2],
        // roughnessMap: image[3],
        metalnessMap: null,
        envMap: null // important -- especially for metals!
        // envMapIntensity: envMapIntensity
      } );
      imageBackMaterial = new THREE.MeshStandardMaterial( {
        color: params.color,
        side: THREE.FrontSide,
        map: image[0],
        roughness: .5,
        metalness: 0.2,
        bumpMap: image[3],
        // roughnessMap: image[3],
        metalnessMap: null,
        envMap: null // important -- especially for metals!
        // envMapIntensity: envMapIntensity
      } );
      baseMaterial = new THREE.MeshStandardMaterial( {
        color: params.color,
        side: THREE.DoubleSide,
        map: image[1],
        roughness: .5,
        metalness: 0.7,
        bumpMap: image[2],
        // roughnessMap: image[3],
        metalnessMap: null,
        envMap: null // important -- especially for metals!
        // envMapIntensity: envMapIntensity
      } );
      imageMaterials = [];
      for (var i = 4; i < image.length; i++) {
        imageMaterials.push(new THREE.MeshPhongMaterial({color: 0xFFFFFF, side: THREE.BackSide, map: image[i]}));
      }
      var matIndex = (index + Math.floor(index/params.objPerRow))%imageMaterials.length;
      var zoetrope = createZoetrope(imageMaterials[matIndex], baseMaterial, cylinderMaterial);
      zoetrope.position.x = (index%params.objPerRow)*(params.floorSize/params.objPerRow)-0.5*params.floorSize;
      zoetrope.position.z = (index/params.objPerRow)*(params.floorSize/params.objPerRow)-0.5*params.floorSize;
  }
  //update rotation
  zoetrope.rotation.y = rotation;
  scene.add(zoetrope);
  renderer.render(scene, camera);
  return zoetrope;
}

function createZoetrope(imageMaterial, baseMaterial, cylinderMaterial){
  //create top part of zoetrope
  var zoetrope = new THREE.Object3D();
  var topCylinder = slitCylinder(params.cylinderRadius, params.cylinderHeight, params.numCylinderSlit, params.slitGapAngle);
  var bottomCylinder = imageCylinder(params.cylinderRadius, params.cylinderHeight, imageMaterial);
  //translate top and bottom cylinder to place the origin at the base of bottom cylinder
  topCylinder.position.y = params.cylinderHeight + params.cylinderHeight/2;
  bottomCylinder.position.y = params.cylinderHeight/2;
  topCylinder.castShadow = true;
  bottomCylinder.castShadow = true;
  zoetrope.add(topCylinder);
  zoetrope.add(bottomCylinder);
  var cylinderBase = new THREE.Mesh(new THREE.CylinderGeometry(params.cylinderRim, params.cylinderRim, params.cylinderRimHeight, 40, 1), baseMaterial);
  cylinderBase.castShadow = true;
  zoetrope.add(cylinderBase);
  //add rims to the cylinder
  var cylinderMiddleTorus = new THREE.Mesh( new THREE.TorusGeometry( params.cylinderRadius, params.cylinderRimHeight, 16, 100 ), cylinderMaterial);
  cylinderMiddleTorus.rotation.x = params.cylinderTorusRotation;
  cylinderMiddleTorus.position.y = params.cylinderHeight;
  cylinderMiddleTorus.castShadow = true;
  zoetrope.add( cylinderMiddleTorus );
  var cylinderTopTorus = new THREE.Mesh( new THREE.TorusGeometry( params.cylinderRadius, params.cylinderRimHeight, 16, 100 ), cylinderMaterial);
  cylinderTopTorus.rotation.x = params.cylinderTorusRotation;
  cylinderTopTorus.position.y = params.cylinderHeight * 2;
  cylinderTopTorus.castShadow = true;
  zoetrope.add( cylinderTopTorus );
  //add base to zoetrope
  var curveBase = createBase(params.baseTopRadius,params.baseBottomRadius,params.baseHeight,params.baseNumSeg, baseMaterial);
  curveBase.position.y = -params.baseHeight;
  curveBase.castShadow = true;
  zoetrope.add(curveBase);
  return zoetrope;
}

function slitCylinder(radius, height, numSlits, slitAngle){
  var slitCylinder = new THREE.Object3D();
  var segmentAngle = 2 * Math.PI/numSlits;
  var thetaLength = segmentAngle - slitAngle;
  for( i=0; i< numSlits ; i++) {
    thetaStart = i * segmentAngle;
		var segment = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height,
                                  20, 1, true, thetaStart, thetaLength), cylinderMaterial);
    segment.castShadow = true;
    slitCylinder.add(segment);
	}
  return slitCylinder;
}

//create the image cylinder which is consisted of two cylinder objects
function imageCylinder(radius, height, imageMaterial){
  var cylinder = new THREE.Object3D();
  var backCylinder = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.99, radius*0.99, height,
                                    40, 1, true), imageMaterial);
  var frontCylinder = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius, height,
                                    40, 1, true), imageBackMaterial);
  backCylinder.castShadow = true;
  frontCylinder.castShadow = true;
  cylinder.add(backCylinder);
  cylinder.add(frontCylinder);
  return cylinder;
}

function createBase(topRadius, bottomRadius, height, numSeg, baseMaterial){ //bottom radius should be greater than top radius
  var width = bottomRadius - topRadius;
  var curve = new THREE.CubicBezierCurve3(
    //control points for Bezier curve that defines the shape of base
  	new THREE.Vector3( width+1, 0, 0 ),
  	new THREE.Vector3( 0.2*width+1, 0, 0 ),
  	new THREE.Vector3( 1, 0.2*width, 0 ),
  	new THREE.Vector3( 1, height, 0 ));
  var points = curve.getPoints(numSeg);
  var base = new THREE.Mesh(new THREE.LatheGeometry(points, 30), baseMaterial);
  base.castShadow = true;
  return base;
}
