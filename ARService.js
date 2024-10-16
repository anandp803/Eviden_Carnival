var canvas = document.getElementById("renderCanvas");
var ARbtn = document.getElementById("ARbtn");

var startRenderLoop = function (engine, canvas) {
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
};

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
};
/**
 * WebXR ar demo using hit-test, anchors, and plane detection.
 *
 * Every press on the screen will add a figure in the requested position (if the ring is displayed). Those meshes will be kept in place by the AR system you are using.
 *
 * Working (at the moment) on android devices and the latest chrome.
 *
 * Created by Raanan Weber (@RaananW)
 */

var createScene = async function () {
  // This creates a basic Babylon Scene object (non-mesh)
  var scene = new BABYLON.Scene(engine);
  //scene.useRightHandedSystem = true;

  // This creates and positions a free camera (non-mesh)
  var camera = new BABYLON.FreeCamera(
    "camera1",
    new BABYLON.Vector3(0, 1, -5),
    scene
  );
  camera.inputs.clear();
  // This targets the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());
  //camera.rotation = new BABYLON.Vector3(0, 0, 0); // Reset rotation to default

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  var light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  var dirLight = new BABYLON.DirectionalLight(
    "light",
    new BABYLON.Vector3(0, -1, -0.5),
    scene
  );
  dirLight.position = new BABYLON.Vector3(0, 5, -5);

  var shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;

  // // Create GUI
  var advancedTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  advancedTexture.zIndex = 1; // Bring the UI to the front

  // Create the scan  image
  const scanImage = new BABYLON.GUI.Image("ScanImage", "./scenes/scan_1.png");

  // Set image size and position
  scanImage.width = "546px"; // Adjust size as needed
  scanImage.height = "597px"; // Adjust size as needed
  scanImage.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  scanImage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

  // Initially hide the image
  scanImage.isVisible = false;

  // Add the image to the UI
  advancedTexture.addControl(scanImage);

  // Create a text block
  const infoText = new BABYLON.GUI.TextBlock();
  infoText.text =
    "Take screenshot using in built device feature and share on social platform";
  infoText.color = "white"; // Text color
  infoText.fontSize = 25; // Adjust font size as needed
  infoText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  infoText.top = "100px"; // Position from the top of the screen
  infoText.isVisible = false;
  // Add the text block to the GUI
  advancedTexture.addControl(infoText);

  //Plus btn
  const increaseButton = BABYLON.GUI.Button.CreateImageButton(
    "IncreaseSize",
    ""
  );
  increaseButton.width = "0.1";
  increaseButton.height = "0.05";
  increaseButton.background = "#ff6d43";
  increaseButton.color = "black";
  // Create a TextBlock for the button
  var textBlock = new BABYLON.GUI.TextBlock();
  textBlock.text = "+"; // Set the button text
  textBlock.color = "black"; // Set text color
  textBlock.fontSize = 80; // Set font size
  // Center the text inside the button
  textBlock.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  textBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  // Add the TextBlock to the button
  increaseButton.addControl(textBlock);

  increaseButton.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  increaseButton.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  increaseButton.left = "-50px"; // Position above the place button
  increaseButton.isVisible = false;
  advancedTexture.addControl(increaseButton);

  //minus button
  const decreaseButton = BABYLON.GUI.Button.CreateImageButton(
    "DecreasseSize",
    "-"
  );
  decreaseButton.width = "0.1";
  decreaseButton.height = "0.05";
  decreaseButton.background = "#ff6d43";
  decreaseButton.color = "black";
  // Create a TextBlock for the button
  var textBlock = new BABYLON.GUI.TextBlock();
  textBlock.text = "-"; // Set the button text
  textBlock.color = "black"; // Set text color
  textBlock.fontSize = 80; // Set font size
  // Center the text inside the button
  textBlock.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  textBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  // Add the TextBlock to the button
  decreaseButton.addControl(textBlock);
  decreaseButton.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  decreaseButton.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  decreaseButton.left = "50px"; // Position above the place button
  decreaseButton.isVisible = false;
  advancedTexture.addControl(decreaseButton);

  //namaste btn
  var namasteimgButton = BABYLON.GUI.Button.CreateImageWithCenterTextButton(
    "namasteimgButton",
    "",
    "./scenes/namaste.png"
  ); // Replace with your image path
  // Set button properties
  namasteimgButton.width = "0.12"; // Adjust size as needed
  namasteimgButton.height = "0.06";
  namasteimgButton.background = "#ff6d43";
  namasteimgButton.color = "black";
  // Set the image properties
  namasteimgButton.image.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM; // Maintain aspect ratio
  namasteimgButton.image.thickness = 0; // Remove button border if needed
  namasteimgButton.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  namasteimgButton.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  namasteimgButton.left = "-50px"; // Position above the place button
  namasteimgButton.top = "150px";
  namasteimgButton.isVisible = false;
  // Add the button to the GUI
  advancedTexture.addControl(namasteimgButton);

  //Idle animation btn
  var IdleimageButton = BABYLON.GUI.Button.CreateImageWithCenterTextButton(
    "IdleimageButton",
    "Idle",
    ""
  ); // Replace with your image path
  // Set button properties
  IdleimageButton.width = "0.12"; // Adjust size as needed
  IdleimageButton.height = "0.06";
  IdleimageButton.background = "#ff6d43";
  IdleimageButton.color = "black";
  IdleimageButton.fontSize = 40;
  // Set the image properties
  IdleimageButton.image.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM; // Maintain aspect ratio
  IdleimageButton.image.thickness = 0; // Remove button border if needed
  IdleimageButton.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  IdleimageButton.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  IdleimageButton.left = "-50px"; // Position above the place button
  IdleimageButton.top = "350px";
  IdleimageButton.isVisible = false;
  // Add the button to the GUI
  advancedTexture.addControl(IdleimageButton);

  //toogle UI btn
  var toogleUIButton = BABYLON.GUI.Button.CreateImageWithCenterTextButton(
    "toogleUIButton",
    "",
    "./scenes/info.png"
  ); // Replace with your image path
  // Set button properties
  toogleUIButton.width = "0.1"; // Adjust size as needed
  toogleUIButton.height = "0.05";
  toogleUIButton.background = "#ff6d43";
  toogleUIButton.color = "black";

  // Adjust image position and size for padding
  //toogleUIButton.image.left = "5px"; // Adjust for left padding
  //toogleUIButton.image.top = "5px"; // Adjust for top padding
  toogleUIButton.image.width = "80%"; // Adjust width to fit with padding
  toogleUIButton.image.height = "80%"; // Adjust height to fit with padding
  // Set the image properties
  toogleUIButton.image.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM; // Maintain aspect ratio
  toogleUIButton.image.thickness = 0; // Remove button border if needed
  toogleUIButton.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  toogleUIButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  toogleUIButton.left = "50px"; // Position above the place button
  toogleUIButton.top = "150px";
  toogleUIButton.isVisible = false;
  // Add the button to the GUI
  advancedTexture.addControl(toogleUIButton);

  // Create a button
  var PlaceAvatar = BABYLON.GUI.Button.CreateImageButton("PlaceAvatar", "");
  PlaceAvatar.width = "0.2";
  PlaceAvatar.height = "0.05";
  PlaceAvatar.background = "#ff6d43";
  PlaceAvatar.isVisible = false;
  // Create a TextBlock for the button
  var textBlock = new BABYLON.GUI.TextBlock();
  textBlock.text = "Tap To Place"; // Set the button text
  textBlock.color = "black"; // Set text color
  textBlock.fontSize = 30; // Set font size
  // Center the text inside the button
  textBlock.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  textBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  // Add the TextBlock to the button
  PlaceAvatar.addControl(textBlock);
  PlaceAvatar.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  PlaceAvatar.top = "-100px"; // Adjust as needed
  // Add the button to the GUI
  advancedTexture.addControl(PlaceAvatar);

  const model = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "./scenes/",
    "EVI_005.glb",
    scene,
    null,
    null,
    true
  ); //EVI_anim,evii002 2
  model.meshes.forEach((mesh) => {
    mesh.isVisible = false;
    mesh.rotation.y = Math.PI; // 180 degrees in radians
    //mesh.scaling.x = -1; // Flip horizontally if needed
    mesh.scaling.x = Math.abs(mesh.scaling.x);
    mesh.scaling = new BABYLON.Vector3(0.85, 0.85, 0.85); // Scale to twice the size
    //mesh.position=new BABYLON.Vector3(0,0.2,5);
  });

  model.rotationQuaternion = new BABYLON.Quaternion();

  // Function to play any animation by name
  function playAnimationByName(animationName, loop = false) {
    var animationGroups = model.animationGroups;
    console.log(
      "animation after loading extra are:- ",
      model.animationGroups.map((group) => group.name)
    );
    const animationGroup = animationGroups.find(
      (group) => group.name === animationName
    );
    if (animationGroup) {
      // Stop any currently playing animation
      animationGroups.forEach((group) => {
        if (group.isPlaying) {
          group.stop(); // Stop any currently playing animation
        }
      });

      // Reset the animation to the start
      animationGroup.goToFrame(0); // Reset to the first frame

      // Start the new animation
      animationGroup.start(loop); // Play the animation
    } else {
      console.error(`Animation "${animationName}" not found.`);
    }
  }

  var xr = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      referenceSpaceType: "local-floor",
      onError: (error) => {
        alert(error);
      },
    },
    optionalFeatures: true,
  });

  const fm = xr.baseExperience.featuresManager;

  const xrTest = fm.enableFeature(BABYLON.WebXRHitTest.Name, "latest");
  //const xrPlanes = fm.enableFeature(BABYLON.WebXRPlaneDetector.Name, "latest");
  const anchors = fm.enableFeature(BABYLON.WebXRAnchorSystem.Name, "latest");

  const xrBackgroundRemover = fm.enableFeature(
    BABYLON.WebXRBackgroundRemover.Name
  );

  //const marker = BABYLON.MeshBuilder.CreateTorus('marker', { diameter: 0.15, thickness: 0.05 });
  // marker.isVisible = false;
  // marker.rotationQuaternion = new BABYLON.Quaternion();

  ARbtn.addEventListener("click", function () {
    var AR = document.querySelector(".babylonVRicon");
    AR.click();
  });

  // Create a plane instead of a torus
  const planeSize = 0.2; // Adjust size as needed
  const marker = BABYLON.MeshBuilder.CreatePlane(
    "marker",
    { size: planeSize },
    scene
  );

  // Create a material with a texture
  const markerMaterial = new BABYLON.StandardMaterial("markerMaterial", scene);
  markerMaterial.diffuseTexture = new BABYLON.Texture(
    "./scenes/Crosshairs_Red.png",
    scene
  ); // Replace with your texture path
  markerMaterial.backFaceCulling = false; // To see it from both sides if needed
  markerMaterial.diffuseTexture.hasAlpha = true; // Enable alpha channel for the texture
  // Assign the material to the plane
  marker.material = markerMaterial;

  // Set the initial position or rotation if needed
  marker.rotation.x = Math.PI / 2; // Rotate to make it horizontal if needed
  marker.isVisible = false; // Keep it hidden initially

  let hitTest;

  xrTest.onHitTestResultObservable.add((results) => {
    if (results.length) {
      marker.isVisible = true;
      scanImage.isVisible = false;
      PlaceAvatar.isVisible = true;
      hitTest = results[0];
      // hitTest.transformationMatrix.decompose(undefined, b.rotationQuaternion, b.position);
      hitTest.transformationMatrix.decompose(
        undefined,
        marker.rotationQuaternion,
        marker.position
      );
      // Adjust the Y position to be slightly above the detected hit point
      const offset = 0.01; // 1 centimeter (10 mm) above the ground
      marker.position.y += offset;
    } else {
      marker.isVisible = false;
      //scanImage.isVisible = true;
      //PlaceAvatar.isVisible = false;
      hitTest = undefined;
    }
  });

  if (anchors) {
    console.log("anchors attached");
    anchors.onAnchorAddedObservable.add((anchor) => {
      console.log("attaching", anchor);

      anchor.attachedNode = model.meshes[0];
      anchor.attachedNode.skeleton = model.skeletons[0];
      anchor.attachedNode.scaling = new BABYLON.Vector3(0.85, 0.85, 0.85); // Set scaling here
      shadowGenerator.addShadowCaster(anchor.attachedNode, true);
    });

    anchors.onAnchorRemovedObservable.add((anchor) => {
      console.log("disposing", anchor);
      if (anchor) {
        anchor.attachedNode.isVisible = false;
        anchor.attachedNode.dispose();
      }
    });
  }

  // Add an event listener for the button
  PlaceAvatar.onPointerClickObservable.add(async function () {
    console.log("@@@1");
    if (
      hitTest &&
      anchors &&
      xr.baseExperience.state === BABYLON.WebXRState.IN_XR
    ) {
      console.log("@@@2");
      anchors.addAnchorPointUsingHitTestResultAsync(hitTest);
      model.meshes.forEach((mesh) => {
        mesh.isVisible = true;
        //mesh.scaling = new BABYLON.Vector3(-0.65, 0.65, 0.65); // Scale to twice the size
      });
    }
    playAnimationByName("Standing IDle", true);
    decreaseButton.isVisible = true;
    increaseButton.isVisible = true;
    namasteimgButton.isVisible = true;
    IdleimageButton.isVisible = true;
    toogleUIButton.isVisible = true;
  });

  let scaleFactor = 0.1; // Factor by which to scale

  increaseButton.onPointerClickObservable.add(() => {
    model.meshes.forEach((mesh) => {
      mesh.scaling.addInPlace(
        new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor)
      );
    });
  });

  decreaseButton.onPointerClickObservable.add(() => {
    model.meshes.forEach((mesh) => {
      const newScale = mesh.scaling.subtract(
        new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor)
      );
      mesh.scaling = new BABYLON.Vector3(
        Math.max(newScale.x, 0.1),
        Math.max(newScale.y, 0.1),
        Math.max(newScale.z, 0.1)
      ); // Prevent negative scaling
    });
  });

  // Add an event listener for button clicks
  namasteimgButton.onPointerDownObservable.add(() => {
    console.log("namaste button clicked!");
    playAnimationByName("Namaste", false);
  });

  // Add an event listener for button clicks
  IdleimageButton.onPointerDownObservable.add(() => {
    console.log("Idle anim button clicked!");
    playAnimationByName("Standing IDle", true);
  });

  let istoggle=true;
  // Add an event listener for button clicks
  toogleUIButton.onPointerDownObservable.add(() => {
    console.log("toogleUIButton button clicked!");
    istoggle=!istoggle;
    if(!istoggle)
    {
      PlaceAvatar.isVisible = false; // Show the button
      decreaseButton.isVisible = false;
      increaseButton.isVisible = false;
      namasteimgButton.isVisible = false;
      IdleimageButton.isVisible = false;
    }else{
      PlaceAvatar.isVisible = true; // Show the button
      decreaseButton.isVisible = true;
      increaseButton.isVisible = true;
      namasteimgButton.isVisible = true;
      IdleimageButton.isVisible = true;  
    }
  });

  scene.onPointerDown = (evt, pickInfo) => { };

  xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
    PlaceAvatar.isVisible = false; // Show the button
    decreaseButton.isVisible = false;
    increaseButton.isVisible = false;
    namasteimgButton.isVisible = false;
    IdleimageButton.isVisible = false;
    toogleUIButton.isVisible = false;
    scanImage.isVisible = true;
    infoText.isVisible = true;
    //planes.forEach(plane => plane.dispose());
    //while (planes.pop()) { };
  });

  // Hide the screenshot button when AR session ends
  xr.baseExperience.sessionManager.onXRSessionEnded.add(() => {
    PlaceAvatar.isVisible = false; // Show the button
    decreaseButton.isVisible = false;
    increaseButton.isVisible = false;
    namasteimgButton.isVisible = false;
    IdleimageButton.isVisible = false;
    toogleUIButton.isVisible = false;
    scanImage.isVisible = false;
    marker.isVisible = false;
    infoText.isVisible = false;
  });

  return scene;
};
window.initFunction = async function () {
  var asyncEngineCreation = async function () {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.log(
        "the available createEngine function failed. Creating the default engine instead"
      );
      return createDefaultEngine();
    }
  };

  window.engine = await asyncEngineCreation();
  if (!engine) throw "engine should not be null.";
  startRenderLoop(engine, canvas);
  window.scene = createScene();
};
initFunction().then(() => {
  scene.then((returnedScene) => {
    sceneToRender = returnedScene;
  });
});

// Resize
window.addEventListener("resize", function () {
  engine.resize();
});
