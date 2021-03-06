import Wren from "../../../../wren/lib/wren";
import * as THREE from "three";
import { edgeMaterial, plyMaterial, pieceExtrudeSettings } from "../materials";
import { uniq } from "lodash";

class WrenModel {
  container: THREE.Object3D;
  wren: Wren;
  geometry: THREE.Geometry;
  edgesGeometry: THREE.EdgesGeometry;
  mesh: THREE.Mesh;
  lineSegments: THREE.LineSegments;

  update = (wren: Wren, length: number) => {
    this.wren = wren;
    this.geometry.dispose();
    this.geometry = new THREE.Geometry();

    const shape = new THREE.Shape();
    wren.outerPoints
      .map(([x, y]) => [x / 100, y / 100])
      .forEach(([x, y], index) => {
        if (index == 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });

    wren.polygons.forEach(polygon => {
      const hole = new THREE.Path();
      polygon.map(([x, y]) => [x / 100, y / 100]).forEach(([x, y], index) => {
        if (index == 0) hole.moveTo(x, y);
        else hole.lineTo(x, y);
      });
      shape.holes.push(hole);
    });

    const g = new THREE.ExtrudeGeometry(shape, {
      ...pieceExtrudeSettings,
      amount: 0.15
      // amount: Math.floor(length / 1.2) * 1.2
    });
    g.translate(0, 0, -0.175);
    // this.geometry.merge(g);

    let geometry: THREE.Geometry = this.addFin(0);
    // length
    let i2 = 0;
    for (let i = 0; i < length - 1.2; i += 1.2) {
      this.geometry.merge(geometry.clone().translate(0, 0, i));
      this.geometry.merge(g.clone().translate(0, 0, i));
      i2 += 1.2;
    }
    this.geometry.merge(g.clone().translate(0, 0, i2));

    this.mesh.geometry = this.geometry;

    this.edgesGeometry.dispose();
    this.edgesGeometry = new THREE.EdgesGeometry(<any>this.geometry, 1);
    this.lineSegments.geometry = this.edgesGeometry;
  };

  constructor(wren: Wren, face, faceHighlight) {
    this.wren = wren;
    this.geometry = new THREE.Geometry();
    for (let i = 0; i < 1; i++) {
      this.geometry.merge(this.addFin(i));
    }
    this.mesh = new THREE.Mesh(this.geometry, plyMaterial);
    this.edgesGeometry = new THREE.EdgesGeometry(<any>this.geometry, 1);
    this.lineSegments = new THREE.LineSegments(
      this.edgesGeometry,
      edgeMaterial
    );
    this.mesh.add(this.lineSegments);
    this.container = new THREE.Object3D();
    this.container.add(this.mesh);
    this.container.castShadow = true;
    this.container.receiveShadow = true;
  }

  addFin = distance => {
    const geometry = new THREE.Geometry();

    this.addPieces(geometry, "finPieces", distance * 1.2);

    // this.addPieces(geometry, "reinforcers", distance * 1.2 + 0.018);

    this.addPieces(geometry, "finPieces", distance * 1.2 + 1);
    this.addVanillaWalls("vanillaInnerWalls", geometry, distance);
    this.addVanillaWalls("vanillaOuterWalls", geometry, distance);

    return geometry;
  };

  addVanillaWalls = (name, geometry: THREE.Geometry, z) => {
    this.wren[name].forEach(vWall => {
      vWall.pieces.forEach(side => {
        const shape = new THREE.Shape();
        side.pts
          .map(([x, y]) => [x / 100, y / 100])
          .forEach(([x, y], index) => {
            if (index == 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
          });
        const g = new THREE.ExtrudeGeometry(shape, pieceExtrudeSettings);
        const mesh = new THREE.Mesh(g);

        mesh.rotation.z = side.angle;
        mesh.rotation.x = Math.PI / 2;
        mesh.rotation.order = "ZYX";

        mesh.position.x = side.pos[0] / 100;
        mesh.position.y = side.pos[1] / 100;
        mesh.position.z = z * 1.2 - 0.1;

        // mesh.rotation.x = side.rot.x;
        // mesh.rotation.y = side.rot.y;
        // mesh.rotation.z = side.rot.z;
        // mesh.rotation.order = "XYZ"//side.rot.o;

        geometry.mergeMesh(mesh);
      });
    });
  };

  addPieces = (geometry: THREE.Geometry, pieceName: string, index) => {
    this.wren[pieceName].forEach(finPiece => {
      const shape = new THREE.Shape();
      finPiece
        .map(([x, y]) => [x / 100, y / 100])
        .filter(function(curr, pos, arr) {
          return (
            pos === 0 ||
            Math.abs(curr[0] - arr[pos - 1][0]) > 0.0001 ||
            Math.abs(curr[1] - arr[pos - 1][1]) > 0.0001
          );
        })
        .forEach(([x, y], index) => {
          if (index === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        });

      const geo = new THREE.ExtrudeGeometry(shape, pieceExtrudeSettings);
      geo.translate(0, 0, index);
      geometry.merge(geo);
    });
  };

  hide = () => {
    this.mesh.visible = false;
  };

  show = () => {
    this.mesh.visible = true;
  };
}

export default WrenModel;
