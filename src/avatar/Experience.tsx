import React from "react";

import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import {
  EquirectangularReflectionMapping,
  LinearFilter,
  SRGBColorSpace,
} from "three";
import { TextureLoader } from "three";
import { useAvatarModelContext } from "../../contexts/AvatarModelContext";
import Avatars from "./Avatars";

const Experience = ({ formValues }) => {
  const { bgImage } = useAvatarModelContext();
  const [texture, setTexture] = useState(useTexture(bgImage));
  const viewport = useThree((state) => state.viewport);

  const textureLoader = new TextureLoader();
  function KeyLight() {
    return (
      <directionalLight
        castShadow
        position={[0, 5, 10]}
        intensity={0.5} // Reduced intensity
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
        intensity={0.3} // Reduced intensity
        color="#ffffff"
      />
    );
  }

  function RimLight() {
    return (
      <hemisphereLight
        // skyColor={"#ffffff"}
        groundColor={"#444444"}
        intensity={0.8} // Reduced intensity
      />
    );
  }

  function BackLight() {
    return (
      <directionalLight
        position={[10, 5, -10]}
        intensity={0.6} // Reduced intensity
        color="#ffffff"
      />
    );
  }

  useEffect(() => {
    textureLoader.load(
      bgImage,
      (texture) => {
        texture.colorSpace = SRGBColorSpace;
        texture.mapping = EquirectangularReflectionMapping;
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        setTexture(texture);
      },
      undefined,
      (error) => {
        console.error("Failed to load texture:", error);
      }
    );
  }, [bgImage]);

  return (
    <>
      {/* <OrbitControls /> */}
      {/* <Environment preset="warehouse" /> */}
      <KeyLight />
      <FillLight />
      <BackLight />
      <RimLight />
      <Avatars formValues={formValues} />
      {/* <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <meshBasicMaterial map={texture} />
    </mesh> */}
    </>
  );
};

export default Experience;
