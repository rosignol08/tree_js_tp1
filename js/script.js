import * as THREE from 'three';
import { GLTFLoader } from 'gltf';
import { OrbitControls } from './OrbitControls.js';
//import * as FONC from './mesfonctions.js';
//le canvas
let cnv = document.querySelector('#canvas');
if (!cnv) {
    console.error("Canvas introuvable !");
}


class AABBox {
    constructor() {
      this.min = new THREE.Vector3();
      this.max = new THREE.Vector3();
    }
    initWithCube(cube) {
      let pos = cube.position;
      let width = cube.geometry.parameters.width;
      let height = cube.geometry.parameters.height;
      let depth = cube.geometry.parameters.depth;
      this.min = new THREE.Vector3(
        pos.x - width / 2,
        pos.y - height / 2,
        pos.z - depth / 2
      );
      this.max = new THREE.Vector3(
        pos.x + width / 2,
        pos.y + height / 2,
        pos.z + depth / 2
      );
    }
    collision(anotherAabb) {
      if (this.max.x < anotherAabb.min.x || this.min.x > anotherAabb.max.x)
        return false;
      if (this.max.y < anotherAabb.min.y || this.min.y > anotherAabb.max.y)
        return false;
      if (this.max.z < anotherAabb.min.z || this.min.z > anotherAabb.max.z)
        return false;
      return true;
    }
    initWithObj(obj) {
        let minx = obj.geometry.attributes.position.array[0];
        let miny = obj.geometry.attributes.position.array[1];
        let minz = obj.geometry.attributes.position.array[2];
        let maxx = minx;
        let maxy = miny;
        let maxz = minz;
        for(let i = 1; i < obj.geometry.attributes.position.count; i++) {
            let nx = obj.geometry.attributes.position.array[i*3]; let ny = obj.geometry.attributes.position.array[1+i*3];
            let nz = obj.geometry.attributes.position.array[2+i*3];
            if(nx < minx) minx = nx;
            if(ny < miny) miny = ny;
            if(nz < minz) minz = nz;
            if(nx > maxx) maxx = nx;
            if(ny > maxy) maxy = ny;
            if(nz > maxz) maxz = nz;
        }
        this.min = new THREE.Vector3(obj.position.x+minx,
        obj.position.y+miny,obj.position.z+minz);
        this.max = new THREE.Vector3(obj.position.x+maxx,
        obj.position.y+maxy,obj.position.z+maxz);
    }
}
  
function cree_collision_sphere(obj) {
    let aabb = new AABBox();
    aabb.initWithObj(obj);//on utilise la fonction initWithObj
    return aabb;
}

/**
 * cree un cube avec des dimention et une couleur (c'est pratique les doc).
 *
 * @param {number} x - la coordonnée x du cube.
 * @param {number} y - la coordonnée y du cube.
 * @param {number} z - la coordonnée z du cube.
 * @param {number} w - la largeur du cube.
 * @param {number} h - la hauteur du cube.
 * @param {number} d - la profondeur du cube.
 * @param {number|string} color - la couleur du cube.
 * @returns {THREE.Mesh} - le cube crée.
 */

function cree_cube(x, y, z, w, h, d, color){
  let geometry = new THREE.BoxGeometry(w, h, d);
  let material = new THREE.MeshBasicMaterial({ color: color });
  let cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z);
  return cube;
}


function cree_cube_texture(x, y, z, w, h, d, material){
    let geometry = new THREE.BoxGeometry(w, h, d);
    let cube = new THREE.Mesh(geometry, material);
    cube.receiveShadow = true; //recevoir des ombres
    cube.position.set(x, y, z);
    return cube;
}


//face 0: extérieur, 1: intérieur
function cree_sphere(x, y, z, r, color, face){
    let geometry = new THREE.SphereGeometry(r, 20, 20);
    let material;
    if (face == 0 ){
        material = new THREE.MeshBasicMaterial({ color: color });
    }
    if (face == 1){
        material = new THREE.MeshBasicMaterial({ color: color, side: THREE.BackSide });
    }
    let sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    return sphere;
}
//face 0: extérieur, 1: intérieur
function cree_sphere_texture(x, y, z, r, texture, face){
    let geometry = new THREE.SphereGeometry(r, 20, 20);
    let material;
    if (face == 0 ){
      material = new THREE.MeshBasicMaterial({ map: texture });
  }
  if (face == 1){
      material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  }
    let sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    return sphere;
}
//pour une collision en forme de cube
function cree_collision_box(obj) {
    let aabb = new AABBox();
    aabb.initWithObj(obj);
    return aabb;
}

