// 导入多语言支持
  import { t, createLanguageSwitcher, translateBrainRegion } from './lang.js';


// 添加语言切换器组件
function _languageSwitcher() {
  return createLanguageSwitcher();
}

// 创建一个按进化层级分组的区域列表
function _getRegionsByEvolutionaryLevel(atlasTable) {
  const groupedRegions = {
    "爬行动物脑": [],
    "边缘系统": [],
    "新皮层": []
  };
  
  if (!atlasTable || atlasTable.length === 0) return groupedRegions;
  
  atlasTable.forEach(region => {
    const level = _getEvolutionaryLevel(region.name);
    groupedRegions[level.name].push(region);
  });
  
  return groupedRegions;
}

// 创建全局映射，将显示名称关联到原始索引
let brainRegionMap = new Map();

function _selectAtlas(Inputs,atlasTable){
  // 清空全局映射
  brainRegionMap.clear();
  const options = [];
  
  // 添加爬行动物脑区域，确保正确映射索引
  options.push("--- 爬行动物脑（红色）---");
  atlasTable.forEach((e, i) => {
    if (_getEvolutionaryLevel(e.name).name === "爬行动物脑") {
      const displayName = translateBrainRegion(e.name);
      options.push(displayName);
      brainRegionMap.set(displayName, i);
    }
  });
  
  // 添加边缘系统区域
  options.push("--- 边缘系统（橙色）---");
  atlasTable.forEach((e, i) => {
    if (_getEvolutionaryLevel(e.name).name === "边缘系统") {
      const displayName = translateBrainRegion(e.name);
      options.push(displayName);
      brainRegionMap.set(displayName, i);
    }
  });
  
  // 添加新皮层区域
  options.push("--- 新皮层（蓝色）---");
  atlasTable.forEach((e, i) => {
    if (_getEvolutionaryLevel(e.name).name === "新皮层") {
      const displayName = translateBrainRegion(e.name);
      options.push(displayName);
      brainRegionMap.set(displayName, i);
    }
  });
  
  return Inputs.select(options, { label: t("selectAtlas") });
}

  // 添加一个新函数用于显示进化层级说明
  function _evolutionaryLevelsInfo(md) {
  return md`
  ### 大脑的进化层级
  
  **爬行动物脑（红色）**：最底层，包括脑干、小脑等结构，负责基本生存功能如呼吸、心跳和本能反应。
  
  **边缘系统（橙色）**：中间层，包括杏仁核、海马体等结构，负责情绪、记忆和社交动机。
  
  **新皮层（蓝色）**：最高层，尤其是前额叶皮层，负责抽象思维、决策和自我意识，是人类大脑最发达的部分。
  `;
}

function _3(atlasColor,selectAtlas,htl){return(
htl.html`<h2 style="color: ${atlasColor}">${selectAtlas}</h2>
<div id='webgl'>
</div>`
)}

function _4(renderer){return(
renderer.domElement
)}

function _atlasColor(Inputs){return(
Inputs.color({ label: t("atlasColor"), value: "#FF0000" })
)}

function _checkboxes(Inputs){return(
Inputs.checkbox([t("showHelpers"), t("animation")], {
  label: t("options"),
  value: ["", t("animation")]
})
)}


function _redrawButton(Inputs){return(
Inputs.button(t("redrawButton"))
)}

function _atlasTableSearch(Inputs,atlasTable){return(
Inputs.search(atlasTable, {
  placeholder: t("searchAtlas")
})
)}

function _table1(Inputs,atlasTableSearch){return(
Inputs.table(atlasTableSearch)
)}

function _options(checkboxes)
{
  const toggleHelpers = checkboxes.includes(t("showHelpers"));
  const toggleAnimation = checkboxes.includes(t("animation"));
  return {
    toggleHelpers,
    toggleAnimation
  };
}


