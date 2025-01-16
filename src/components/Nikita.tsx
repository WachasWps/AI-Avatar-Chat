import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations, useFBX } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { corresponding } from "./corresponding"; // Import the mappings

interface NikitaProps {
  visemeData: MouthCue[] | null;
  animation: string;
  setAnimation: (animation: string) => void;
}

interface MouthCue {
  start: number;
  end: number;
  value: number;
}

function Nikita({ visemeData, animation, setAnimation }: NikitaProps) {
  const { nodes, materials, animations } = useGLTF("/models/nikita.glb") as any;
  const { actions: glbActions } = useAnimations(animations || [], nodes.Hips);

  const { camera } = useThree();
  const headMeshRef = useRef<THREE.SkinnedMesh>(null);
  const teethMeshRef = useRef<THREE.SkinnedMesh>(null);
  const tongueMeshRef = useRef<THREE.SkinnedMesh>(null);

  useEffect(() => {
    camera.position.set(0, 1.5, 2);
    camera.lookAt(0, 1.5, 0);
  }, [camera]);

  useEffect(() => {
    if (nodes.Head_Mesh && nodes.Head_Mesh.morphTargetDictionary) {
      console.log("Head Morph Target Dictionary:", nodes.Head_Mesh.morphTargetDictionary);
    }
  }, [nodes.Head_Mesh]);

  const { animations: idleAnimations } = useFBX("/animations/Idle.fbx");
  const { actions: fbxActions } = useAnimations(idleAnimations || [], nodes.Hips);

  useEffect(() => {
    if (fbxActions.idle) {
      fbxActions.idle.reset().fadeIn(0.5).play();
      return () => {
        fbxActions.idle?.fadeOut(0.5);
      };
    }
  }, [fbxActions]);

  const resetMorphTargets = (meshRef: React.RefObject<THREE.SkinnedMesh>) => {
    if (meshRef.current && meshRef.current.morphTargetInfluences) {
      meshRef.current.morphTargetInfluences.fill(0); // Reset all morph targets
    }
  };

  const updateMorphTargets = (time: number) => {
    if (!visemeData) return;

    const updateMeshMorphTargets = (meshRef: React.RefObject<THREE.SkinnedMesh>) => {
      if (!meshRef.current || !meshRef.current.morphTargetInfluences) return;

      const influences = meshRef.current.morphTargetInfluences;
      const dictionary = meshRef.current.morphTargetDictionary;

      resetMorphTargets(meshRef); // Reset all morph targets before updating

      const currentViseme = visemeData.find((cue) => time >= cue.start && time <= cue.end);
      if (currentViseme) {
        const morphTargetName = corresponding[currentViseme.value]; // Map viseme value to morph target name
        const index = dictionary ? dictionary[morphTargetName] : undefined;

        if (index !== undefined) {
          influences[index] = 1; // Apply the influence for the current morph target
          console.log(`Updated morph target "${morphTargetName}" at index ${index}`);
        }
      }
    };

    updateMeshMorphTargets(headMeshRef);
    updateMeshMorphTargets(teethMeshRef);
    updateMeshMorphTargets(tongueMeshRef);
  };

  useEffect(() => {
    if (!visemeData) return;

    const startTime = performance.now();

    const animateLipSync = () => {
      const elapsedTime = (performance.now() - startTime) / 1000; // Convert to seconds
      updateMorphTargets(elapsedTime);

      if (elapsedTime < visemeData[visemeData.length - 1].end) {
        requestAnimationFrame(animateLipSync); // Continue the animation loop
      }
    };

    animateLipSync();
  }, [visemeData]);

  return (
    <>
      <KeyLight />
      <FillLight />
      <BackLight />
      <RimLight />

      <primitive object={nodes.Hips} scale={[2, 2, 2]} />
      
      <skinnedMesh
        geometry={nodes.avaturn_hair_0.geometry}
        material={materials.avaturn_hair_0_material}
        skeleton={nodes.avaturn_hair_0.skeleton}
      />
      <skinnedMesh
        geometry={nodes.avaturn_hair_1.geometry}
        material={materials.avaturn_hair_1_material}
        skeleton={nodes.avaturn_hair_1.skeleton}
      />
      <skinnedMesh
        geometry={nodes.avaturn_look_0.geometry}
        material={materials.avaturn_look_0_material}
        skeleton={nodes.avaturn_look_0.skeleton}
      />
      <skinnedMesh
        geometry={nodes.avaturn_shoes_0.geometry}
        material={materials.avaturn_shoes_0_material}
        skeleton={nodes.avaturn_shoes_0.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Body_Mesh.geometry}
        material={materials.Body}
        skeleton={nodes.Body_Mesh.skeleton}
      />
      <skinnedMesh
        name="Eye_Mesh"
        geometry={nodes.Eye_Mesh.geometry}
        material={materials.Eyes}
        skeleton={nodes.Eye_Mesh.skeleton}
        morphTargetDictionary={nodes.Eye_Mesh.morphTargetDictionary}
        morphTargetInfluences={nodes.Eye_Mesh.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeAO_Mesh"
        geometry={nodes.EyeAO_Mesh.geometry}
        material={materials.EyeAO}
        skeleton={nodes.EyeAO_Mesh.skeleton}
        morphTargetDictionary={nodes.EyeAO_Mesh.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeAO_Mesh.morphTargetInfluences}
      />
      <skinnedMesh
        name="Eyelash_Mesh"
        geometry={nodes.Eyelash_Mesh.geometry}
        material={materials.Eyelash}
        skeleton={nodes.Eyelash_Mesh.skeleton}
        morphTargetDictionary={nodes.Eyelash_Mesh.morphTargetDictionary}
        morphTargetInfluences={nodes.Eyelash_Mesh.morphTargetInfluences}
        />
        <skinnedMesh
        ref={headMeshRef}
        name="Head_Mesh"
        geometry={nodes.Head_Mesh.geometry}
        material={materials.Head}
        skeleton={nodes.Head_Mesh.skeleton}
        morphTargetDictionary={nodes.Head_Mesh.morphTargetDictionary}
        morphTargetInfluences={nodes.Head_Mesh.morphTargetInfluences}
      />
      <skinnedMesh
        ref={teethMeshRef}
        name="Teeth_Mesh"
        geometry={nodes.Teeth_Mesh.geometry}
        material={materials.Teeth}
        skeleton={nodes.Teeth_Mesh.skeleton}
        morphTargetDictionary={nodes.Teeth_Mesh.morphTargetDictionary}
        morphTargetInfluences={nodes.Teeth_Mesh.morphTargetInfluences}
      />
      <skinnedMesh
        ref={tongueMeshRef}
        name="Tongue_Mesh"
        geometry={nodes.Tongue_Mesh.geometry}
        material={materials["Teeth.001"]}
        skeleton={nodes.Tongue_Mesh.skeleton}
        morphTargetDictionary={nodes.Tongue_Mesh.morphTargetDictionary}
        morphTargetInfluences={nodes.Tongue_Mesh.morphTargetInfluences}
      />
    </>
  );
}

function KeyLight() {
  return (
    <directionalLight
      castShadow
      position={[0, 5, 10]}
      intensity={0.5}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-far={50}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
    />
  );
}

function FillLight() {
  return (
    <directionalLight
      position={[-10, 5, 5]}
      intensity={0.3}
      color="#ffffff"
    />
  );
}

function RimLight() {
  return (
    <hemisphereLight
      groundColor={"#444444"}
      intensity={0.8}
    />
  );
}

function BackLight() {
  return (
    <directionalLight
      position={[10, 5, -10]}
      intensity={0.6}
      color="#ffffff"
    />
  );
}

export default Nikita;
