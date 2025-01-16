import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useAvatarModelContext } from "../../contexts/AvatarModelContext";
import { ANIM_NAMES, getAnimationList } from "../../helper/animations";
import {
  corresponding,
  roseCorresponding,
} from "../../helper/corresponding";
import { modelConfig } from "../../helper/models";
import Character from "../../models/Character";
import Nikita from "../../models/Nikita";
import RoseE from "../../models/RoseE";
import Rian from "../../models/Ryan";
import Fernanda from "../../models/Fernanda";

interface AvatarProps {
  key: string;
  position: any;
  scale: number;
  model: string;
  lipsync: any;
  audio: any;
}

const ANIMATION_FADE_TIME = 0.5;

function Avatar(props: AvatarProps) {
  const { animation } = useAvatarModelContext();
  const [blink, setBlink] = useState(false);

  const group = useRef();
  const { scene }: any = useGLTF(
    props.model || modelConfig['nikita'].value
  );


  const { actions, mixer } = useAnimations(getAnimationList(), group);

  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 100);
      }, THREE.MathUtils.randInt(2000, 4000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);


  useEffect(() => {
    const action = props.model.includes("character") || props.model.includes("ryan")
      ? actions[ANIM_NAMES.chara_anim.name]
      : props.model.includes("fernanda") ? actions[ANIM_NAMES.fernanda_anim.name] : actions[animation];

    if (action) {
      action.loop = THREE.LoopPingPong; // Set loop mode to ping pong
      action.timeScale = props.model.includes('character') || props.model.includes('ryan') ? 1.5 : props.model.includes('fernanda') ? 0.7 : 1;
      action
        .reset()
        // .fadeIn(mixer.time > 0 ? ANIMATION_FADE_TIME : 1) 
        .play();
    }
    return () => {
      if (action) {
        action.fadeOut(ANIMATION_FADE_TIME);
      }
    };
  }, [animation, actions]);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (
          index === undefined ||
          child.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );
      }
    });
  };

  // useEffect(() => {
  //   if (props.model === models[0].value && nodes.Eye_Mesh) {
  //     nodes.Eye_Mesh.morphTargetInfluences[
  //       nodes.Eye_Mesh.morphTargetDictionary["eyesLookDown"]
  //     ] = THREE.MathUtils.lerp(
  //       nodes.Eye_Mesh.morphTargetInfluences[
  //         nodes.Eye_Mesh.morphTargetDictionary["eyesLookDown"]
  //       ],
  //       1,
  //       0.13
  //     );
  //   }
  // }, []);

  useFrame(() => {
    if (props.model.includes('nikita.glb')) {
      lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.2);
      lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.2);
    } else {
      lerpMorphTarget("Eye_Blink_L", blink ? 1 : 0, 0.2);
      lerpMorphTarget("Eye_Blink_R", blink ? 1 : 0, 0.2);
    }
    const morphFactor = 1.5;
    const appliedMorphTargets: any = [];
    const currentAudioTime = props.audio?.seek();
    const visemeMap = props.model.includes('nikita') ? corresponding : roseCorresponding



    for (let i = 0; i < props.lipsync?.mouthCues?.length; i++) {
      const mouthCue = props.lipsync?.mouthCues[i];
      lerpMorphTarget(visemeMap[mouthCue.value], 0.01, 0.1)
      if (
        currentAudioTime >= mouthCue.start &&
        currentAudioTime <= mouthCue.end
      ) {
        appliedMorphTargets.push(
          visemeMap[mouthCue.value]
        );
        lerpMorphTarget(
          visemeMap[mouthCue.value],
          morphFactor,
          0.2
        );
        break;
      }
    }

    Object.values(
      visemeMap
    ).forEach((value) => {
      if (appliedMorphTargets.includes(value)) {
        return;
      }
      lerpMorphTarget(value, 0, 0.1);
    });
  });

  return (
    <>
      <group {...props} dispose={null} ref={group as any}>
        {props.model.includes("nikita") ? (
          <Nikita />
        ) : props.model.includes("rose") ? (
          <RoseE />
          ) : props.model.includes('character') ? < Character /> : props.model.includes('ryan') ? <Rian /> : <Fernanda />
        }
      </group>
    </>
  );
}

export default Avatar;

// models.forEach((model) => {
//   useGLTF.preload(model.value);
// });

useGLTF.preload(modelConfig["nikita"].value);