function _keyword(selectAtlas, atlasTable)
{
  // 找到原始的区域名称（不翻译的版本）
  let originalRegionName = selectAtlas;
  
  // 如果selectAtlas是翻译后的名称，尝试找到对应的原始名称
  if (atlasTable && atlasTable.length > 0) {
    // 尝试使用name属性匹配（与_mkSelectAtlasModel保持一致）
    let foundRegion = atlasTable.find(e => e.name === selectAtlas);
    
    // 如果直接匹配失败，尝试通过翻译后的名称查找原始名称
    if (!foundRegion) {
      foundRegion = atlasTable.find(e => translateBrainRegion(e.name) === selectAtlas);
    }
    
    // 兼容之前使用Region属性的代码
    if (!foundRegion && atlasTable[0].Region) {
      foundRegion = atlasTable.find(e => translateBrainRegion(e.Region) === selectAtlas);
    }
    
    if (foundRegion) {
      originalRegionName = foundRegion.name || foundRegion.Region || selectAtlas;
    }
  }
  
  // 处理关键词，保持原有逻辑但使用原始区域名称
  let keyword = originalRegionName.slice(0, -2);
  keyword = keyword.split(",")[0];
  keyword = keyword.split("(")[0];
  while (keyword.endsWith(" ")) {
    keyword = keyword.slice(0, -1);
  }
  keyword = keyword.replaceAll(" ", "-");
  keyword = keyword.toLowerCase();
  return keyword;
}


function* _14(cube,options,brain,atlas,spheres,helpBrain,helpAtlas,renderer,scene,camera)
{
  while (true) {
    cube.rotation.z += 0.03;
    cube.rotation.y += 0.02;

    if (options.toggleAnimation) {
      brain.rotation.y += 0.01;
      atlas.rotation.y = brain.rotation.y;
      spheres.rotation.y = brain.rotation.y;

      if (options.toggleHelpers) {
        helpBrain.update();
        helpAtlas.update();
      }
    }

    renderer.render(scene, camera);
    // stats.update();
    yield null;
  }
}


function _16(md){return(
md`## ${t('meshes')}`
)}

function _cube(THREE)
{
  const material = new THREE.MeshNormalMaterial();
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  const cube = new THREE.Mesh(geometry, material);
  cube.position.y = 0;
  cube.position.x = 100;
  cube.position.z = 100;
  return cube;
}


function _spheres(atlasTable,THREE){
  const table = atlasTable;

  const material = new THREE.MeshNormalMaterial();

  const mkSphere = (e) => {
    const { x, y, z } = e;
    const geometry = new THREE.SphereGeometry(1);
    geometry.translate(-45, -50 * 0, -45);
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = parseInt(x);
    sphere.position.y = parseInt(z);
    sphere.position.z = parseInt(y);
    // 如果有区域名称，可以添加翻译后的名称作为标签
    if (e.Region) {
      const nameTag = document.createElement('div');
      nameTag.textContent = translateBrainRegion(e.Region);
      // 这里可以根据需要设置标签的样式和位置
    }
    return sphere;
  };

  const spheres = table.map(mkSphere);

  const group = new THREE.Group();

  spheres.map((e) => group.add(e));
  // group.translate(-45, -50 * 0, -45);

  // group.add(spheres[0]);

  return group;
}


function _19(scene,spheres)
{
  // for (const sphere of spheres) {
  //   scene.add(sphere);
  // }
  scene.add(spheres);
}


function _brainGeometry(mkVertices,brainModel,mkGeometry)
{
  const vertices = mkVertices(brainModel);
  const geometry = mkGeometry(vertices);
  // geometry.computeVertexNormals();
  geometry.translate(-45, -50 * 0, -45);
  return geometry;
}


