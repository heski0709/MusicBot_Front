<script setup lang="ts">

const login = async (e: Event) => {
    console.log('작동 확인', e)
};

</script>
<template>
    <div class="flex justify-center items-center w-full">
        <Button class="text-white bg-indigo-500 hover:bg-indigo-500/90 font-bold py-2 px-4 rounded-[0.5rem] relative"
            @click="login($event)">
            디스코드 로그인
            <div style="
                        --size: 60;
                        --duration: 12;
                        --anchor: 90;
                        --border-width: 2;
                        --color-from: #818cf8;
                        --color-to: #4f46e5;
                        --delay: -0s;
                    "
                class="pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]">
            </div>
        </Button>
    </div>
</template>
