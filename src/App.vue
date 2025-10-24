<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
    <div class="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
      <h1 class="text-2xl font-semibold mb-6 text-center text-blue-600">
        🏥 DiagnoX (Hospital Assistant)
      </h1>
      <RecommenderForm />
    </div>
    <footer class="mt-6 text-gray-500 text-sm">
      Powered by FastAPI + LLM
    </footer>
  </div>
</template>

<script setup>
import RecommenderForm from './components/RecommenderForm.vue'
</script>
