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

  const headMeshRef = useRef<THREE.SkinnedMesh>(null);
  const teethMeshRef = useRef<THREE.SkinnedMesh>(null);
  const tongueMeshRef = useRef<THREE.SkinnedMesh>(null);

  useEffect(() => {
    if (visemeData && nodes.Head_Mesh && nodes.Head_Mesh.morphTargetDictionary) {
      const missingKeys = visemeData.filter((cue) => {
        const morphTargetName = corresponding[cue.value]; // Map viseme value to morph target name
        return !nodes.Head_Mesh.morphTargetDictionary.hasOwnProperty(morphTargetName);
      });

      if (missingKeys.length > 0) {
        console.warn("Missing morph targets for viseme values:", missingKeys);
      } else {
        console.log("All viseme values have corresponding morph targets.");
      }
    }
  }, [visemeData, nodes.Head_Mesh]);

  useEffect(() => {
    if (visemeData) {
      console.log("Viseme Data in Nikita.tsx:", visemeData);

      const updateMorphTargets = (meshRef: React.RefObject<THREE.SkinnedMesh>) => {
        if (meshRef.current && meshRef.current.morphTargetInfluences) {
          // Reset all morph targets to 0
          meshRef.current.morphTargetInfluences.fill(0);

          // Apply new influences for the current viseme
          visemeData.forEach((cue) => {
            const morphTargetName = corresponding[cue.value]; // Map viseme value to morph target name
            const index = meshRef.current!.morphTargetDictionary![morphTargetName];
            if (index !== undefined) {
              meshRef.current!.morphTargetInfluences![index] = 1; // Set influence to 1
              console.log(`Updated morph target "${morphTargetName}" at index ${index} to 1`);
            } else {
              console.warn(`Morph target "${morphTargetName}" not found in dictionary`);
            }
          });

          // Log the updated morph target influences
          console.log("Morph Target Influences:", meshRef.current.morphTargetInfluences);
        }
      };

      updateMorphTargets(headMeshRef);
      updateMorphTargets(teethMeshRef);
      updateMorphTargets(tongueMeshRef);
    }
  }, [visemeData]);

  useEffect(() => {
    if (fbxActions.idle) {
      fbxActions.idle.reset().fadeIn(0.5).play();
      return () => {
        fbxActions.idle?.fadeOut(0.5);
      };
    }
  }, [fbxActions]);

  return (
    <>
      <KeyLight />
      <FillLight />
      <BackLight />
      <RimLight />

      <primitive object={nodes.Hips} scale={[2, 2, 2]} />
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