function _brain(THREE,brainGeometry)
{
  const material = new THREE.MeshPhongMaterial({
    color: "hsl(0,100%,100%)",
    opacity: 0.3,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(brainGeometry, material);

  return mesh;
}


function _helpBrain(THREE,brain)
{
  const help = new THREE.BoxHelper(brain);
  return help;
}


function _atlasGeometry(mkVertices,atlasModel,mkGeometry)
{
  const vertices = mkVertices(atlasModel);
  const geometry = mkGeometry(vertices);
  // geometry.computeVertexNormals();
  geometry.translate(-45, -50 * 0, -45);
  return geometry;
}


// 根据进化层级分类大脑区域
function _getEvolutionaryLevel(regionName) {
  // 边缘系统（中间层）- 橙色
  const limbicSystemRegions = [
    "Parahippocampal Gyrus", "Cingulate Gyrus", "Subcallosal Cortex", "Temporal Pole",
    "Hippocampus", "Amygdala", "Septal Nuclei", "Hypothalamus", "Thalamus"
  ];
  
  // 检查是否属于边缘系统
  for (const region of limbicSystemRegions) {
    if (regionName.includes(region)) {
      return { name: "边缘系统", color: "#FFA500" }; // 橙色
    }
  }
  
  // 爬行动物脑（最底层）- 红色
  const reptilianBrainRegions = [
    "Brainstem", "Medulla", "Pons", "Midbrain", "Cerebellum", "Basal Ganglia"
  ];
  
  // 检查是否属于爬行动物脑
  for (const region of reptilianBrainRegions) {
    if (regionName.includes(region)) {
      return { name: "爬行动物脑", color: "#FF0000" }; // 红色
    }
  }
  
  // 默认是新皮层（最高层）- 蓝色
  return { name: "新皮层", color: "#0000FF" }; // 蓝色
}

function _atlas(THREE,atlasColor,atlasGeometry,brain)
{
  // 我们将使用_atlasColor作为默认颜色，但会在实际渲染时根据层级修改
  const material = new THREE.MeshPhongMaterial({
    color: atlasColor,
    opacity: 0.3,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(atlasGeometry, material);

  mesh.rotation.y = brain.rotation.y;

  return mesh;
}


function _helpAtlas(THREE,atlas)
{
  const help = new THREE.BoxHelper(atlas);
  return help;
}


function _26(scene,brain,atlas,options,helpBrain,helpAtlas,md)
{
  scene.add(brain);

  scene.add(atlas);

  if (options.toggleHelpers) {
    scene.add(helpBrain);
    scene.add(helpAtlas);
  }

  return md`### ${t('brain')}`;
}


function _27(scene,cube,md)
{
  scene.add(cube);
  return md`### ${t('cube')}`;
}


function _28(THREE,scene,options,md)
{
  let color = 0xffffff;
  const intensity = 1;
  const light = new THREE.AmbientLight(color, intensity);

  scene.add(light);

  color = 0x00ff00;
  const light1 = new THREE.SpotLight(color);
  light1.position.y = 100;
  scene.add(light1);

  if (options.toggleHelpers) {
    const helper1 = new THREE.SpotLightHelper(light1);
    scene.add(helper1);
  }

  return md`### ${t('lights')}`;
}


function _29(THREE,scene,md)
{
  // GRID HELPER
  var size = 200;
  var divisions = 8;
  const helper = new THREE.GridHelper(size, divisions);
  // helper.position.y = -70;
  scene.add(helper);

  return md`### ${t('floorGrid')}`;
}


function _30(md){return(
md`## ${t('sceneCameraRender')}`
)}

function _stats(Stats)
{
  const stats = new Stats();
  stats.domElement.style.left = "100px";
  return stats;
}


function _scene(redrawButton,atlasColor,checkboxes,selectAtlas,THREE)
{
  redrawButton;
  atlasColor;
  checkboxes;
  selectAtlas;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x001b42);
  return scene;
}


function _height(width){return(
width / 2
)}

function _camera(width,height,THREE)
{
  const fov = 45;
  const aspect = width / height;
  const near = 1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(150, 200, -150);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}


function _renderer(THREE,width,height,camera,scene,invalidation)
{
  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(width, height);
  renderer.setPixelRatio(devicePixelRatio);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", () => renderer.render(scene, camera));
  invalidation.then(() => (controls.dispose(), renderer.dispose()));
  return renderer;
}


function _36(md){return(
md`## ${t('meshModels')}`
)}

function _brainModel(mkBrainModel){return(
mkBrainModel()
)}

function _atlasModel(mkSelectAtlasModel){return(
mkSelectAtlasModel()
)}

function _39(md){return(
md`## ${t('toolbox')}`
)}

function _mkGeometry(THREE){return(
(vertices) => {
  const positions = [];
  const normals = [];
  const uvs = [];
  for (const vertex of vertices) {
    positions.push(...vertex.pos);
    normals.push(...vertex.norm);
    uvs.push(...vertex.uv);
  }

  const geometry = new THREE.BufferGeometry();
  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  const positionAttr = new THREE.BufferAttribute(
    new Float32Array(positions),
    positionNumComponents
  );
  const normalAttr = new THREE.BufferAttribute(
    new Float32Array(normals),
    normalNumComponents
  );
  const uvAttr = new THREE.BufferAttribute(
    new Float32Array(uvs),
    uvNumComponents
  );

  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("normal", normalAttr);
  geometry.setAttribute("uv", uvAttr);

  return geometry;
}
)}

function _mkVertices(normals){return(
(meshModel) => {
  const { positions, cells } = meshModel;
  const norms = normals(cells, positions);

  const vertices = [];

  const uv3 = [
    [0, 0],
    [0, 1],
    [1, 0]
  ];

  let pos, norm, uv;
  for (const cell of cells) {
    // vertices.push(cell);
    for (let i = 0; i < 3; i++) {
      pos = positions[cell[i]];
      norm = norms[cell[i]];
      uv = uv3[i];
      vertices.push({ pos, norm, uv });
    }
  }

  return vertices;
}
)}

function _mkSelectAtlasModel(atlasTable,selectAtlas,rawCellsAll,rawVerticesAll){return(
  () => {
    // 处理选择的分组标题（以---开头的值）
    if (selectAtlas.startsWith("---")) {
      // 如果选择的是分组标题，返回空模型
      return { cells: [], positions: [], colors: [] };
    }
    
    // 首先尝试通过全局映射获取索引
    const selectedIdx = brainRegionMap.get(selectAtlas);
    let foundAtlas;
    
    // 如果全局映射中有该索引
    if (selectedIdx !== undefined) {
      foundAtlas = atlasTable[selectedIdx];
    } else {
      // 当语言切换到中文时，需要找到对应的英文名称
      if (atlasTable && atlasTable.length > 0) {
        // 首先尝试直接匹配
        foundAtlas = atlasTable.find(e => e.name === selectAtlas);
        
        // 如果直接匹配失败，尝试通过翻译后的名称查找原始名称
        if (!foundAtlas) {
          foundAtlas = atlasTable.find(e => {
            // 对于每个英文名称，翻译后与selectAtlas比较
            const translatedName = translateBrainRegion(e.name);
            return translatedName === selectAtlas;
          });
        }
      }
    }
  
  // Add safety check to handle case where no matching atlas is found
  if (!foundAtlas) {
    console.warn(`No atlas found with name: ${selectAtlas}`);
    return { cells: [], positions: [], colors: [] };
  }
  
  const value = parseInt(foundAtlas.idx);
  const _cells = rawCellsAll.filter((e) => parseInt(e.idx) === value);
  const _vertices = rawVerticesAll.filter((e) => parseInt(e.idx) === value);

  const cells = _cells.map((e) => [
    parseInt(e.v2),
    parseInt(e.v1),
    parseInt(e.v0)
  ]);

  const positions = _vertices.map((e) => [
    parseFloat(e.z),
    parseFloat(e.x),
    parseFloat(e.y)
  ]);

  // 根据进化层级获取颜色
  const evolutionaryLevel = _getEvolutionaryLevel(foundAtlas.name);
  
  // 打印区域所属的进化层级
  console.log(`${foundAtlas.name} 属于 ${evolutionaryLevel.name}`);
  
  // 将颜色字符串转换为RGB数组
  const hexColor = evolutionaryLevel.color.replace('#', '');
  const r = parseInt(hexColor.substr(0, 2), 16) / 255;
  const g = parseInt(hexColor.substr(2, 2), 16) / 255;
  const b = parseInt(hexColor.substr(4, 2), 16) / 255;
  
  const colors = _cells.map((e) => [r, g, b, 0.5]);

  return { cells, positions, colors };
}
)}

function _mkBrainModel(rawCells0,rawVertices0,bunny){return(
() => {
  const _cells = rawCells0;
  const _vertices = rawVertices0;

  const cells = _cells.map((e) => [
    parseInt(e.v2),
    parseInt(e.v1),
    parseInt(e.v0)
  ]);

  const positions = _vertices.map((e) => [
    parseFloat(e.z),
    parseFloat(e.x),
    parseFloat(e.y)
  ]);

  const colors = _cells.map((e) => [0.4, 0.4, 0.4, 0.5]);

  return { cells, positions, colors };

  return bunny;
}
)}

function _44(md){return(
md`## ${t('requirements')}`
)}

async function _normals(){return(
(await import("https://cdn.skypack.dev/angle-normals@1.0.0")).default
)}

async function _THREE(require)
{
  const THREE = (window.THREE = await require("three@0.130.0/build/three.min.js"));
  await require("three@0.130.0/examples/js/controls/OrbitControls.js").catch(
    () => {}
  );
  // 加载Stats并确保它在window对象上可用
  await require("three@0.130.0/examples/js/libs/stats.min.js").catch(() => {});
  // 确保Stats被定义，如果没有则创建一个简单的替代品
  if (typeof window.Stats === 'undefined') {
    window.Stats = class {
      constructor() {
        this.domElement = document.createElement('div');
        this.update = () => {};
      }
    };
  }
  return THREE;
}


function _47(md){return(
md`## ${t('resources')}`
)}

async function _bunny(){return(
(await import("https://cdn.skypack.dev/bunny@1.0.1")).default
)}

async function _atlasTable(FileAttachment){return(
await FileAttachment("atlas_table.csv").csv()
)}

async function _rawCellsAll(FileAttachment){return(
await FileAttachment("cells-all.csv").csv()
)}

async function _rawVerticesAll(FileAttachment){return(
await FileAttachment("vertices-all.csv").csv()
)}

async function _rawCells0(FileAttachment){return(
await FileAttachment("cells-0-1.csv").csv()
)}

async function _rawVertices0(FileAttachment){return(
await FileAttachment("vertices-0-1.csv").csv()
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["vertices-0-1.csv", {url: new URL("./files/vertices-0-1.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["cells-0-1.csv", {url: new URL("./files/cells-0-1.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["atlas_table.csv", {url: new URL("./files/atlas_table.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["vertices-all.csv", {url: new URL("./files/vertices-all.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["cells-all.csv", {url: new URL("./files/cells-all.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  // 添加语言切换器到页面
  document.body.appendChild(createLanguageSwitcher());
  
  // 设置文档标题为多语言
  document.title = t('title');
  
  main.variable(observer()).define([], _languageSwitcher);
  main.variable(observer("viewof selectAtlas")).define("viewof selectAtlas", ["Inputs","atlasTable"], _selectAtlas);
  main.variable(observer("selectAtlas")).define("selectAtlas", ["Generators", "viewof selectAtlas"], (G, _) => G.input(_));
  main.variable(observer()).define(["atlasColor","selectAtlas","htl"], _3);
  main.variable(observer()).define(["renderer"], _4);
  main.variable(observer("viewof atlasColor")).define("viewof atlasColor", ["Inputs"], _atlasColor);
  main.variable(observer("atlasColor")).define("atlasColor", ["Generators", "viewof atlasColor"], (G, _) => G.input(_));
  main.variable(observer("viewof checkboxes")).define("viewof checkboxes", ["Inputs"], _checkboxes);
  main.variable(observer("checkboxes")).define("checkboxes", ["Generators", "viewof checkboxes"], (G, _) => G.input(_));
  main.variable(observer("viewof redrawButton")).define("viewof redrawButton", ["Inputs"], _redrawButton);
  main.variable(observer("redrawButton")).define("redrawButton", ["Generators", "viewof redrawButton"], (G, _) => G.input(_));
  main.variable(observer("viewof atlasTableSearch")).define("viewof atlasTableSearch", ["Inputs","atlasTable"], _atlasTableSearch);
  main.variable(observer("atlasTableSearch")).define("atlasTableSearch", ["Generators", "viewof atlasTableSearch"], (G, _) => G.input(_));
  main.variable(observer("viewof table1")).define("viewof table1", ["Inputs","atlasTableSearch"], _table1);
  main.variable(observer("table1")).define("table1", ["Generators", "viewof table1"], (G, _) => G.input(_));
  main.variable(observer("options")).define("options", ["checkboxes"], _options);
  main.variable(observer("keyword")).define("keyword", ["selectAtlas", "atlasTable"], _keyword);
  main.variable(observer()).define(["cube","options","brain","atlas","spheres","helpBrain","helpAtlas","renderer","scene","camera"], _14);
  main.variable(observer()).define(["md"], _16);
  main.variable(observer("cube")).define("cube", ["THREE"], _cube);
  main.variable(observer("spheres")).define("spheres", ["atlasTable","THREE"], _spheres);
  main.variable(observer()).define(["scene","spheres"], _19);
  main.variable(observer("brainGeometry")).define("brainGeometry", ["mkVertices","brainModel","mkGeometry"], _brainGeometry);
  main.variable(observer("brain")).define("brain", ["THREE","brainGeometry"], _brain);
  main.variable(observer("helpBrain")).define("helpBrain", ["THREE","brain"], _helpBrain);
  main.variable(observer("atlasGeometry")).define("atlasGeometry", ["mkVertices","atlasModel","mkGeometry"], _atlasGeometry);
  main.variable(observer("atlas")).define("atlas", ["THREE","atlasColor","atlasGeometry","brain"], _atlas);
  main.variable(observer("helpAtlas")).define("helpAtlas", ["THREE","atlas"], _helpAtlas);
  main.variable(observer()).define(["scene","brain","atlas","options","helpBrain","helpAtlas","md"], _26);
  main.variable(observer()).define(["scene","cube","md"], _27);
  main.variable(observer()).define(["THREE","scene","options","md"], _28);
  main.variable(observer()).define(["THREE","scene","md"], _29);
  main.variable(observer()).define(["md"], _30);
  main.variable(observer("stats")).define("stats", ["Stats"], _stats);
  main.variable(observer("scene")).define("scene", ["redrawButton","atlasColor","checkboxes","selectAtlas","THREE"], _scene);
  main.variable(observer("height")).define("height", ["width"], _height);
  main.variable(observer("camera")).define("camera", ["width","height","THREE"], _camera);
  main.variable(observer("renderer")).define("renderer", ["THREE","width","height","camera","scene","invalidation"], _renderer);
  main.variable(observer()).define(["md"], _36);
  main.variable(observer("brainModel")).define("brainModel", ["mkBrainModel"], _brainModel);
  main.variable(observer("atlasModel")).define("atlasModel", ["mkSelectAtlasModel"], _atlasModel);
  main.variable(observer()).define(["md"], _39);
  main.variable(observer("mkGeometry")).define("mkGeometry", ["THREE"], _mkGeometry);
  main.variable(observer("mkVertices")).define("mkVertices", ["normals"], _mkVertices);
  main.variable(observer("mkSelectAtlasModel")).define("mkSelectAtlasModel", ["atlasTable","selectAtlas","rawCellsAll","rawVerticesAll"], _mkSelectAtlasModel);
  main.variable(observer("mkBrainModel")).define("mkBrainModel", ["rawCells0","rawVertices0","bunny"], _mkBrainModel);
  main.variable(observer()).define(["md"], _44);
  main.variable(observer("normals")).define("normals", _normals);
  main.variable(observer("THREE")).define("THREE", ["require"], _THREE);
  main.variable(observer("Stats")).define("Stats", () => {
    // 确保返回一个有效的构造函数
    if (typeof window.Stats === 'function') {
      return window.Stats;
    }
    // 创建一个简单但有效的Stats类替代品
    return class Stats {
      constructor() {
        this.domElement = document.createElement('div');
        this.update = () => {};
      }
    };
  });
  main.variable(observer()).define(["md"], _47);
  main.variable(observer("bunny")).define("bunny", _bunny);
  main.variable(observer("atlasTable")).define("atlasTable", ["FileAttachment"], _atlasTable);
  main.variable(observer("rawCellsAll")).define("rawCellsAll", ["FileAttachment"], _rawCellsAll);
  main.variable(observer("rawVerticesAll")).define("rawVerticesAll", ["FileAttachment"], _rawVerticesAll);
  main.variable(observer("rawCells0")).define("rawCells0", ["FileAttachment"], _rawCells0);
  main.variable(observer("rawVertices0")).define("rawVertices0", ["FileAttachment"], _rawVertices0);
  // 添加进化层级说明到界面
  main.variable(observer()).define(["md"], _evolutionaryLevelsInfo);
  return main;
}
