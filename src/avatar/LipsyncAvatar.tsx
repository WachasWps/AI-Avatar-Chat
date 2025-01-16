import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import React, { useEffect, useRef, useState } from 'react'
import Cartoon from '../../models/Cartoon';
import * as THREE from 'three'
import { DefaultXRControllers, VRCanvas } from 'react-xr';

function LipsyncAvatar({ audio }) {
    const { scene }: any = useGLTF('models/maru.glb')
    const group = useRef();

    const cameraRef: any = useRef();

    useEffect(() => {
        if (cameraRef.current) {
            // Position the camera in the VR environment relative to the model
            cameraRef.current.position.set(0, 1, 5); // Adjust to be 1.5m high and 5m away
            cameraRef.current.lookAt(0, 1, -3); // Look towards the model's approximate location
        }

    }, []);

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



    return (

        <group dispose={null} ref={group as any} >
            <VRCanvas className="w-full h-full" camera={{ position: [0, 1, 7] }}>
                <Environment files="hdr/hdr_room.hdr" background />




                {/* <Canvas
                    flat
                    orthographic
                    dpr={window.devicePixelRatio}
                    shadows
                    camera={{
                        position: [0, 0, 100],
                        zoom: 300,
                    }}
                    // style={{ "height": "100vh" }}
                > */}
                {/* <color attach="background" args={["#ffffff"]} /> */}

                f                {/* <color attach="background" args={["#BEBEBE"]} /> */}
                <OrbitControls />
                <KeyLight />
                <FillLight />
                <BackLight />
                <RimLight />
                <Cartoon audio={audio} scale={4} />

                {/* </Canvas> */}
                <DefaultXRControllers />
            </VRCanvas>
        </group>
    )
}

export default LipsyncAvatar