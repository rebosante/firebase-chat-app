<template>
  <div class="auth-container">
    <h2>Sign up / Sign in</h2>

    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" />
      <p v-if="errors.email" class="error">{{ errors.email }}</p>

      <input v-model="password" type="password" placeholder="Password" />
      <p v-if="errors.password" class="error">{{ errors.password }}</p>

      <button type="submit" :disabled="loading">Login</button>
    </form>

    <button @click="register" :disabled="loading">Register</button>
    <hr />
    <button class="google-button" @click="loginWithGoogle" :disabled="loading">
      Sign in with Google
    </button>

    <p v-if="errors.firebase" class="error">{{ errors.firebase }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { auth, googleProvider } from "@/services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const errors = ref({ email: "", password: "", firebase: "" });
const loading = ref(false);
const router = useRouter();

const validateForm = () => {
  errors.value.email = email.value.includes("@")
    ? ""
    : "Please, Type a valid email.";
  errors.value.password =
    password.value.length >= 6 ? "" : "Password must have 6 chars at least.";
  return !errors.value.email && !errors.value.password;
};

const login = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push("/chat");
  } catch (error) {
    errors.value.firebase = error.message;
  } finally {
    loading.value = false;
  }
};

const register = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    router.push("/chat");
  } catch (error) {
    errors.value.firebase = error.message;
  } finally {
    loading.value = false;
  }
};

const loginWithGoogle = async () => {
  try {
    loading.value = true;
    await signInWithPopup(auth, googleProvider);
    router.push("/chat");
  } catch (error) {
    errors.value.firebase = error.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  max-width: 340px;
  margin: auto;
  gap: 10px;
  text-align: center;
  justify-content: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

form > * {
  margin-bottom: 10px;
}

form button {
  width: 100%;
}

hr {
  width: 100%;
}

input {
  display: block;
  height: 30px;
  max-width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px 15px;
  border: none;
  background: #63abf7;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  height: 45px;
}

button:disabled {
  background: gray;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

.google-button {
  background: #f3134b;
  color: white;
}

.google-button:hover:not(:disabled) {
  background: #c51130;
}

.error {
  color: red;
  font-size: 0.75rem;
  margin-top: -8px;
}
</style>
