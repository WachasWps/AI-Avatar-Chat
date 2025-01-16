/**
 * !To convert FBX to GLB format: https://github.com/crazyramirez/FBX2GLB-Batch-Convert-Optimizer
 */
import { useFBX, useGLTF } from "@react-three/drei";


export const ANIM_NAMES = {
  idle: { name: "Idle", url: "/animations/webp/Idle.gif" },
  test: { name: "Test", url: "/animations/webp/Idle-1.gif" },
  greeting: { name: "Greeting", url: "/animations/webp/Greeting.gif" },
  F_Talking_Variations_005: {
    name: "F_Talking_Variations_005",
    url: "/animations/webp/F_Talking_Variations_005.webp",
  },
  M_Standing_Idle_001: {
    name: "M_Standing_Idle_001",
    url: "/animations/webp/M_Standing_Idle_001.webp",
  },
  F_Standing_Idle_001: {
    name: "F_Standing_Idle_001",
    url: "/animations/webp/F_Standing_Idle_001.webp",
  },
  anim_test_01: {
    name: "anim_test_01",
    url: "/animations/webp/anim_test_01.webp",
  },
  cesar_anim: {
    name: "cesarAnimation",
  },
  chara_anim: {
    name: "charaAnimation",
  },
  fernanda_anim: {
    name: "fernandaIdle"
  },
  pratik_anim: {
    name: "pratik_idle"
  }
};

export const getAnimationList = () => {
  const { animations: idleAnimation } = useFBX("/animations/Idle.fbx");
  const { animations: testAnimation } = useFBX("/animations/anim_idle.fbx");
  const { animations: greetingAnimation } = useFBX(
    "/animations/Standing Greeting.fbx"
  );
  const { animations: F_Talking_Variations_005 } = useGLTF(
    "/animations/glb/F_Talking_Variations_005.glb"
  );
  const { animations: M_Standing_Idle_001 } = useGLTF(
    "/animations/glb/M_Standing_Idle_001.glb"
  );
  const { animations: F_Standing_Idle_001 } = useGLTF(
    "/animations/glb/F_Standing_Idle_001.glb"
  );
  const { animations: anim_test_01 } = useGLTF(
    "/animations/glb/anim_test_01.glb"
  );
  const { animations: cesarAnimation } = useFBX(
    "/animations/cesar_anim_rotated.fbx"
  );
  const { animations: charaAnimation } = useFBX("/animations/idle_chara.fbx");
  const { animations: fernandaIdle } = useFBX("/animations/fernandaIdle.fbx");
  const { animations: pratik_idle } = useFBX("/animations/Idle.fbx");
  // const { animations: pratik_idle } = useGLTF("/animations/glb/prateek.glb")


  idleAnimation[0].name = ANIM_NAMES.idle.name;
  testAnimation[0].name = ANIM_NAMES.test.name;
  greetingAnimation[0].name = ANIM_NAMES.greeting.name;
  cesarAnimation[0].name = ANIM_NAMES.cesar_anim.name;
  charaAnimation[0].name = ANIM_NAMES.chara_anim.name;
  fernandaIdle[0].name = ANIM_NAMES.fernanda_anim.name;
  pratik_idle[0].name = ANIM_NAMES.pratik_anim.name;


  return [
    idleAnimation[0],
    greetingAnimation[0],
    F_Talking_Variations_005[0],
    M_Standing_Idle_001[0],
    F_Standing_Idle_001[0],
    anim_test_01[0],
    testAnimation[0],
    cesarAnimation[0],
    charaAnimation[0],
    fernandaIdle[0],
    pratik_idle[0]
  ];
};
