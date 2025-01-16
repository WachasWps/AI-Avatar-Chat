import { useThree } from "@react-three/fiber";
import axios from "axios";
import { Howl } from "howler";
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAvatarModelContext } from "../../contexts/AvatarModelContext";
import { ANIM_NAMES } from "../../helper/animations";
import { VOICE_APIS } from "../../helper/enums";
import { EMPTY_AUDIO, wait } from "../../helper/helper";
// import { models } from "../../helper/models";
import Avatar from "./Avatar";
import { modelConfig } from "../../helper/models";

type AudioType = { index: number; json: any; mp3: string };

export default function Avatars(props) {

  const viewport = useThree((state) => state.viewport);
  const {
    setIsGeneratingResponse,
    handleAddChat,
    lipSyncUrl,
    setLipSyncUrl,
    audioUrl,
    setAudioUrl,
    setAnimation,
    avtar,
    avatarPosition,
    lipsyncApi,
    showAvtar,
    ttsLanguage

  } = useAvatarModelContext();

  const [audios, setAudios] = useState<AudioType[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isEnded, setIsEnded] = useState<boolean>(true);

  const currentIndexRef = useRef<number>(currentIndex);
  const audiosRef = useRef<AudioType[]>(audios);
  const isAudioEndedRef = useRef<boolean>(isEnded);
  currentIndexRef.current = currentIndex;
  audiosRef.current = audios;
  isAudioEndedRef.current = isEnded;

  // const audio: HTMLAudioElement = useMemo(() => {
  //   if (!audioUrl) return null as any;

  //   const audioSrc = `data:audio/mpeg;base64,${audioUrl}`;
  //   const audioFile = new Audio(audioSrc);
  //   audioFile.crossOrigin = "anonymous";
  //   // audioFile.preload = 'auto';

  //   return audioFile;
  // }, [audioUrl]);

  const audio: any = useMemo(() => {
    if (!audioUrl) return null as any;

    const audioSrc = `data:audio/mpeg;base64,${audioUrl}`;
    return new Howl({
      src: [audioSrc],
    });
  }, [audioUrl]);

  const fetchAudio = async (text: string) => {
    try {
      const texts = text.split(". ");
      for (const [i, value] of texts.entries()) {
        if (i > 0) {
          await wait(1);
        }

        if (
          value.includes(
            "\nA  Below 20 \nB  20s \nC  30s \nD  40s \nE  50s \nF  Above 50s "
          ) ||
          value.includes(
            "\nA  Four Square\nB  Marlboro\nC  Red & White\nD  Stellar\nE  I-GEN Excellence\nF  Funda Confectionery\nG  Funaxx Savouries"
          ) ||
          value.includes(
            '\nA  Daily\nB  Weekly\nC  Monthly\nD  Occasionally'
          )||
          value.includes(
            '\nA  Advertisement\nB  Word of mouth\nC  Online reviews\nD  In-store display'
          )||
          value.includes(
            '\nA Yes  \nB  No'
          )||
          value.includes(
            '\nA  5 Star  \nB  Alpen Gold \nC  Cadbury Dairy Milk '
          )||
          value.includes(
            '\nA Unique Shape \nB Taste \nC Texture \nD Packaging'
          )||
          value.includes(
            '\nA  Daily \nB Weekly  \nC  Monthly'
          )
        ) {
          continue;
        }

        const apiUrl =
          lipsyncApi.value === "lip_5"
            ? "http://130.211.253.3:5000/tts"
            : // @ts-ignore:next-line
              `${import.meta.env.VITE_DUBBING_API_BASE_URL}/avatar/avatar`;
        axios
          .post(
            apiUrl,
            {
              text: value,
              voice_id: "EXAVITQu4vr4xnSDxMaL", // Sarah
              voice_api: VOICE_APIS.TTS1,
              lipSync_api: lipsyncApi.value,
              language: ttsLanguage,
              preset: "ultra_fast",
              gender: avtar.includes("character_6v") || avtar.includes('ryan') ? 'male' : 'female'
            },
            {
              headers: {
                // @ts-ignore:next-line
                "x-api-key": import.meta.env.VITE_DUBBING_API_KEY,
              },
            }
          )
          .then((resp: any) => {
            let mp3 = "";
            let json: any = {};

            if (lipsyncApi.value === "amazon_polly") {
              mp3 = resp.data.json.mp3;
              json = { mouthCues: resp.data.json.mouthCues };
            } else if (lipsyncApi.value === "lip_5") {
              mp3 = resp.data.base64;
              json = { mouthCues: resp.data.viseme };
            } else {
              mp3 = resp.data.mp3;
              json = resp.data.json;
            }

            // const { mp3, json } = resp.data;
            if (!mp3 || !json?.mouthCues) {
              throw Error("Cannot fetch audios. Please try again!");
            }

            if (i === 0) {
              setAudioUrl(mp3);
              setLipSyncUrl(json);
              if (showAvtar){
                handleAddChat({
                  id: Math.random(),
                  isMe: false,
                  text: text,
                });
              }
              setIsEnded(false);
            } else {
              const getCurrentIndex: number = currentIndexRef.current;
              const isAudioEnded: boolean = isAudioEndedRef.current;

              setAudios((prev) => {
                const previous = [...prev, { index: i, mp3, json }];
                const sortedResponses = previous.sort(
                  (a, b) => a.index - b.index
                );

                if (
                  isAudioEnded &&
                  getCurrentIndex > 0 &&
                  getCurrentIndex + 1 === sortedResponses[0].index
                ) {
                  setAudioUrl(sortedResponses[0].mp3);
                  setLipSyncUrl(sortedResponses[0].json);
                  setCurrentIndex((prev) => prev + 1);
                  sortedResponses.shift();
                  setIsEnded(false);
                }
                return sortedResponses;
              });
            }

            setIsGeneratingResponse(false);
          })
          .catch((err) => {
            setIsGeneratingResponse(false);
          });

      }
    } catch (error) {
      console.log(error?.message || error);
      toast.error("Error generating avatar audio");
      setIsGeneratingResponse(false);
      return {};
    }
  };

  const onAudioEnd = () => {
    const currentIdx = currentIndexRef.current;
    const leftAudios = audiosRef.current;

    if (leftAudios?.length && leftAudios[0].index === currentIdx + 1) {
      setAudioUrl(leftAudios[0].mp3);
      setLipSyncUrl(leftAudios[0].json);
      setCurrentIndex((prev) => prev + 1);
      setAudios((prev) => {
        const previous = [...prev];
        previous.shift();
        return previous;
      });

      return;
    }

    setIsEnded(true);
    if (avtar === modelConfig['nikita'].value) {
      setAnimation(ANIM_NAMES.F_Standing_Idle_001.name);
    } else if (avtar === modelConfig['rose'].value) {
      setAnimation(ANIM_NAMES.test.name);
    } 
    setAudioUrl("");
    setLipSyncUrl(null);
  };


  useEffect(() => {
    if (!lipSyncUrl) return;

    if (audioUrl !== EMPTY_AUDIO && avtar === modelConfig['nikita'].value) {
      setAnimation(ANIM_NAMES.F_Talking_Variations_005.name);
    }

    audio?.play();
    audio?.on("end", onAudioEnd);

    return () => {
      audio?.pause();
    };
  }, [lipSyncUrl]);

  useEffect(() => {
    setAudios([]);
    setCurrentIndex(0);
    setIsEnded(true);
    props.formValues.text && fetchAudio(props.formValues.text);
  }, [props.formValues.id || props.formValues.text]);

  // useEffect(() => {
  //   console.log({ avtar });
  // }, [avtar]);

  return (
    <>
      {avtar && showAvtar && (

        <Avatar
          key={avtar}
          position={
            avatarPosition[0] !== undefined
              ? [
                viewport.width * 0.2 * (avatarPosition[0] < 0 ? -1 : 1) + 1,
                avatarPosition[1] + 0.5,
                avatarPosition[2],
              ]
              : [-3, -15, 10]
              }
          scale={10}
          model={avtar}
          lipsync={lipSyncUrl}
          audio={audio}
        />
      )}
    </>
  );



}