//initialisation du renderer
const renderer = new THREE.WebGLRenderer({ canvas: cnv, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Activer les ombres
//création de la scène et la caméra
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);//todo
camera.position.z = 5;

//const controls = new OrbitControls(camera, renderer.domElement);
//les lumières etc
//let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
//hemiLight.position.set(0, 0, 0);
//scene.add(hemiLight);

//spotlight (pas super utile mais stylé)
let spotLight = new THREE.SpotLight(0xffff99,2);
spotLight.position.set(0, 1, 0);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 100;
spotLight.rotation.z = 0.5;
spotLight.position.set(3, 4, 2);
scene.add(spotLight);


//brouillard todo
let color = 0xbdbcbe;  // white
let near = 3;
let far = 10;
scene.fog = new THREE.Fog(color, near, far);

//lumière directionnelle
let dirLight = new THREE.DirectionalLight(0xffffff,0.5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 100;
scene.add(dirLight);
dirLight.position.set(3, 4, 2);
//let hlight = new THREE.AmbientLight(0xffffff, 0.5);
//scene.add(hlight);

//les objets
//charge les textures
const textureLoader = new THREE.TextureLoader();
const diffuseTexture = textureLoader.load('./js/assets/textures/snow_02_diff_1k.jpg');
diffuseTexture.wrapS = THREE.RepeatWrapping;
diffuseTexture.wrapT = THREE.RepeatWrapping;
diffuseTexture.repeat.set(5, 5); // répéter la texture 4 fois sur chaque axe
const normalTexture = textureLoader.load('./js/assets/textures/snow_02_nor_gl_1k.jpg');
normalTexture.wrapS = THREE.RepeatWrapping;
normalTexture.wrapT = THREE.RepeatWrapping;
normalTexture.repeat.set(5, 5);
const aoTexture = textureLoader.load('./js/assets/textures/snow_02_ao_1k.jpg');
aoTexture.wrapS = THREE.RepeatWrapping;
aoTexture.wrapT = THREE.RepeatWrapping;
aoTexture.repeat.set(5, 5);
const roughnessTexture = textureLoader.load('./js/assets/textures/snow_02_arm_1k.jpg');
roughnessTexture.wrapS = THREE.RepeatWrapping;
roughnessTexture.wrapT = THREE.RepeatWrapping;
roughnessTexture.repeat.set(5, 5);
const metalnessTexture = textureLoader.load('./js/assets/textures/snow_02_arm_1k.jpg');
metalnessTexture.wrapS = THREE.RepeatWrapping;
metalnessTexture.wrapT = THREE.RepeatWrapping;
metalnessTexture.repeat.set(5, 5);

//le material
const material = new THREE.MeshStandardMaterial({
    map: diffuseTexture,
    normalMap: normalTexture,
    aoMap: aoTexture,
    roughnessMap: roughnessTexture,
    metalnessMap: metalnessTexture,
    roughness: 0.5,
    metalness: 1.0
});
let sol = cree_cube_texture(0, -1, 0, 25, 0, 25, material);
sol.rotation.x = 3.15;

function getRandomCoordinate(min, max) {
  return Math.random() * (max - min) + min;
}
let min_bas = 1;
let max_haut = 7;
function getRandomPosition(minX, maxX, minY, maxY, minZ, maxZ) {
  return {
    x: getRandomCoordinate(minX, maxX),
    y: getRandomCoordinate(minY, maxY),
    z: getRandomCoordinate(minZ, maxZ)
  };
}

//la meme que la fonction précédente mais avec les coordonnées à exclure
function getRandomPosition_sauf(minX, maxX, minY, maxY, minZ, maxZ, excludeMinX, excludeMaxX, excludeMinY, excludeMaxY, excludeMinZ, excludeMaxZ) {
  let x, y, z;
  do {
      x = Math.random() * (maxX - minX) + minX;
      y = Math.random() * (maxY - minY) + minY;
      z = Math.random() * (maxZ - minZ) + minZ;
  } while (
      (x >= excludeMinX && x <= excludeMaxX) || // Exclusion indépendante pour X
      (z >= excludeMinZ && z <= excludeMaxZ)    // Exclusion indépendante pour Z
  );
  return { x, y, z };
}



let randomPosition = getRandomPosition(-1, 1, 0, 1, -1, 1);
console.log(randomPosition.x, randomPosition.y, randomPosition.z);

//let sol = cree_cube(0,-1.2,0,2.5,0,2.5,0xffffff);
cree_collision_box(sol);
//let sphere = cree_sphere(0, 0, 0, 1, 0x0000ff);
//cree_collision_sphere(sphere);
let sphere_dome = cree_sphere(0, 0, 0, 10, 0xffffff, 1);
//let sphere_dome = cree_sphere(0, 0, 0, 5,0xffffff,0);
scene.add(sphere_dome);

scene.add(sol);

//j'ajoute la velocite
//sphere.velocity = new THREE.Vector3(0, -0.1, 0);

const gravity = 0.001; //la gravitée

function gravite(obj) {
  obj.velocity.y -= gravity;
}

function detectAndRebound(obj, sol, obj2) {
  let aabbObj2 = cree_collision_box(obj2);
  let aabbObj = cree_collision_box(obj);
  let aabbSol = cree_collision_box(sol);
  if (aabbObj.collision(aabbSol)) {
    //console.log("Collision detectee, bouncing");
    let normal = new THREE.Vector3(0, 1, 0); //normal du sol
    rebondir(obj, normal);
  }
  if (aabbObj.collision(aabbObj2)) {
    //console.log("Collision detectee, bouncing");
    let normal = new THREE.Vector3(0, 1, 0); //normal du sol
    rebondir(obj, normal);
  }
}

function rebondir(obj, normal) {
  let dot = obj.velocity.dot(normal);
  let reflection = obj.velocity.sub(normal.multiplyScalar(2 * dot));
  obj.velocity.copy(reflection);

  //plus 
  obj.velocity.multiplyScalar(0.3);

  //saut unpeu
  obj.position.y = sol.position.y + sol.geometry.parameters.height / 2 + obj.geometry.parameters.height / 2 + 0.03;
}

//pour charger le renard
  let model = undefined;
  let loader = new GLTFLoader();
  let data = await loader.loadAsync('./js/assets/fox_minecraft.glb');
  model = data.scene;
  //on active la projection d'ombres pour chaque sous-objet
  model.traverse(function(child) {
    if (child.isMesh) {
        child.castShadow = true;
    }
  });
  model.position.y = -0.8;
  //model.position.x = 0;
  //model.position.z = 0;
  model.scale.x = 0.2;
  model.scale.y = 0.2;
  model.scale.z = 0.2;
  model.rotation.y = 1.5;
  let mixer = new THREE.AnimationMixer(model);
  const action = mixer.clipAction(data.animations[0]);
  action.play();
  scene.add(model);
//fin chargement renard

//pour les arbres
function spawn_arbres(arbres, model_arbre, nb_arbres, scene) {
  //pour les coordonnées des arbres
  let minX = -7;
  let maxX = 7;
  let minZ = -7;
  let maxZ = 7;
  let excludeMinX = -1.5;
  let excludeMaxX = 1.5;
  let excludeMinZ = -1.5;
  let excludeMaxZ = 1.5;

  for (let i = 0; i < nb_arbres; i++) {
    let randomPosition_arbre = getRandomPosition_sauf(minX, maxX, 0, 0, minZ, maxZ, excludeMinX, excludeMaxX, 0, 0, excludeMinZ, excludeMaxZ);
    
    //je clone le modèle d'arbre avant de modifier sa position et l'ajouter à la scène psk sinon c'est le même objet qui est ajouté
    let arbre_clone = model_arbre.clone();
    
    arbre_clone.position.set(randomPosition_arbre.x, -1, randomPosition_arbre.z);
    
    arbres.push(arbre_clone);
    scene.add(arbre_clone);
    //console.log(randomPosition_arbre.x, randomPosition_arbre.z);
  }
  return arbres;
}

function respawn_arbre(arbre) {
  let randomPosition_arbre = getRandomPosition_sauf(-7, 7, 0, 0, 2, 7, -1.5, 1.5, 0, 0, -1.5, 1.5);
  arbre.position.set(randomPosition_arbre.x, -1, randomPosition_arbre.z);
}

function remonte(obj) {
  randomPosition = getRandomPosition(-3, 3, min_bas, max_haut, -3, 3);
  obj.position.set(randomPosition.x, randomPosition.y, randomPosition.z);
  obj.velocity = new THREE.Vector3(0, -0.01, 0);
  obj.material.color.set(0xffffff);//pour remettre la couleur blanche
}

function cree_neige(nbCubes, scene) {
  let cubes = [];
  for (let i = 0; i < nbCubes; i++) {
      let randomPosition = getRandomPosition(-2, 2, min_bas, max_haut, -2, 2);
      let cube = cree_cube(randomPosition.x, randomPosition.y, randomPosition.z, 0.01, 0.01, 0.01, 0xffffff);
      cube.velocity = new THREE.Vector3(0, -0.01, 0); // Initialisation de la vélocité
      cube.castShadow = true; // Projection d'ombres
      scene.add(cube); // Ajout du cube à la scène
      cubes.push(cube); // Ajout du cube à la liste
  }
  return cubes;
}

function cree_neige_collision(liste_cube, nbCubes, scene) {
  let cubes_aabb = [];
  for (let i = 0; i < nbCubes; i++) {
    //cree_collision_box(liste_cube[i]); // Ajout de la collision
    cubes_aabb.push(cree_collision_box(liste_cube[i])); // Ajout de la collision à la liste
  }
  return cubes_aabb;
}

function assombrirCouleur(cube, intensite = 1) {
  let couleur = cube.material.color;

  // Calcul du facteur avec intensité amplifiée
  // Si l'intensité est supérieure à 1, le changement de couleur sera plus rapide
  let facteur = Math.min(Math.max(1 - Math.abs(cube.position.y) / (5 / intensite), 0), 1);

  // Réduction de chaque composante en fonction du facteur
  couleur.r = Math.max(facteur, 0);
  couleur.g = Math.max(facteur, 0);
  couleur.b = Math.max(facteur, 0);

  // Mise à jour de la couleur du matériau
  cube.material.color.setRGB(couleur.r, couleur.g, couleur.b);
}



const nombre_cubes = 300;
// Création et ajout de x cubes
let cubes = cree_neige(nombre_cubes, scene);

//creation arbres
let model_arbre = undefined;
let loader_arbre = new GLTFLoader();
let data_arbre = await loader_arbre.loadAsync('./js/assets/low_poly_spruce_tree_01.glb');
model_arbre = data_arbre.scene;
//on active la projection d'ombres pour chaque sous-objet
model_arbre.traverse(function(child) {
  if (child.isMesh) {
      child.castShadow = true;
  }
});
model_arbre.scale.x = 0.3;
model_arbre.scale.y = 0.3;
model_arbre.scale.z = 0.3;
//scene.add(model_arbre);
let arbres = [];
let nombre_arbres = 10;
spawn_arbres(arbres,model_arbre,nombre_arbres,scene);
camera.rotation.x = -0.3;
camera.rotation.y = 0.4;
camera.rotation.z = 0.1;
camera.position.z = 3;
camera.position.x = 1.5;
//camera.rotation.z = 0.3;
function animate(timestamp) {
  let aabbSol = cree_collision_box(sol);
  let aabb_cubes = cree_neige_collision(cubes,nombre_cubes, scene);
  //met a jour la position des objets en fonction de leur velocite
  for (let i = 0; i < nombre_cubes; i++) {
    cubes[i].position.add(cubes[i].velocity);
    assombrirCouleur(cubes[i], 4);
    if(aabb_cubes[i].collision(aabbSol)) {
      remonte(cubes[i]);
    }
  }
  if (!scene.children.includes(sol)) {
    scene.add(sol);
  }
  for (let i = 0; i < nombre_arbres; i++) {
    arbres[i].position.z -=  0.005;
    if (arbres[i].position.z < -7) {
      respawn_arbre(arbres[i]);
    }
  }
  //let test = getRandomPosition_sauf(-7, 7, 0, 0, -7, 7, -2, 2, 0, 0, -2, 2);
  //console.log(test.x, test.y, test.z);
  mixer.update(1/200);//vitesse de l'animation du renard
   //textureLoader = new THREE.TextureLoader();
   diffuseTexture.offset.y -= 0.001;
   normalTexture.offset.y -= 0.001;
   aoTexture.offset.y -= 0.001;
   roughnessTexture.offset.y -= 0.001;
   metalnessTexture.offset.y -= 0.001;
  //checkCollisions(cubes, sol);
  //dirLight.position.z -=1;
  renderer.render(scene, camera);
  //controls.update();
  requestAnimationFrame(animate);
}
animate();

//redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
