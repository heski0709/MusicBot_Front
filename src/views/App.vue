<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { OpusDecoder, type OpusDecodedAudio } from "opus-decoder";

let ws;
let gainNode: GainNode;
let audioCtx: AudioContext;
let lastPlaybackTime = 0;
const volume = ref(1.0);
const pcmDataQueue = ref<OpusDecodedAudio[]>([]);

watch(volume, (newVolume) => {
    setVolume(newVolume);
});

const audioContextInit = () => {
    if (!audioCtx) {
        audioCtx = new AudioContext();
        gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
        console.log("AudioContext initialized");
    } else {
        console.log("AudioContext already initialized");
    }
}

const playAudio = (pcmData: OpusDecodedAudio) => {
    if (!audioCtx) {
        console.warn("AudioContext is not initialized.");
        return;
    }

    const buffer = audioCtx.createBuffer(2, pcmData.samplesDecoded, pcmData.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
        let audioChannel = buffer.getChannelData(channel);
        for (let i = 0; i < pcmData.samplesDecoded; i++) {
            audioChannel[i] = pcmData.channelData[channel][i];
        }
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode)
    gainNode.connect(audioCtx.destination);

    // 스케줄링: 마지막 재생 시간과 현재 AudioContext의 시간 중 더 늦은 시간으로 설정
    if (lastPlaybackTime < audioCtx.currentTime) {
        lastPlaybackTime = audioCtx.currentTime;
    }

    source.start(lastPlaybackTime);
    lastPlaybackTime += buffer.duration;  // buffer.duration이 실제 프레임 길이 (예: 20ms)

    source.onended = () => {
        processAudioQueue(); // 재생 종료 후 큐에 다음 데이터가 있는지 확인하고 재생
    };
};

const processAudioQueue = () => {
    if (!audioCtx) {
        console.warn("AudioContext is not initialized, cannot process queue.");
        return;
    }
    if (pcmDataQueue.value.length > 0) {
        console.log(pcmDataQueue.value.length, "audio frames in queue.");
        const pcmData = pcmDataQueue.value.shift();
        if (pcmData) {
            playAudio(pcmData);
        }
    } else {
        console.log("Audio queue is empty.");
    }
};

const setVolume = (value: number) => {
    if (gainNode) {
        gainNode.gain.value = value; // 볼륨 값 (0.0 ~ 1.0)
        console.log(`볼륨 설정: ${value}`);
    }
};

onMounted(async () => {
    ws = new WebSocket("ws://localhost:8000/ws");
    const decoder = new OpusDecoder({ channels: 2, sampleRate: 48000 });

    ws.binaryType = "arraybuffer";

    ws.onmessage = async (event: MessageEvent) => {
        if (!(event.data instanceof ArrayBuffer)) {
            return;
        }

        if (!audioCtx) {
            return;
        }

        const opusData = new Uint8Array(event.data);
        const pcmData = decoder.decodeFrame(opusData);

        pcmDataQueue.value.push(pcmData);
        if (pcmDataQueue.value.length > 10) { processAudioQueue(); }
    };
});
</script>

<template>
    <div class="flex justify-center items-center w-full">
        <div class="flex flex-col items-center justify-center">

            <h2 class="text-white">Audio Stream</h2>
            <div class="flex items-center gap-3">

                <input type="range" v-model="volume" min="0" max="1" step="0.01">
                <span class="flex justify-center items-center text-orange-400 h-10 w-10">{{ (volume * 100).toFixed(0) }}%</span>
            </div>
            <Button class="text-white bg-indigo-500 hover:bg-indigo-500/90 font-bold py-2 px-4 rounded-[0.5rem] relative"
                @click="audioContextInit">
                디스코드 인증
                <div style="
                            --size: 60;
                            --duration: 12;
                            --anchor: 90;
                            --border-width: 2;
                            --color-from: #d97706;
                            --color-to: #db2777;
                            --delay: -0s;
                        "
                    class="pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]">
                </div>
            </Button>
        </div>
    </div>
</template>
