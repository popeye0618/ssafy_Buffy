<script setup lang="ts">
defineProps<{label:string;height?:string}>()
</script>
<template><div class="placeholder" :style="{height:height||'150px'}" role="img" :aria-label="label"><span>BUSAN · {{ label }}</span></div></template>
